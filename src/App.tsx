import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileSpreadsheet, 
  Calendar, 
  Flame, 
  Ship as BoatIcon, 
  Activity, 
  Users, 
  Sliders, 
  Link2, 
  CheckCircle, 
  RefreshCw,
  Bell,
  HeartPulse,
  LifeBuoy
} from 'lucide-react';

import { Boat, FireExtinguisher, InspectionRecord, SheetsConfig, ExtinguisherType, MedicalKitStation, MedicalInspectionRecord, BoatLicenseState, LicenseInspectionRecord, MaintenanceRecord, BoatLifeJacketState, LifeJacketInspectionRecord, MaintenanceStatus } from './types';
import { BOATS, generateInitialExtinguishers, generateInitialMedicalStations, generateInitialBoatLicenses, generateInitialMaintenanceRecords, generateInitialLifeJackets } from './lib/initialData';
import { initAuth, googleSignIn, logout, setAccessToken } from './lib/auth';
import { 
  createInspectionSpreadsheet, 
  setupSpreadsheetHeaders, 
  syncCurrentExtinguishersToSheets, 
  appendInspectionsToHistorySheet,
  fetchSpreadsheetData,
  syncCurrentMedicalKitsToSheets,
  appendMedicalInspectionsToHistorySheet,
  syncMaintenanceToSheets
} from './lib/sheets';
import { uploadPhotoIfNeeded, uploadPhotosIfNeeded } from './lib/storage';
import { saveToCloud, loadAllFromCloud, isCloudAvailable } from './lib/firestore';

import Dashboard from './components/Dashboard';
import BoatList from './components/BoatList';
import InspectionForm from './components/InspectionForm';
import HistoryLog from './components/HistoryLog';
import MedicalSection from './components/MedicalSection';
import LicenseSection from './components/LicenseSection';
import MaintenanceSection from './components/MaintenanceSection';
import LifeJacketSection from './components/LifeJacketSection';

// Safe local storage proxy for sandboxed environments like Google Apps Script
const localStorage = (() => {
  try {
    const testKey = '__test';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (e) {
    const memoryStorage = new Map<string, string>();
    return {
      getItem: (key: string) => memoryStorage.get(key) || null,
      setItem: (key: string, value: string) => { memoryStorage.set(key, String(value)); },
      removeItem: (key: string) => { memoryStorage.delete(key); },
      clear: () => { memoryStorage.clear(); },
      get length() { return memoryStorage.size; },
      key: (index: number) => Array.from(memoryStorage.keys())[index] || null
    };
  }
})();

export default function App() {
  const [appModule, setAppModule] = useState<'security' | 'medical' | 'maintenance'>('security');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'boats' | 'lifejackets' | 'licenses' | 'history'>('dashboard');
  const [boats, setBoats] = useState<Boat[]>(BOATS);
  const [extinguishers, setExtinguishers] = useState<FireExtinguisher[]>([]);
  const [history, setHistory] = useState<InspectionRecord[]>([]);
  
  // Life Jackets state
  const [lifeJackets, setLifeJackets] = useState<BoatLifeJacketState[]>([]);
  const [lifeJacketHistory, setLifeJacketHistory] = useState<LifeJacketInspectionRecord[]>([]);
  
  // Licenses state
  const [boatLicenses, setBoatLicenses] = useState<BoatLicenseState[]>([]);
  const [licenseHistory, setLicenseHistory] = useState<LicenseInspectionRecord[]>([]);
  
  // Medical state
  const [medicalStations, setMedicalStations] = useState<MedicalKitStation[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalInspectionRecord[]>([]);

  // Maintenance state
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);

  
  // Auth & Google Sheets State
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfig>({
    spreadsheetId: null,
    spreadsheetUrl: null,
    lastSyncedAt: null,
  });

  // Loading States
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(true);
  
  // Inspection Modal State
  const [inspectingExt, setInspectingExt] = useState<FireExtinguisher | null>(null);
  const [selectedBoatId, setSelectedBoatId] = useState<string | null>(null);

  // App notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Load initial data on mount
  useEffect(() => {
    // 1. Initialize Fire Extinguishers
    const cachedExts = localStorage.getItem('boat_fire_extinguishers');
    if (cachedExts) {
      try {
        const parsed = JSON.parse(cachedExts);
        if (!Array.isArray(parsed)) {
          throw new Error('Not an array');
        }
        // Auto-migrate old boat names, IDs, and locations to keep standard alignment
        let migrated = false;
        const updated = parsed.map(ext => {
          let updatedExt = { ...ext };
          const boatDef = BOATS.find(b => b.id === ext.boatId);
          
          if (boatDef) {
            // Validate and migrate name
            if (ext.boatName !== boatDef.name) {
              updatedExt.boatName = boatDef.name;
              migrated = true;
            }

            // Validate and migrate ID from FE-XY format
            if (ext.id.startsWith('FE-') || !ext.id.includes('ถังที่')) {
              const lastChar = ext.id[ext.id.length - 1];
              updatedExt.id = `${boatDef.name}-ถังที่ ${lastChar}`;
              migrated = true;
            }
            
            // Validate and migrate location if mismatching
            const isFive = boatDef.totalExtinguishers === 5;
            const lastChar = updatedExt.id[updatedExt.id.length - 1];
            const extIdx = parseInt(lastChar, 10) - 1;
            
            const expectedLocs = isFive
              ? [
                  'หน้าทางเข้า-ออกฝั่งซ้าย',
                  'หน้าห้องนายท้ายฝั่งซ้าย',
                  'หน้าห้องนายท้ายฝั่งขวา',
                  'หน้าทางเข้า-ออกฝั่งขวา',
                  'ในห้องนายท้าย'
                ]
              : [
                  'หน้าทางเข้า-ออกฝั่งซ้าย',
                  'หน้าห้องนายท้ายฝั่งซ้าย',
                  'หน้าห้องนายท้ายฝั่งขวา',
                  'หน้าทางเข้า-ออกฝั่งขวา'
                ];
            
            const targetLoc = expectedLocs[extIdx] || expectedLocs[0];
            if (ext.location !== targetLoc) {
              updatedExt.location = targetLoc;
              migrated = true;
            }
          }
          return updatedExt;
        });
        setExtinguishers(updated);
        if (migrated) {
          localStorage.setItem('boat_fire_extinguishers', JSON.stringify(updated));
        }
      } catch (e) {
        const initial = generateInitialExtinguishers();
        setExtinguishers(initial);
        localStorage.setItem('boat_fire_extinguishers', JSON.stringify(initial));
      }
    } else {
      const initial = generateInitialExtinguishers();
      setExtinguishers(initial);
      localStorage.setItem('boat_fire_extinguishers', JSON.stringify(initial));
    }

    // 2. Initialize History Log
    const cachedHistory = localStorage.getItem('boat_inspection_history');
    if (cachedHistory) {
      try {
        const parsedHist = JSON.parse(cachedHistory);
        if (!Array.isArray(parsedHist)) {
          throw new Error('Not an array');
        }
        let migratedHist = false;
        const updatedHist = parsedHist.map(h => {
          let updatedH = { ...h };
          const boatDef = BOATS.find(b => b.id === h.boatId);
          if (boatDef) {
            if (h.boatName !== boatDef.name) {
              updatedH.boatName = boatDef.name;
              migratedHist = true;
            }

            // Validate and migrate ID from FE-XY format
            if (h.extinguisherId.startsWith('FE-') || !h.extinguisherId.includes('ถังที่')) {
              const lastChar = h.extinguisherId[h.extinguisherId.length - 1];
              updatedH.extinguisherId = `${boatDef.name}-ถังที่ ${lastChar}`;
              migratedHist = true;
            }
            
            // Migrate history location as well
            const isFive = boatDef.totalExtinguishers === 5;
            const lastChar = updatedH.extinguisherId[updatedH.extinguisherId.length - 1];
            const extIdx = parseInt(lastChar, 10) - 1;
            
            const expectedLocs = isFive
              ? [
                  'หน้าทางเข้า-ออกฝั่งซ้าย',
                  'หน้าห้องนายท้ายฝั่งซ้าย',
                  'หน้าห้องนายท้ายฝั่งขวา',
                  'หน้าทางเข้า-ออกฝั่งขวา',
                  'ในห้องนายท้าย'
                ]
              : [
                  'หน้าทางเข้า-ออกฝั่งซ้าย',
                  'หน้าห้องนายท้ายฝั่งซ้าย',
                  'หน้าห้องนายท้ายฝั่งขวา',
                  'หน้าทางเข้า-ออกฝั่งขวา'
                ];
            
            const targetLoc = expectedLocs[extIdx] || expectedLocs[0];
            if (h.location !== targetLoc) {
              updatedH.location = targetLoc;
              migratedHist = true;
            }
          }
          return updatedH;
        });
        setHistory(updatedHist);
        if (migratedHist) {
          localStorage.setItem('boat_inspection_history', JSON.stringify(updatedHist));
        }
      } catch (e) {
        setHistory([]);
      }
    } else {
      // Seed initial history matching our seed data in initialData
      const seedHistory: InspectionRecord[] = [
        {
          id: 'REC-12026061501',
          extinguisherId: 'CTB1-ถังที่ 1',
          boatId: 'boat-1',
          boatName: 'CTB1',
          location: 'หน้าทางเข้า-ออกฝั่งซ้าย',
          type: 'Dry Chemical',
          inspectionDate: '2026-06-15',
          expiryDate: '2027-06-15',
          inspectorName: 'สมชาย นาวาดี',
          pressureStatus: 'Normal',
          safetyPinStatus: 'Normal',
          tankStatus: 'Normal',
          hoseStatus: 'Normal',
          weightStatus: 'Normal',
          overallStatus: 'Pass',
          remarks: 'สภาพเรียบร้อยปกติ',
        },
        {
          id: 'REC-12026061801',
          extinguisherId: 'CTB2-ถังที่ 4',
          boatId: 'boat-2',
          boatName: 'CTB2',
          location: 'หน้าทางเข้า-ออกฝั่งขวา',
          type: 'Dry Chemical',
          inspectionDate: '2026-06-18',
          expiryDate: '2027-06-18',
          inspectorName: 'วิชัย รักเรือ',
          pressureStatus: 'Low',
          safetyPinStatus: 'Normal',
          tankStatus: 'Normal',
          hoseStatus: 'Normal',
          weightStatus: 'Normal',
          overallStatus: 'Fail',
          remarks: 'เกจวัดแรงดันตก ต้องรีบชาร์จใหม่หรือเปลี่ยนถังสำรอง',
        }
      ];
      setHistory(seedHistory);
      localStorage.setItem('boat_inspection_history', JSON.stringify(seedHistory));
    }

    // --- 2.5 Initialize Medical Kits & Piers ---
    const cachedMedStations = localStorage.getItem('boat_medical_stations');
    if (cachedMedStations) {
      try {
        const loaded = JSON.parse(cachedMedStations);
        if (!Array.isArray(loaded)) {
          throw new Error('Not an array');
        }
        const defaults = generateInitialMedicalStations();
        const updated = defaults.map(defaultItem => {
          const matchedLoaded = loaded.find(l => l.id === defaultItem.id);
          if (matchedLoaded) {
            return {
              ...defaultItem,
              paracetamolStatus: matchedLoaded.paracetamolStatus || 'Normal',
              paracetamolExpiry: matchedLoaded.paracetamolExpiry || '2027-12-31',
              motionSicknessStatus: matchedLoaded.motionSicknessStatus || 'Normal',
              motionSicknessExpiry: matchedLoaded.motionSicknessExpiry || '2027-10-15',
              ammoniaStatus: matchedLoaded.ammoniaStatus || 'Normal',
              ammoniaExpiry: matchedLoaded.ammoniaExpiry || '2027-08-30',
              bandagesStatus: matchedLoaded.bandagesStatus || 'Normal',
              bandagesExpiry: matchedLoaded.bandagesExpiry || '2028-05-01',
              antacidStatus: matchedLoaded.antacidStatus || 'Normal',
              antacidExpiry: matchedLoaded.antacidExpiry || '2027-11-15',
              cottonBudsStatus: matchedLoaded.cottonBudsStatus || 'Normal',
              cottonBudsExpiry: matchedLoaded.cottonBudsExpiry || '2028-02-10',
              betadineStatus: matchedLoaded.betadineStatus || 'Normal',
              betadineExpiry: matchedLoaded.betadineExpiry || '2027-11-20',
              salineStatus: matchedLoaded.salineStatus || 'Normal',
              salineExpiry: matchedLoaded.salineExpiry || '2028-01-15',
              gauzeStatus: matchedLoaded.gauzeStatus || 'Normal',
              gauzeExpiry: matchedLoaded.gauzeExpiry || '2028-06-30',
              surgicalTapeStatus: matchedLoaded.surgicalTapeStatus || 'Normal',
              surgicalTapeExpiry: matchedLoaded.surgicalTapeExpiry || '2028-04-20',
              cottonBallsStatus: matchedLoaded.cottonBallsStatus || 'Normal',
              cottonBallsExpiry: matchedLoaded.cottonBallsExpiry || '2028-03-15',
              containerStatus: matchedLoaded.containerStatus || 'Normal',
              lastInspectedDate: matchedLoaded.lastInspectedDate,
              lastInspector: matchedLoaded.lastInspector,
              overallStatus: matchedLoaded.overallStatus,
              remarks: matchedLoaded.remarks,
            };
          }
          return defaultItem;
        });
        setMedicalStations(updated);
        localStorage.setItem('boat_medical_stations', JSON.stringify(updated));
      } catch (e) {
        const initialMeds = generateInitialMedicalStations();
        setMedicalStations(initialMeds);
        localStorage.setItem('boat_medical_stations', JSON.stringify(initialMeds));
      }
    } else {
      const initialMeds = generateInitialMedicalStations();
      setMedicalStations(initialMeds);
      localStorage.setItem('boat_medical_stations', JSON.stringify(initialMeds));
    }

    const cachedMedHistory = localStorage.getItem('boat_medical_history');
    if (cachedMedHistory) {
      try {
        const parsedMedHist = JSON.parse(cachedMedHistory);
        if (!Array.isArray(parsedMedHist)) {
          throw new Error('Not an array');
        }
        // Upgrade history logs to prevent crashes and map cleanly
        const upgradedHistory = parsedMedHist.map(h => ({
          ...h,
          id: h.id || `MEDREC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          paracetamolStatus: h.paracetamolStatus || 'Normal',
          paracetamolExpiry: h.paracetamolExpiry || '2027-12-31',
          motionSicknessStatus: h.motionSicknessStatus || 'Normal',
          motionSicknessExpiry: h.motionSicknessExpiry || '2027-10-15',
          ammoniaStatus: h.ammoniaStatus || 'Normal',
          ammoniaExpiry: h.ammoniaExpiry || '2027-08-30',
          bandagesStatus: h.bandagesStatus || 'Normal',
          bandagesExpiry: h.bandagesExpiry || '2028-05-01',
          antacidStatus: h.antacidStatus || 'Normal',
          antacidExpiry: h.antacidExpiry || '2027-11-15',
          cottonBudsStatus: h.cottonBudsStatus || 'Normal',
          cottonBudsExpiry: h.cottonBudsExpiry || '2028-02-10',
          betadineStatus: h.betadineStatus || 'Normal',
          betadineExpiry: h.betadineExpiry || '2027-11-20',
          salineStatus: h.salineStatus || 'Normal',
          salineExpiry: h.salineExpiry || '2028-01-15',
          gauzeStatus: h.gauzeStatus || 'Normal',
          gauzeExpiry: h.gauzeExpiry || '2028-06-30',
          surgicalTapeStatus: h.surgicalTapeStatus || 'Normal',
          surgicalTapeExpiry: h.surgicalTapeExpiry || '2028-04-20',
          cottonBallsStatus: h.cottonBallsStatus || 'Normal',
          cottonBallsExpiry: h.cottonBallsExpiry || '2028-03-15',
          containerStatus: h.containerStatus || 'Normal',
        }));
        setMedicalHistory(upgradedHistory);
      } catch (e) {
        setMedicalHistory([]);
      }
    } else {
      const seedMedHistory: MedicalInspectionRecord[] = [
        {
          id: 'MEDREC-001',
          stationId: 'MED-BOAT-1',
          stationType: 'boat',
          targetName: 'CTB1',
          location: 'เคาน์เตอร์บริการผู้โดยสาร / ชั้นล่าง',
          inspectionDate: '2026-06-20',
          inspectorName: 'สมชาย นาวาดี',
          paracetamolStatus: 'Normal',
          paracetamolExpiry: '2027-12-31',
          motionSicknessStatus: 'Normal',
          motionSicknessExpiry: '2027-10-15',
          ammoniaStatus: 'Normal',
          ammoniaExpiry: '2027-08-30',
          bandagesStatus: 'Normal',
          bandagesExpiry: '2028-05-01',
          antacidStatus: 'Normal',
          antacidExpiry: '2027-11-15',
          cottonBudsStatus: 'Normal',
          cottonBudsExpiry: '2028-02-10',
          betadineStatus: 'Normal',
          betadineExpiry: '2027-11-20',
          salineStatus: 'Normal',
          salineExpiry: '2028-01-15',
          gauzeStatus: 'Normal',
          gauzeExpiry: '2028-06-30',
          surgicalTapeStatus: 'Normal',
          surgicalTapeExpiry: '2028-04-20',
          cottonBallsStatus: 'Normal',
          cottonBallsExpiry: '2028-03-15',
          containerStatus: 'Normal',
          overallStatus: 'Pass',
          remarks: 'ตู้อบแห้งและสะอาด ยาครบสมบูรณ์ทุกหมวดหมู่',
        },
        {
          id: 'MEDREC-002',
          stationId: 'MED-BOAT-2',
          stationType: 'boat',
          targetName: 'CTB2',
          location: 'เคาน์เตอร์บริการผู้โดยสาร / ชั้นล่าง',
          inspectionDate: '2026-06-19',
          inspectorName: 'วิชัย รักเรือ',
          paracetamolStatus: 'LowStock',
          paracetamolExpiry: '2026-12-31',
          motionSicknessStatus: 'Normal',
          motionSicknessExpiry: '2027-10-15',
          ammoniaStatus: 'Normal',
          ammoniaExpiry: '2027-08-30',
          bandagesStatus: 'Normal',
          bandagesExpiry: '2028-05-01',
          antacidStatus: 'Normal',
          antacidExpiry: '2027-11-15',
          cottonBudsStatus: 'Normal',
          cottonBudsExpiry: '2028-02-10',
          betadineStatus: 'Normal',
          betadineExpiry: '2027-11-20',
          salineStatus: 'Normal',
          salineExpiry: '2028-01-15',
          gauzeStatus: 'Normal',
          gauzeExpiry: '2028-06-30',
          surgicalTapeStatus: 'Normal',
          surgicalTapeExpiry: '2028-04-20',
          cottonBallsStatus: 'Normal',
          cottonBallsExpiry: '2028-03-15',
          containerStatus: 'Normal',
          overallStatus: 'Fail',
          remarks: 'พาราเซตามอลหมดค้างคลัง รอการเบิกเปลี่ยนในรอบสัปดาห์หน้า',
        },
        {
          id: 'MEDREC-003',
          stationId: 'MED-PIER-1',
          stationType: 'pier',
          targetName: 'ท่าสาทร (Sathorn)',
          location: 'ห้องปฐมพยาบาลหลัก / ศูนย์บริการลูกค้า',
          inspectionDate: '2026-06-22',
          inspectorName: 'อนุรักษ์ ล้อมแก้ว',
          paracetamolStatus: 'Normal',
          paracetamolExpiry: '2027-12-31',
          motionSicknessStatus: 'Normal',
          motionSicknessExpiry: '2027-10-15',
          ammoniaStatus: 'Normal',
          ammoniaExpiry: '2027-08-30',
          bandagesStatus: 'Normal',
          bandagesExpiry: '2028-05-01',
          antacidStatus: 'Normal',
          antacidExpiry: '2027-11-15',
          cottonBudsStatus: 'Normal',
          cottonBudsExpiry: '2028-02-10',
          betadineStatus: 'Normal',
          betadineExpiry: '2027-11-20',
          salineStatus: 'Normal',
          salineExpiry: '2028-01-15',
          gauzeStatus: 'Normal',
          gauzeExpiry: '2028-06-30',
          surgicalTapeStatus: 'Normal',
          surgicalTapeExpiry: '2028-04-20',
          cottonBallsStatus: 'Normal',
          cottonBallsExpiry: '2028-03-15',
          containerStatus: 'Normal',
          overallStatus: 'Pass',
          remarks: 'อุปกรณ์สมบูรณ์เรียบร้อยดี',
        }
      ];
      setMedicalHistory(seedMedHistory);
      localStorage.setItem('boat_medical_history', JSON.stringify(seedMedHistory));
    }

    // --- 2.8 Initialize Boat Licenses & History ---
    const cachedLicenses = localStorage.getItem('boat_licenses');
    if (cachedLicenses) {
      try {
        const loaded = JSON.parse(cachedLicenses);
        if (!Array.isArray(loaded)) {
          throw new Error('Not an array');
        }
        setBoatLicenses(loaded);
      } catch (e) {
        const initial = generateInitialBoatLicenses();
        setBoatLicenses(initial);
        localStorage.setItem('boat_licenses', JSON.stringify(initial));
      }
    } else {
      const initial = generateInitialBoatLicenses();
      setBoatLicenses(initial);
      localStorage.setItem('boat_licenses', JSON.stringify(initial));
    }

    const cachedLicenseHistory = localStorage.getItem('boat_license_history');
    if (cachedLicenseHistory) {
      try {
        const parsed = JSON.parse(cachedLicenseHistory);
        if (Array.isArray(parsed)) {
          const upgraded = parsed.map((h: any) => ({
            ...h,
            id: h.id || `LICREC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }));
          setLicenseHistory(upgraded);
        }
      } catch (e) {}
    } else {
      // Seed initial history matching our seeds in initialData
      const seedLicenseHistory: LicenseInspectionRecord[] = [
        {
          id: 'LICREC-1',
          boatId: 'boat-1',
          boatName: 'CTB1',
          inspectionDate: '2026-06-20',
          inspectorName: 'สมชาย นาวาดี',
          vesselLicenseNo: 'V-69-1000',
          vesselLicenseExpiry: '2027-01-10',
          vesselLicenseStatus: 'Normal',
          helmsmanName: 'นายกิตติพงษ์ ทองดี',
          helmsmanLicenseNo: 'C-67-3000',
          helmsmanLicenseExpiry: '2029-06-15',
          helmsmanLicenseStatus: 'Normal',
          engineerName: 'นายประสิทธิ์ พละงาน',
          engineerLicenseNo: 'M-68-5000',
          engineerLicenseIssue: '2020-03-20',
          engineerLicenseExpiry: '2030-03-20',
          engineerLicenseStatus: 'Normal',
          overallStatus: 'Pass',
          remarks: 'เอกสารและทีมพนักงานสะกดตรงกัน และใบสิทธิ์ไม่มีกำหนดเสี่ยง',
          vesselLicenseIssue: '2024-01-10',
          helmsmanLicenseIssue: '2024-06-15',
        }
      ];
      setLicenseHistory(seedLicenseHistory);
      localStorage.setItem('boat_license_history', JSON.stringify(seedLicenseHistory));
    }

    // --- 2.8.5 Initialize Boat Life Jackets & History ---
    const cachedLifeJackets = localStorage.getItem('boat_life_jackets');
    if (cachedLifeJackets) {
      try {
        const loaded = JSON.parse(cachedLifeJackets);
        if (!Array.isArray(loaded)) {
          throw new Error('Not an array');
        }

        // Upgrade cached seats if they don't have the updated seat counts (130 for CTB, 126 for R)
        const needsUpgrade = loaded.some(boatState => {
          const isCTB = boatState.boatName?.toUpperCase().startsWith('CTB');
          const seatCount = boatState.seats?.length || 0;
          return isCTB ? (seatCount !== 130) : (seatCount !== 126);
        });

        if (needsUpgrade) {
          const initial = generateInitialLifeJackets();
          setLifeJackets(initial);
          localStorage.setItem('boat_life_jackets', JSON.stringify(initial));
        } else {
          setLifeJackets(loaded);
        }
      } catch (e) {
        const initial = generateInitialLifeJackets();
        setLifeJackets(initial);
        localStorage.setItem('boat_life_jackets', JSON.stringify(initial));
      }
    } else {
      const initial = generateInitialLifeJackets();
      setLifeJackets(initial);
      localStorage.setItem('boat_life_jackets', JSON.stringify(initial));
    }

    const cachedLifeJacketHistory = localStorage.getItem('boat_life_jacket_history');
    if (cachedLifeJacketHistory) {
      try {
        const parsed = JSON.parse(cachedLifeJacketHistory);
        if (Array.isArray(parsed)) {
          const upgraded = parsed.map((h: any) => ({
            ...h,
            id: h.id || `LJREC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }));
          setLifeJacketHistory(upgraded);
        }
      } catch (e) {}
    } else {
      const seedHistory: LifeJacketInspectionRecord[] = [
        {
          id: 'LJRECHIST-1',
          boatId: 'boat-1',
          boatName: 'CTB1',
          inspectionDate: '2026-06-20',
          inspectorName: 'สมชาย นาวาดี',
          totalAdults: 80,
          totalKids: 15,
          adultsStatus: 'Normal',
          kidsStatus: 'Normal',
          whistleStatus: 'Normal',
          lightStatus: 'Normal',
          cabinetStatus: 'Normal',
          overallStatus: 'Pass',
          remarks: 'เสื้อชูชีพและนกหวีดพร้อมใช้งานอยู่ในตู้จัดเก็บเรียบร้อย ค้นหาง่าย',
        }
      ];
      setLifeJacketHistory(seedHistory);
      localStorage.setItem('boat_life_jacket_history', JSON.stringify(seedHistory));
    }

    // --- 2.9 Initialize Boat Maintenance Logs ---
    const cachedMaintenance = localStorage.getItem('boat_maintenance_history');
    if (cachedMaintenance) {
      try {
        const parsed = JSON.parse(cachedMaintenance);
        if (Array.isArray(parsed)) {
          // If the cached default records do not have photos or partRepaired field, let's refresh with default records to show the pictures and equipment parts
          const firstRecord = parsed.find(p => p.id === 'MAINREC-001');
          const hasPartRepaired = firstRecord && ('partRepaired' in firstRecord);
          if (firstRecord && (!firstRecord.photos || firstRecord.photos.length === 0 || !hasPartRepaired)) {
            const initial = generateInitialMaintenanceRecords();
            setMaintenanceRecords(initial);
            localStorage.setItem('boat_maintenance_history', JSON.stringify(initial));
          } else {
            setMaintenanceRecords(parsed);
          }
        } else {
          throw new Error('Not an array');
        }
      } catch (e) {
        const initial = generateInitialMaintenanceRecords();
        setMaintenanceRecords(initial);
        localStorage.setItem('boat_maintenance_history', JSON.stringify(initial));
      }
    } else {
      const initial = generateInitialMaintenanceRecords();
      setMaintenanceRecords(initial);
      localStorage.setItem('boat_maintenance_history', JSON.stringify(initial));
    }

    // 3. Initialize Google Sheets config
    const cachedSheets = localStorage.getItem('boat_sheets_config');
    if (cachedSheets) {
      try {
        setSheetsConfig(JSON.parse(cachedSheets));
      } catch (e) {}
    }

    // 4. Initialize Auth State
    const queryParams = new URLSearchParams(window.location.search);
    const gasData = (window as any).googleAppsScriptData || {};
    const passedToken = queryParams.get('token') || gasData.token;
    const passedEmail = queryParams.get('email') || gasData.email;

    if (passedToken) {
      setAccessTokenState(passedToken);
      setAccessToken(passedToken);
      setUser({
        email: passedEmail || 'appsscript_user@chaophrayatouristboat.com',
        displayName: (passedEmail || 'Google Apps Script User').split('@')[0],
        uid: 'appsscript_user',
        photoURL: null,
        emailVerified: true,
      } as any);
      triggerToast('เชื่อมต่อสิทธิ์ผ่าน Google Apps Script สำเร็จ', 'success');
    } else {
      initAuth(
        (currentUser, token) => {
          setUser(currentUser);
          setAccessTokenState(token);
          setAccessToken(token); // sync to global auth library import ref
        },
        () => {
          // Not logged in or expired
          setUser(null);
          setAccessTokenState(null);
          setAccessToken(null);
        }
      );
    }

    // Hide Google Apps Script parent loader if running embedded
    if (typeof (window as any).hideLoader === 'function') {
      (window as any).hideLoader();
    }
  }, []);

  // ======== Cloud Sync: Load from Firestore on mount ========
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cloudData = await loadAllFromCloud();
        if (cancelled) return;

        if (!cloudData || Object.keys(cloudData).length === 0) {
          console.log('[CloudSync] Firestore is empty. Seeding with local localStorage data...');
          const keys = [
            'boat_fire_extinguishers',
            'boat_inspection_history',
            'boat_medical_stations',
            'boat_medical_history',
            'boat_licenses',
            'boat_license_history',
            'boat_life_jackets',
            'boat_life_jacket_history',
            'boat_maintenance_history'
          ];
          for (const key of keys) {
            const localVal = localStorage.getItem(key);
            if (localVal) {
              try {
                await saveToCloud(key, JSON.parse(localVal));
              } catch (e) {
                console.error(`[CloudSync] Auto-seed failed for ${key}:`, e);
              }
            }
          }
          setIsCloudLoading(false);
          return;
        }

        // Only override if cloud has actual data for each key
        if (cloudData['boat_fire_extinguishers'] && Array.isArray(cloudData['boat_fire_extinguishers']) && cloudData['boat_fire_extinguishers'].length > 0) {
          setExtinguishers(cloudData['boat_fire_extinguishers']);
          localStorage.setItem('boat_fire_extinguishers', JSON.stringify(cloudData['boat_fire_extinguishers']));
        }
        if (cloudData['boat_inspection_history'] && Array.isArray(cloudData['boat_inspection_history'])) {
          setHistory(cloudData['boat_inspection_history']);
          localStorage.setItem('boat_inspection_history', JSON.stringify(cloudData['boat_inspection_history']));
        }
        if (cloudData['boat_medical_stations'] && Array.isArray(cloudData['boat_medical_stations']) && cloudData['boat_medical_stations'].length > 0) {
          setMedicalStations(cloudData['boat_medical_stations']);
          localStorage.setItem('boat_medical_stations', JSON.stringify(cloudData['boat_medical_stations']));
        }
        if (cloudData['boat_medical_history'] && Array.isArray(cloudData['boat_medical_history'])) {
          setMedicalHistory(cloudData['boat_medical_history']);
          localStorage.setItem('boat_medical_history', JSON.stringify(cloudData['boat_medical_history']));
        }
        if (cloudData['boat_licenses'] && Array.isArray(cloudData['boat_licenses']) && cloudData['boat_licenses'].length > 0) {
          setBoatLicenses(cloudData['boat_licenses']);
          localStorage.setItem('boat_licenses', JSON.stringify(cloudData['boat_licenses']));
        }
        if (cloudData['boat_license_history'] && Array.isArray(cloudData['boat_license_history'])) {
          setLicenseHistory(cloudData['boat_license_history']);
          localStorage.setItem('boat_license_history', JSON.stringify(cloudData['boat_license_history']));
        }
        if (cloudData['boat_life_jackets'] && Array.isArray(cloudData['boat_life_jackets']) && cloudData['boat_life_jackets'].length > 0) {
          setLifeJackets(cloudData['boat_life_jackets']);
          localStorage.setItem('boat_life_jackets', JSON.stringify(cloudData['boat_life_jackets']));
        }
        if (cloudData['boat_life_jacket_history'] && Array.isArray(cloudData['boat_life_jacket_history'])) {
          setLifeJacketHistory(cloudData['boat_life_jacket_history']);
          localStorage.setItem('boat_life_jacket_history', JSON.stringify(cloudData['boat_life_jacket_history']));
        }
        if (cloudData['boat_maintenance_history'] && Array.isArray(cloudData['boat_maintenance_history']) && cloudData['boat_maintenance_history'].length > 0) {
          setMaintenanceRecords(cloudData['boat_maintenance_history']);
          localStorage.setItem('boat_maintenance_history', JSON.stringify(cloudData['boat_maintenance_history']));
        }

        console.log('[CloudSync] Successfully loaded data from Firestore');
      } catch (err) {
        console.warn('[CloudSync] Failed to load from cloud, using localStorage:', err);
      } finally {
        if (!cancelled) setIsCloudLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Show dynamic notification helper
  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // ======== Persist data to both localStorage AND Firestore ========
  const persistData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    saveToCloud(key, data).catch(() => {}); // fire-and-forget cloud save
  };

  const handlePushToCloud = async () => {
    setIsSyncing(true);
    try {
      const dataToSave = {
        'boat_fire_extinguishers': extinguishers,
        'boat_inspection_history': history,
        'boat_medical_stations': medicalStations,
        'boat_medical_history': medicalHistory,
        'boat_licenses': boatLicenses,
        'boat_license_history': licenseHistory,
        'boat_life_jackets': lifeJackets,
        'boat_life_jacket_history': lifeJacketHistory,
        'boat_maintenance_history': maintenanceRecords,
      };

      for (const [key, val] of Object.entries(dataToSave)) {
        await saveToCloud(key, val);
      }
      triggerToast('ส่งข้อมูลของเครื่องนี้ขึ้นระบบคลาวด์สำเร็จแล้ว! ทุกเครื่องจะเห็นตรงกัน', 'success');
    } catch (error: any) {
      console.error(error);
      triggerToast('ไม่สามารถส่งข้อมูลขึ้นคลาวด์ได้: กรุณาตรวจสอบการตั้งค่าฐานข้อมูล', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromCloud = async () => {
    setIsSyncing(true);
    try {
      const cloudData = await loadAllFromCloud();
      if (!cloudData || Object.keys(cloudData).length === 0) {
        triggerToast('ไม่พบข้อมูลบนระบบคลาวด์หรือฐานข้อมูลยังว่างอยู่', 'info');
        return;
      }

      if (cloudData['boat_fire_extinguishers']) {
        setExtinguishers(cloudData['boat_fire_extinguishers']);
        localStorage.setItem('boat_fire_extinguishers', JSON.stringify(cloudData['boat_fire_extinguishers']));
      }
      if (cloudData['boat_inspection_history']) {
        setHistory(cloudData['boat_inspection_history']);
        localStorage.setItem('boat_inspection_history', JSON.stringify(cloudData['boat_inspection_history']));
      }
      if (cloudData['boat_medical_stations']) {
        setMedicalStations(cloudData['boat_medical_stations']);
        localStorage.setItem('boat_medical_stations', JSON.stringify(cloudData['boat_medical_stations']));
      }
      if (cloudData['boat_medical_history']) {
        setMedicalHistory(cloudData['boat_medical_history']);
        localStorage.setItem('boat_medical_history', JSON.stringify(cloudData['boat_medical_history']));
      }
      if (cloudData['boat_licenses']) {
        setBoatLicenses(cloudData['boat_licenses']);
        localStorage.setItem('boat_licenses', JSON.stringify(cloudData['boat_licenses']));
      }
      if (cloudData['boat_license_history']) {
        setLicenseHistory(cloudData['boat_license_history']);
        localStorage.setItem('boat_license_history', JSON.stringify(cloudData['boat_license_history']));
      }
      if (cloudData['boat_life_jackets']) {
        setLifeJackets(cloudData['boat_life_jackets']);
        localStorage.setItem('boat_life_jackets', JSON.stringify(cloudData['boat_life_jackets']));
      }
      if (cloudData['boat_life_jacket_history']) {
        setLifeJacketHistory(cloudData['boat_life_jacket_history']);
        localStorage.setItem('boat_life_jacket_history', JSON.stringify(cloudData['boat_life_jacket_history']));
      }
      if (cloudData['boat_maintenance_history']) {
        setMaintenanceRecords(cloudData['boat_maintenance_history']);
        localStorage.setItem('boat_maintenance_history', JSON.stringify(cloudData['boat_maintenance_history']));
      }

      triggerToast('ดึงข้อมูลล่าสุดจากระบบคลาวด์ลงเครื่องนี้เรียบร้อยแล้ว!', 'success');
    } catch (error: any) {
      console.error(error);
      triggerToast('ไม่สามารถดึงข้อมูลได้: กรุณาตรวจสอบอินเทอร์เน็ต', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Google OAuth Login
  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessTokenState(result.accessToken);
        triggerToast(`ยินดีต้อนรับคุณ ${result.user.displayName || 'กรรมการเรือ'} เข้าสู่ระบบ!`, 'success');
        
        // If they already have a sheets ID in local storage, let's restore/re-fetch or just update token connection
        const cachedSheets = localStorage.getItem('boat_sheets_config');
        if (cachedSheets) {
          const config = JSON.parse(cachedSheets);
          setSheetsConfig(config);
        }
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      triggerToast('เข้าสู่ระบบไม่สำเร็จ: ได้ปฏิเสธการสิทธิ์หรือการอนุญาต', 'error');
    }
  };

  // Logout Google Auth
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAccessTokenState(null);
      triggerToast('ออกจากระบบสิทธิ์ Google เรียบร้อยแล้ว', 'info');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Create Google Spreadsheet in User's Drive
  const handleCreateSheet = async () => {
    if (!accessToken) {
      triggerToast('กรุณาเชื่อมบัญชีผู้ใช้อีเมลก่อนทำรายการ', 'error');
      return;
    }

    setIsCreatingSheet(true);
    try {
      // 1. Create spreadsheet file
      const result = await createInspectionSpreadsheet(accessToken);
      
      // 2. Setup sheet headers with Thai local labels
      await setupSpreadsheetHeaders(accessToken, result.id);

      const newConfig: SheetsConfig = {
        spreadsheetId: result.id,
        spreadsheetUrl: result.url,
        lastSyncedAt: new Date().toLocaleString('th-TH'),
      };

      // 3. Save config
      setSheetsConfig(newConfig);
      localStorage.setItem('boat_sheets_config', JSON.stringify(newConfig));
      triggerToast('สร้างสเปรดชีตความปลอดภัยสำเร็จใน Google Drive ของคุณ!', 'success');

      // 4. Do an automatic initial full sync to Google Sheets
      await performFullSheetSync(accessToken, result.id);

    } catch (error: any) {
      console.error('Sheets registration failure:', error);
      triggerToast(`ไม่สามารถสร้างชีตความปลอดภัย: ${error.message || 'โครงเครือข่ายบกพร่อง'}`, 'error');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Sync state helper to write back all current items and history log
  const performFullSheetSync = async (token: string, sheetId: string) => {
    setIsSyncing(true);
    try {
      // Sync current extinguishers list
      await syncCurrentExtinguishersToSheets(token, sheetId, extinguishers);
      
      // Sync history logs to history sheet
      if (history.length > 0) {
        await appendInspectionsToHistorySheet(token, sheetId, history);
      }

      // Sync current medical stations list
      if (medicalStations.length > 0) {
        await syncCurrentMedicalKitsToSheets(token, sheetId, medicalStations);
      }

      // Sync medical history logs to medical history sheet
      if (medicalHistory.length > 0) {
        await appendMedicalInspectionsToHistorySheet(token, sheetId, medicalHistory);
      }

      // Sync maintenance records to maintenance sheet
      if (maintenanceRecords.length > 0) {
        await syncMaintenanceToSheets(token, sheetId, maintenanceRecords);
      }

      // Update config date
      const updatedConfig = {
        ...sheetsConfig,
        spreadsheetId: sheetId,
        spreadsheetUrl: sheetsConfig.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${sheetId}`,
        lastSyncedAt: new Date().toLocaleString('th-TH'),
      };
      setSheetsConfig(updatedConfig);
      localStorage.setItem('boat_sheets_config', JSON.stringify(updatedConfig));
      triggerToast('บันทึกและส่งรายงานผลการตรวจสอบเชื่อมโยง Google Sheets เรียบร้อย!', 'success');
    } catch (error: any) {
      console.error('Sync process failed:', error);
      triggerToast(`การถ่ายโอนซิงโครไนซ์ล่าช้า: ${error.message || 'ตรวจสอบสิทธิ์หมดอายุ'}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual Sync trigger button
  const handleManualSync = () => {
    if (!accessToken || !sheetsConfig.spreadsheetId) {
      triggerToast('กรุณาสร้างสเปรดชีตเชื่อมงานก่อนทำรายการซิงค์', 'error');
      return;
    }
    performFullSheetSync(accessToken, sheetsConfig.spreadsheetId);
  };

  // Inspect save logic
  const handleSaveInspection = async (recordData: Omit<InspectionRecord, 'id'>, updatedType?: ExtinguisherType, updatedSize?: string) => {
    if (!inspectingExt) return;

    const newRecordId = `REC-${Date.now()}`;
    const uploadedPhotoUrl = await uploadPhotoIfNeeded(recordData.photoUrl, 'inspection-photos', newRecordId);

    const newRecord: InspectionRecord = {
      ...recordData,
      id: newRecordId,
      photoUrl: uploadedPhotoUrl,
    };

    const newHistory = [newRecord, ...history];
    setHistory(newHistory);
    persistData('boat_inspection_history', newHistory);

    const updatedExts = extinguishers.map((e) => {
      if (e.id === inspectingExt.id) {
        return {
          ...e,
          type: updatedType || e.type,
          size: updatedSize || e.size,
          pressureStatus: recordData.pressureStatus,
          safetyPinStatus: recordData.safetyPinStatus,
          tankStatus: recordData.tankStatus,
          hoseStatus: recordData.hoseStatus,
          weightStatus: recordData.weightStatus,
          lastInspectedDate: recordData.inspectionDate,
          lastInspector: recordData.inspectorName,
          overallStatus: recordData.overallStatus,
          expiryDate: recordData.expiryDate,
          remarks: recordData.remarks,
          lastPhotoUrl: uploadedPhotoUrl,
        };
      }
      return e;
    });

    setExtinguishers(updatedExts);
    persistData('boat_fire_extinguishers', updatedExts);

    triggerToast(`บันทึกผลตรวจสอบถังดับเพลิง ${inspectingExt.id} เสร็จสิ้นแล้ว!`, 'success');

    if (accessToken && sheetsConfig.spreadsheetId) {
      syncCurrentExtinguishersToSheets(accessToken, sheetsConfig.spreadsheetId, updatedExts)
        .then(() => appendInspectionsToHistorySheet(accessToken, sheetsConfig.spreadsheetId, [newRecord]))
        .then(() => {
          const updatedConfig = {
            ...sheetsConfig,
            lastSyncedAt: new Date().toLocaleString('th-TH'),
          };
          setSheetsConfig(updatedConfig);
          localStorage.setItem('boat_sheets_config', JSON.stringify(updatedConfig));
          triggerToast(`ซิงโครไนซ์อัตโนมัติไปยัง Google Sheets ครบถ้วน!`, 'success');
        })
        .catch((err) => {
          console.error('Background sheet auto-sync error:', err);
          triggerToast('การบันทึกเครื่องสำเร็จเรียบร้อย แต่ซิงค์คลาวด์ล่าช้าชั่วคราว', 'info');
        });
    }

    setInspectingExt(null);
  };

  // Medical Inspection save logic
  const handleSaveMedicalInspection = async (recordData: Omit<MedicalInspectionRecord, 'id'>) => {
    const newRecordId = `MEDREC-${Date.now()}`;
    const uploadedPhotoUrl = await uploadPhotoIfNeeded(recordData.photoUrl, 'medical-photos', newRecordId);

    const newRecord: MedicalInspectionRecord = {
      ...recordData,
      id: newRecordId,
      photoUrl: uploadedPhotoUrl,
    };

    const newHistory = [newRecord, ...medicalHistory];
    setMedicalHistory(newHistory);
    persistData('boat_medical_history', newHistory);

    const updatedStations = medicalStations.map((st) => {
      if (st.id === recordData.stationId) {
        return {
          ...st,
          paracetamolStatus: recordData.paracetamolStatus,
          paracetamolExpiry: recordData.paracetamolExpiry,
          motionSicknessStatus: recordData.motionSicknessStatus,
          motionSicknessExpiry: recordData.motionSicknessExpiry,
          ammoniaStatus: recordData.ammoniaStatus,
          ammoniaExpiry: recordData.ammoniaExpiry,
          bandagesStatus: recordData.bandagesStatus,
          bandagesExpiry: recordData.bandagesExpiry,
          antacidStatus: recordData.antacidStatus,
          antacidExpiry: recordData.antacidExpiry,
          cottonBudsStatus: recordData.cottonBudsStatus,
          cottonBudsExpiry: recordData.cottonBudsExpiry,
          betadineStatus: recordData.betadineStatus,
          betadineExpiry: recordData.betadineExpiry,
          salineStatus: recordData.salineStatus,
          salineExpiry: recordData.salineExpiry,
          gauzeStatus: recordData.gauzeStatus,
          gauzeExpiry: recordData.gauzeExpiry,
          surgicalTapeStatus: recordData.surgicalTapeStatus,
          surgicalTapeExpiry: recordData.surgicalTapeExpiry,
          cottonBallsStatus: recordData.cottonBallsStatus,
          cottonBallsExpiry: recordData.cottonBallsExpiry,
          containerStatus: recordData.containerStatus,
          lastInspectedDate: recordData.inspectionDate,
          lastInspector: recordData.inspectorName,
          overallStatus: recordData.overallStatus === 'Pass' ? 'Pass' as any : 'Fail' as any,
          remarks: recordData.remarks,
          lastPhotoUrl: uploadedPhotoUrl,
        };
      }
      return st;
    });

    setMedicalStations(updatedStations);
    persistData('boat_medical_stations', updatedStations);

    triggerToast(`บันทึกการตรวจเช็คเวชภัณฑ์สำหรับ ${recordData.targetName} เรียบร้อยแล้ว!`, 'success');

    if (accessToken && sheetsConfig.spreadsheetId) {
      syncCurrentMedicalKitsToSheets(accessToken, sheetsConfig.spreadsheetId, updatedStations)
        .then(() => appendMedicalInspectionsToHistorySheet(accessToken, sheetsConfig.spreadsheetId, [newRecord]))
        .then(() => {
          const updatedConfig = {
            ...sheetsConfig,
            lastSyncedAt: new Date().toLocaleString('th-TH'),
          };
          setSheetsConfig(updatedConfig);
          localStorage.setItem('boat_sheets_config', JSON.stringify(updatedConfig));
          triggerToast(`ซิงโครไนซ์เวชภัณฑ์อัตโนมัติไปยัง Google Sheets สำเร็จ!`, 'success');
        })
        .catch((err) => {
          console.error('Background medical sheet auto-sync error:', err);
          triggerToast('การบันทึกเครื่องสำเร็จเรียบร้อย แต่ซิงค์คลาวด์ล่าช้าชั่วคราว', 'info');
        });
    }
  };

  const handleDeleteMedicalInspection = (id: string) => {
    if (!id) return;
    if (!window.confirm('คุณต้องการลบประวัติการตรวจสอบเวชภัณฑ์นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    const newHistory = medicalHistory.filter(h => h.id !== id);
    setMedicalHistory(newHistory);
    persistData('boat_medical_history', newHistory);
    triggerToast('ลบประวัติการตรวจสอบเวชภัณฑ์สำเร็จ', 'info');
  };

  // Boat License Inspection save logic
  const handleSaveLicenseInspection = async (recordData: Omit<LicenseInspectionRecord, 'id'>) => {
    const newRecordId = `LICREC-${Date.now()}`;
    const uploadedVesselPhotoUrl = await uploadPhotoIfNeeded(recordData.vesselPhotoUrl, 'license-photos', `${newRecordId}-vessel`);
    const uploadedHelmsmanPhotoUrl = await uploadPhotoIfNeeded(recordData.helmsmanPhotoUrl, 'license-photos', `${newRecordId}-helmsman`);
    const uploadedEngineerPhotoUrl = await uploadPhotoIfNeeded(recordData.engineerPhotoUrl, 'license-photos', `${newRecordId}-engineer`);

    const newRecord: LicenseInspectionRecord = {
      ...recordData,
      id: newRecordId,
      vesselPhotoUrl: uploadedVesselPhotoUrl,
      helmsmanPhotoUrl: uploadedHelmsmanPhotoUrl,
      engineerPhotoUrl: uploadedEngineerPhotoUrl,
    };

    const newHistory = [newRecord, ...licenseHistory];
    setLicenseHistory(newHistory);
    persistData('boat_license_history', newHistory);

    const updatedLicenses = boatLicenses.map((b) => {
      if (b.boatId === recordData.boatId) {
        return {
          ...b,
          vesselLicenseNo: recordData.vesselLicenseNo,
          vesselLicenseExpiry: recordData.vesselLicenseExpiry,
          vesselLicenseStatus: recordData.vesselLicenseStatus,
          helmsmanName: recordData.helmsmanName,
          helmsmanLicenseNo: recordData.helmsmanLicenseNo,
          helmsmanLicenseExpiry: recordData.helmsmanLicenseExpiry,
          helmsmanLicenseStatus: recordData.helmsmanLicenseStatus,
          engineerName: recordData.engineerName,
          engineerLicenseNo: recordData.engineerLicenseNo,
          engineerLicenseExpiry: recordData.engineerLicenseExpiry,
          engineerLicenseStatus: recordData.engineerLicenseStatus,
          lastInspectedDate: recordData.inspectionDate,
          lastInspector: recordData.inspectorName,
          overallStatus: recordData.overallStatus,
          remarks: recordData.remarks,
          vesselPhotoUrl: uploadedVesselPhotoUrl,
          helmsmanPhotoUrl: uploadedHelmsmanPhotoUrl,
          engineerPhotoUrl: uploadedEngineerPhotoUrl,
        };
      }
      return b;
    });

    setBoatLicenses(updatedLicenses);
    persistData('boat_licenses', updatedLicenses);

    triggerToast(`บันทึกการส่งตรวจสอบใบอนุญาตของเรือ ${recordData.boatName} เสร็จสิ้น!`, 'success');
  };

  const handleDeleteLicenseInspection = (id: string) => {
    if (!id) return;
    if (!window.confirm('คุณต้องการลบประวัติการตรวจสอบใบอนุญาตนี้ใช่หรือไม่?')) return;
    const newHistory = licenseHistory.filter(h => h.id !== id);
    setLicenseHistory(newHistory);
    persistData('boat_license_history', newHistory);
    triggerToast('ลบประวัติการตรวจสอบใบอนุญาตสำเร็จ', 'info');
  };

  // Boat Life Jacket Inspection save logic
  const handleSaveLifeJacketInspection = async (recordData: LifeJacketInspectionRecord | Omit<LifeJacketInspectionRecord, 'id'>) => {
    let updatedHistory = [...lifeJacketHistory];
    let recordWithId: LifeJacketInspectionRecord;
    const isNewRecord = !('id' in recordData && recordData.id);
    const recordId = isNewRecord ? `LJREC-${Date.now()}` : recordData.id;
    const uploadedPhotoUrl = await uploadPhotoIfNeeded(recordData.photoUrl, 'lifejacket-photos', recordId);

    if ('id' in recordData && recordData.id) {
      recordWithId = {
        ...(recordData as LifeJacketInspectionRecord),
        photoUrl: uploadedPhotoUrl,
      };
      updatedHistory = updatedHistory.map((rec) => rec.id === recordWithId.id ? recordWithId : rec);
    } else {
      recordWithId = {
        ...(recordData as Omit<LifeJacketInspectionRecord, 'id'>),
        id: recordId,
        photoUrl: uploadedPhotoUrl,
      } as LifeJacketInspectionRecord;
      updatedHistory = [recordWithId, ...updatedHistory];
    }

    setLifeJacketHistory(updatedHistory);
    persistData('boat_life_jacket_history', updatedHistory);

    const updatedJackets = lifeJackets.map((b) => {
      if (b.boatId === recordWithId.boatId) {
        return {
          ...b,
          totalAdults: recordWithId.totalAdults,
          totalKids: recordWithId.totalKids,
          adultsStatus: recordWithId.adultsStatus,
          kidsStatus: recordWithId.kidsStatus,
          whistleStatus: recordWithId.whistleStatus,
          lightStatus: recordWithId.lightStatus,
          cabinetStatus: recordWithId.cabinetStatus,
          lastInspectedDate: recordWithId.inspectionDate,
          lastInspector: recordWithId.inspectorName,
          overallStatus: recordWithId.overallStatus,
          remarks: recordWithId.remarks,
          photoUrl: uploadedPhotoUrl,
          seats: recordWithId.seats || b.seats,
        };
      }
      return b;
    });

    setLifeJackets(updatedJackets);
    persistData('boat_life_jackets', updatedJackets);

    triggerToast(`บันทึกการตรวจสอบเสื้อชูชีพของเรือ ${recordWithId.boatName} สำเร็จ!`, 'success');
  };

  const handleDeleteLifeJacketInspection = (id: string) => {
    if (!id) return;
    if (!window.confirm('คุณต้องการลบประวัติการตรวจสอบเสื้อชูชีพนี้ใช่หรือไม่?')) return;
    const newHistory = lifeJacketHistory.filter(h => h.id !== id);
    setLifeJacketHistory(newHistory);
    persistData('boat_life_jacket_history', newHistory);
    triggerToast('ลบประวัติการตรวจสอบเสื้อชูชีพสำเร็จ', 'info');
  };

  const handleDeleteExtinguisherInspection = (id: string) => {
    if (!id) return;
    if (!window.confirm('คุณต้องการลบประวัติการตรวจสอบถังดับเพลิงนี้ใช่หรือไม่?')) return;
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    persistData('boat_inspection_history', newHistory);
    triggerToast('ลบประวัติการตรวจสอบถังดับเพลิงสำเร็จ', 'info');
  };

  const handleDeleteUnifiedRecord = (id: string, category: 'extinguisher' | 'lifejacket' | 'license' | 'medical') => {
    switch (category) {
      case 'extinguisher':
        handleDeleteExtinguisherInspection(id);
        break;
      case 'lifejacket':
        handleDeleteLifeJacketInspection(id);
        break;
      case 'license':
        handleDeleteLicenseInspection(id);
        break;
      case 'medical':
        handleDeleteMedicalInspection(id);
        break;
    }
  };

  // Boat Maintenance save logic
  const handleSaveMaintenanceRecord = async (recordData: Omit<MaintenanceRecord, 'id'>) => {
    const newRecordId = `MAINREC-${Date.now()}`;
    const uploadedPhotos = await uploadPhotosIfNeeded(recordData.photos, 'maintenance-photos', newRecordId);

    const newRecord: MaintenanceRecord = {
      ...recordData,
      id: newRecordId,
      photos: uploadedPhotos,
    };

    const updatedRecords = [newRecord, ...maintenanceRecords];
    setMaintenanceRecords(updatedRecords);
    persistData('boat_maintenance_history', updatedRecords);

    triggerToast(`บันทึกข้อมูลการซ่อมบำรุงเรือ ${recordData.boatName} สำเร็จ!`, 'success');

    if (accessToken && sheetsConfig.spreadsheetId) {
      syncMaintenanceToSheets(accessToken, sheetsConfig.spreadsheetId, updatedRecords)
        .then(() => {
          const updatedConfig = {
            ...sheetsConfig,
            lastSyncedAt: new Date().toLocaleString('th-TH'),
          };
          setSheetsConfig(updatedConfig);
          localStorage.setItem('boat_sheets_config', JSON.stringify(updatedConfig));
          triggerToast(`ซิงโครไนซ์บันทึกการซ่อมบำรุงเรือไปยัง Google Sheets สำเร็จ!`, 'success');
        })
        .catch((err) => {
          console.error('Background maintenance auto-sync error:', err);
          triggerToast('การบันทึกเครื่องสำเร็จเรียบร้อย แต่ซิงค์คลาวด์ล่าช้าชั่วคราว', 'info');
        });
    }
  };

  // Boat Maintenance delete logic
  const handleDeleteMaintenanceRecord = (id: string) => {
    const updatedRecords = maintenanceRecords.filter((r) => r.id !== id);
    setMaintenanceRecords(updatedRecords);
    persistData('boat_maintenance_history', updatedRecords);
    triggerToast('ลบบันทึกประวัติการซ่อมบำรุงเรียบร้อยแล้ว', 'info');

    // Auto sync to connected Google Sheet if authenticated and configured
    if (accessToken && sheetsConfig.spreadsheetId) {
      syncMaintenanceToSheets(accessToken, sheetsConfig.spreadsheetId, updatedRecords)
        .then(() => {
          const updatedConfig = {
            ...sheetsConfig,
            lastSyncedAt: new Date().toLocaleString('th-TH'),
          };
          setSheetsConfig(updatedConfig);
          localStorage.setItem('boat_sheets_config', JSON.stringify(updatedConfig));
        })
        .catch((err) => {
          console.error('Background maintenance auto-sync error:', err);
        });
    }
  };

  const handleUpdateMaintenanceStatus = (id: string, newStatus: MaintenanceStatus) => {
    const updatedRecords = maintenanceRecords.map((r) =>
      r.id === id ? { ...r, status: newStatus } : r
    );
    setMaintenanceRecords(updatedRecords);
    persistData('boat_maintenance_history', updatedRecords);
    triggerToast('อัปเดตสถานะการซ่อมบำรุงเรียบร้อยแล้ว', 'success');

    // Auto sync to connected Google Sheet if authenticated and configured
    if (accessToken && sheetsConfig.spreadsheetId) {
      syncMaintenanceToSheets(accessToken, sheetsConfig.spreadsheetId, updatedRecords)
        .then(() => {
          const updatedConfig = {
            ...sheetsConfig,
            lastSyncedAt: new Date().toLocaleString('th-TH'),
          };
          setSheetsConfig(updatedConfig);
          localStorage.setItem('boat_sheets_config', JSON.stringify(updatedConfig));
        })
        .catch((err) => {
          console.error('Background maintenance auto-sync error:', err);
        });
    }
  };

  // Clear local storage history
  const handleClearHistory = (category: 'all' | 'extinguisher' | 'lifejacket' | 'license' | 'medical' = 'all') => {
    if (category === 'all' || category === 'extinguisher') {
      setHistory([]);
      persistData('boat_inspection_history', []);
      
      // Also reset all fire extinguisher check statuses back to "Never Inspected"
      const resetExts = extinguishers.map((e) => ({
        ...e,
        pressureStatus: 'Normal' as const,
        safetyPinStatus: 'Normal' as const,
        tankStatus: 'Normal' as const,
        hoseStatus: 'Normal' as const,
        weightStatus: 'Normal' as const,
        lastInspectedDate: null,
        lastInspector: null,
        overallStatus: 'NeverInspected' as const,
        remarks: '',
      }));
      setExtinguishers(resetExts);
      persistData('boat_fire_extinguishers', resetExts);
    }

    if (category === 'all' || category === 'lifejacket') {
      setLifeJacketHistory([]);
      persistData('boat_life_jacket_history', []);
      
      const resetLJs = lifeJackets.map((j) => ({
        ...j,
        adultsStatus: 'Normal' as const,
        kidsStatus: 'Normal' as const,
        whistleStatus: 'Normal' as const,
        lightStatus: 'Normal' as const,
        cabinetStatus: 'Normal' as const,
        lastInspectedDate: null,
        lastInspector: null,
        overallStatus: 'NeverInspected' as const,
        remarks: '',
      }));
      setLifeJackets(resetLJs);
      persistData('boat_life_jackets', resetLJs);
    }

    if (category === 'all' || category === 'license') {
      setLicenseHistory([]);
      persistData('boat_license_history', []);
      
      const resetLicenses = boatLicenses.map((l) => ({
        ...l,
        vesselLicenseStatus: 'Normal' as const,
        helmsmanLicenseStatus: 'Normal' as const,
        engineerLicenseStatus: 'Normal' as const,
        lastInspectedDate: null,
        lastInspector: null,
        overallStatus: 'NeverInspected' as const,
        remarks: '',
      }));
      setBoatLicenses(resetLicenses);
      persistData('boat_licenses', resetLicenses);
    }

    if (category === 'all' || category === 'medical') {
      setMedicalHistory([]);
      persistData('boat_medical_history', []);
      
      const resetMeds = medicalStations.map((s) => ({
        ...s,
        paracetamolStatus: 'Normal' as const,
        motionSicknessStatus: 'Normal' as const,
        ammoniaStatus: 'Normal' as const,
        bandagesStatus: 'Normal' as const,
        antacidStatus: 'Normal' as const,
        cottonBudsStatus: 'Normal' as const,
        betadineStatus: 'Normal' as const,
        salineStatus: 'Normal' as const,
        gauzeStatus: 'Normal' as const,
        surgicalTapeStatus: 'Normal' as const,
        cottonBallsStatus: 'Normal' as const,
        containerStatus: 'Normal' as const,
        lastInspectedDate: null,
        lastInspector: null,
        overallStatus: 'NeverInspected' as const,
        remarks: '',
      }));
      setMedicalStations(resetMeds);
      persistData('boat_medical_stations', resetMeds);
    }
    
    triggerToast('ล้างประวัติเครื่องและการบันทึกในหมวดหมู่ที่เลือกเรียบร้อยแล้ว', 'info');
  };

  // Nav to specific boat inspection lists
  const handleSelectBoat = (boatId: string | null) => {
    setSelectedBoatId(boatId);
    setActiveTab('boats');
  };

  // Current month dynamic calculations for reminder alerts
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const totalCount = extinguishers.length;
  const inspectedThisMonthCount = extinguishers.filter(
    (e) => e.lastInspectedDate && e.lastInspectedDate.startsWith(currentMonthStr)
  ).length;
  const pendingInspectionsCount = totalCount - inspectedThisMonthCount;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* Master Core Module Switcher */}
      <div className="bg-slate-950 text-white border-b border-slate-800 text-xs py-2.5 px-4 flex flex-col sm:flex-row justify-between items-center z-45 relative gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4.5 w-4.5 text-teal-400 animate-pulse shrink-0" />
          <span className="font-extrabold text-slate-200 tracking-wider uppercase text-[10px] select-none text-center sm:text-left">
            CHAO PHRAYA INTEGRATED MARITIME SAFETY SUITE
          </span>
        </div>
        <div className="flex flex-wrap bg-slate-900 p-0.5 rounded border border-slate-800 shrink-0 select-none gap-0.5 sm:gap-0 font-sans">
          <button
            onClick={() => setAppModule('security')}
            className={`px-3 py-1.5 rounded-sm text-[11px] font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
              appModule === 'security'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛡️ ระบบตรวจความปลอดภัย & ใบอนุญาตเรือ (7 ลำ)
          </button>
          <button
            onClick={() => setAppModule('medical')}
            className={`px-3 py-1.5 rounded-sm text-[11px] font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
              appModule === 'medical'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏥 ตู้ยาเวชภัณฑ์ (เรือ 7 ลำ / ท่าเรือ 11 ท่า)
          </button>
          <button
            onClick={() => setAppModule('maintenance')}
            className={`px-3 py-1.5 rounded-sm text-[11px] font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
              appModule === 'maintenance'
                ? 'bg-amber-650 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔧 ประวัติการซ่อมบำรุงเรือ (7 ลำ)
          </button>
        </div>
      </div>

      {/* Firebase Cloud Sync Control Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-[11px] px-4 py-2 flex flex-col sm:flex-row justify-between items-center gap-2 select-none z-40 relative">
        <div className="flex items-center gap-2">
          <span className="text-[10px]">☁️</span>
          <span className="font-extrabold text-slate-300 font-mono">FIREBASE CLOUD DATABASE:</span>
          {isCloudLoading ? (
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <span className="animate-spin inline-block w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full"></span>
              กำลังโหลดข้อมูลจากคลาวด์...
            </span>
          ) : isCloudAvailable() ? (
            <span className="text-emerald-400 font-bold">
              ● เชื่อมต่อระบบคลาวด์แล้ว (ข้อมูลทุกเครื่องเชื่อมโยงกันแบบ Real-time)
            </span>
          ) : (
            <span className="text-red-400 font-bold">
              ✕ ไม่พบฐานข้อมูลคลาวด์ (บันทึกข้อมูลเฉพาะเครื่องนี้ / กรุณาเปิดใช้ใน Firebase Console)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePullFromCloud}
            disabled={isCloudLoading || isSyncing}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-2.5 py-1 rounded border border-slate-750 font-bold cursor-pointer transition-colors active:scale-95 text-[10px]"
            title="ดึงข้อมูลจากระบบคลาวด์มาเขียนทับข้อมูลในเครื่องนี้"
          >
            🔄 ดึงข้อมูลคลาวด์มาลงเครื่องนี้ (Pull)
          </button>
          <button
            onClick={handlePushToCloud}
            disabled={isCloudLoading || isSyncing}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-2.5 py-1 rounded font-bold cursor-pointer transition-colors active:scale-95 text-[10px]"
            title="ส่งข้อมูลทั้งหมดของเครื่องนี้ขึ้นไปเขียนทับบนคลาวด์"
          >
            📤 ส่งเครื่องนี้ขึ้นคลาวด์ (Push)
          </button>
        </div>
      </div>

      {appModule === 'security' ? (
        <>
          {/* Dynamic Alerts / Announcement Bar */}
          {pendingInspectionsCount > 0 && (
            <div className="bg-amber-500 text-white text-xs px-4 py-2 font-bold flex items-center justify-between shadow-xs transition-all animate-bounce-short">
              <div className="flex items-center gap-2 mx-auto sm:mx-0">
                <Bell className="h-4 w-4 animate-swing shrink-0" />
                <span>
                  ระบบความปลอดภัยแจ้งเตือน: เดือนนี้มีค้างตรวจประจำงวดอีก <strong>{pendingInspectionsCount} ถัง</strong> (ตรวจแล้ว {inspectedThisMonthCount}/{totalCount} ถัง) 
                </span>
              </div>
              <button 
                onClick={() => handleSelectBoat(null)} 
                className="hidden sm:block underline hover:text-slate-100 transition-colors text-[11px]"
              >
                ไปตรวจสอบทันที &rarr;
              </button>
            </div>
          )}

          {/* Navigation & Header */}
          <header className="bg-slate-900 text-white shadow-xs relative overflow-hidden shrink-0 border-b-2 border-slate-950">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-20 -translate-y-10 scale-125">
              <ShieldCheck className="h-64 w-64 text-red-500" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center shrink-0 border border-red-500 shadow-sm">
                  <ShieldCheck className="h-6.5 w-6.5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight uppercase">
                    Chao Phraya Fleet Safety & Compliance
                  </h1>
                  <p className="text-xs text-slate-400 uppercase tracking-widest leading-none mt-1">
                    Vessel Fire Security, Life Jackets, & Licensing Suite
                  </p>
                </div>
              </div>

              {/* Right Col: Geometric Balance Stats columns */}
              <div className="flex flex-wrap items-center gap-6 md:gap-8 bg-slate-950/40 p-3 px-5 border border-slate-800 rounded">
                <div className="text-left">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Fleet Status</span>
                  <span className="text-green-400 font-mono text-base font-bold">
                    {(totalCount > 0 ? (((totalCount - extinguishers.filter((e) => e.overallStatus === 'Fail').length) / totalCount) * 100).toFixed(1) : '100.0')}% SECURE
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-800"></div>
                <div className="text-left">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest">Monthly Audits</span>
                  <span className="text-amber-400 font-mono text-base font-bold">
                    {pendingInspectionsCount < 10 ? `0${pendingInspectionsCount}` : pendingInspectionsCount} PENDING
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Selection Row */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 shrink-0">
              <nav className="flex space-x-1 border-t border-slate-800 pt-3">
                {[
                  { id: 'dashboard', label: 'สรุปแผงควบคุม (Dashboard)', icon: Activity },
                  { id: 'boats', label: '🧯 ตรวจถังดับเพลิง', icon: Flame },
                  { id: 'lifejackets', label: '🧡 ตรวจเสื้อชูชีพ', icon: LifeBuoy },
                  { id: 'licenses', label: '🚢 ใบอนุญาตเรือ & เจ้าหน้าที่', icon: ShieldCheck },
                  { id: 'history', label: '📅 ประวัติบันทึกความปลอดภัย', icon: Calendar },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        if (tab.id !== 'boats') setSelectedBoatId(null);
                      }}
                      className={`py-3 px-4 text-xs font-bold rounded-t-sm transition-all flex items-center gap-2 select-none border-b-2 cursor-pointer uppercase font-mono tracking-wide ${
                        activeTab === tab.id
                          ? 'bg-slate-50 text-slate-900 border-red-600 font-extrabold'
                          : 'text-slate-400 hover:text-slate-200 border-transparent'
                      }`}
                    >
                      <TabIcon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </header>

          {/* Main Container Area */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full relative">
            
            {/* Toast Notification Box */}
            {toastMessage && (
              <div className="fixed bottom-6 right-6 md:right-8 bg-slate-950 text-white rounded-sm border-2 border-slate-900 p-4 shadow-2xl z-50 animate-fade-in flex items-center gap-3 max-w-sm">
                <div className={`p-2 rounded-sm shrink-0 border ${
                  toastMessage.type === 'success' 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : toastMessage.type === 'error' 
                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-widest font-extrabold">SYSTEM NOTICE</span>
                  <p className="text-xs text-slate-100 font-bold mt-0.5">{toastMessage.text}</p>
                </div>
              </div>
            )}

            {/* Tab Content Display Switch */}
            <div className="transition-all duration-300">
              {activeTab === 'dashboard' && (
                <Dashboard
                  extinguishers={extinguishers}
                  boats={boats}
                  onSelectBoat={handleSelectBoat}
                  onSelectExtinguisher={(ext) => {
                    setInspectingExt(ext);
                  }}
                  onOpenQuickScan={() => {
                    handleSelectBoat(null);
                  }}
                  lifeJackets={lifeJackets}
                  licenses={boatLicenses}
                  medicalStations={medicalStations}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                  }}
                  onNavigateModule={(module) => {
                    setAppModule(module);
                  }}
                />
              )}

              {activeTab === 'boats' && (
                <BoatList
                  selectedBoatId={selectedBoatId}
                  boats={boats}
                  extinguishers={extinguishers}
                  onSelectBoat={setSelectedBoatId}
                  onInspectExtinguisher={(ext) => {
                    setInspectingExt(ext);
                  }}
                />
              )}

              {activeTab === 'lifejackets' && (
                <LifeJacketSection
                  jackets={lifeJackets}
                  history={lifeJacketHistory}
                  onSaveInspection={handleSaveLifeJacketInspection}
                  onDeleteInspection={handleDeleteLifeJacketInspection}
                />
              )}

              {activeTab === 'licenses' && (
                <LicenseSection
                  licenses={boatLicenses}
                  history={licenseHistory}
                  onSaveInspection={handleSaveLicenseInspection}
                  onDeleteInspection={handleDeleteLicenseInspection}
                />
              )}

              {activeTab === 'history' && (
                <HistoryLog 
                  extinguisherHistory={history} 
                  lifeJacketHistory={lifeJacketHistory}
                  licenseHistory={licenseHistory}
                  medicalHistory={medicalHistory}
                  onClearHistory={handleClearHistory} 
                  onDeleteRecord={handleDeleteUnifiedRecord}
                />
              )}
            </div>
          </main>
        </>
      ) : appModule === 'medical' ? (
        <>
          {/* Main Medical Module Container */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full relative">
            
            {/* Toast Notification Box */}
            {toastMessage && (
              <div className="fixed bottom-6 right-6 md:right-8 bg-slate-950 text-white rounded-sm border-2 border-slate-900 p-4 shadow-2xl z-50 animate-fade-in flex items-center gap-3 max-w-sm">
                <div className={`p-2 rounded-sm shrink-0 border ${
                  toastMessage.type === 'success' 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : toastMessage.type === 'error' 
                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-widest font-extrabold">SYSTEM NOTICE</span>
                  <p className="text-xs text-slate-100 font-bold mt-0.5">{toastMessage.text}</p>
                </div>
              </div>
            )}

            <MedicalSection
              stations={medicalStations}
              onSaveInspection={handleSaveMedicalInspection}
              onDeleteInspection={handleDeleteMedicalInspection}
              history={medicalHistory}
            />
          </main>
        </>
      ) : (
        <>
          {/* Main Maintenance Module Container */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full relative">
            
            {/* Toast Notification Box */}
            {toastMessage && (
              <div className="fixed bottom-6 right-6 md:right-8 bg-slate-950 text-white rounded-sm border-2 border-slate-900 p-4 shadow-2xl z-50 animate-fade-in flex items-center gap-3 max-w-sm">
                <div className={`p-2 rounded-sm shrink-0 border ${
                  toastMessage.type === 'success' 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : toastMessage.type === 'error' 
                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-widest font-extrabold">SYSTEM NOTICE</span>
                  <p className="text-xs text-slate-100 font-bold mt-0.5">{toastMessage.text}</p>
                </div>
              </div>
            )}

            <MaintenanceSection
              records={maintenanceRecords}
              onSaveRecord={handleSaveMaintenanceRecord}
              onDeleteRecord={handleDeleteMaintenanceRecord}
              onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
              isSyncing={isSyncing}
            />
          </main>
        </>
      )}

      {/* Primary Inspection Modal */}
      {inspectingExt && appModule === 'security' && (
        <InspectionForm
          extinguisher={inspectingExt}
          defaultInspectorName={user?.displayName || user?.email || ''}
          onSave={handleSaveInspection}
          onCancel={() => setInspectingExt(null)}
        />
      )}

      {/* Humble Elegant Footer Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
            <span>Chao Phraya Tourist Boat Co., Ltd. &copy; 2026. ระบบความปลอดภัยท่าเรือและเรือท่องเที่ยวแม่น้ำ</span>
          </div>
          <div className="space-x-4">
            <span className="text-slate-500">มาตรฐานความปลอดภัยกรมเจ้าท่า พ.ศ. ๒๕๖๙</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
