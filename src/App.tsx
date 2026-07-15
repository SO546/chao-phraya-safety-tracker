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
  LifeBuoy,
  Map as MapIcon,
  Grid,
  Trash2
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

import Dashboard from './components/Dashboard';
import BoatList from './components/BoatList';
import InspectionForm from './components/InspectionForm';
import HistoryLog from './components/HistoryLog';
import MedicalSection from './components/MedicalSection';
import LicenseSection from './components/LicenseSection';
import MaintenanceSection from './components/MaintenanceSection';
import LifeJacketSection from './components/LifeJacketSection';
import ExtinguisherReport from './components/ExtinguisherReport';
import ExecutiveSummaryReport from './components/ExecutiveSummaryReport';

// Safe local storage proxy for sandboxed environments like Google Apps Script
const localStorage = (() => {
  const memoryStorage = new Map<string, string>();

  const safeSetItem = (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (error: any) {
      console.warn(`Local storage write failed for key "${key}". Attempting to clear space...`, error);

      // Check if it is a QuotaExceededError or SecurityError
      const isQuotaError = 
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error.code === 22 ||
        String(error).toLowerCase().includes('quota') ||
        String(error).toLowerCase().includes('exceeded') ||
        String(error).toLowerCase().includes('security') ||
        String(error).toLowerCase().includes('denied');

      if (isQuotaError) {
        try {
          const historyKeys = [
            'boat_inspection_history',
            'boat_medical_history',
            'boat_life_jacket_history',
            'boat_license_history',
            'boat_maintenance_history'
          ];

          let freedSomeSpace = false;

          for (const histKey of historyKeys) {
            const raw = window.localStorage.getItem(histKey);
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  let cleaned = false;
                  const updated = parsed.map((item: any, idx: number) => {
                    // Keep photos only for the 2 most recent records, strip for older records to save space
                    if (idx > 1) {
                      if (item.photoUrl || item.lastPhotoUrl || item.vesselPhotoUrl || item.helmsmanPhotoUrl || item.engineerPhotoUrl) {
                        cleaned = true;
                        return {
                          ...item,
                          photoUrl: undefined,
                          lastPhotoUrl: undefined,
                          vesselPhotoUrl: undefined,
                          helmsmanPhotoUrl: undefined,
                          engineerPhotoUrl: undefined
                        };
                      }
                    }
                    return item;
                  });

                  if (cleaned) {
                    try {
                      window.localStorage.setItem(histKey, JSON.stringify(updated));
                      freedSomeSpace = true;
                    } catch (errInnerWrite) {
                      console.warn(`Could not overwrite ${histKey} during cleanup`, errInnerWrite);
                    }
                  }
                }
              } catch (innerErr) {
                // Ignore parsing errors
              }
            }
          }

          // Also try to strip old photos in the value currently being saved if it is a history key or lists
          let currentValueToSave = value;
          if (key.includes('history') || key.includes('stations') || key.includes('licenses') || key.includes('extinguishers') || key.includes('jackets')) {
            try {
              const parsedValue = JSON.parse(value);
              if (Array.isArray(parsedValue)) {
                let cleanedCurrent = false;
                const strippedValue = parsedValue.map((item: any, idx: number) => {
                  if (idx > 1) { // Only keep photos for the first 2 items
                    if (item.photoUrl || item.lastPhotoUrl || item.vesselPhotoUrl || item.helmsmanPhotoUrl || item.engineerPhotoUrl) {
                      cleanedCurrent = true;
                      return {
                        ...item,
                        photoUrl: undefined,
                        lastPhotoUrl: undefined,
                        vesselPhotoUrl: undefined,
                        helmsmanPhotoUrl: undefined,
                        engineerPhotoUrl: undefined
                      };
                    }
                  }
                  return item;
                });
                if (cleanedCurrent) {
                  currentValueToSave = JSON.stringify(strippedValue);
                }
              }
            } catch (stripErr) {
              // Ignore
            }
          }

          // Try saving the original or stripped value again now that we freed some space
          try {
            window.localStorage.setItem(key, currentValueToSave);
            console.log(`Saved key "${key}" successfully after clearing space.`);
            return;
          } catch (retryWriteError) {
            console.warn('Fallback: saving value with stripped photos failed, falling back to memory storage', retryWriteError);
          }
        } catch (retryError) {
          console.error('Failed to save to window.localStorage even after space clearing:', retryError);
        }
      }

      // Fallback: If we can't write to window.localStorage, save to memory storage
      // so the app state remains functional during the session
      memoryStorage.set(key, value);
    }
  };

  try {
    const testKey = '__test';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);

    return {
      getItem: (key: string) => {
        try {
          return window.localStorage.getItem(key) || memoryStorage.get(key) || null;
        } catch (e) {
          return memoryStorage.get(key) || null;
        }
      },
      setItem: safeSetItem,
      removeItem: (key: string) => {
        try {
          window.localStorage.removeItem(key);
        } catch (e) {}
        memoryStorage.delete(key);
      },
      clear: () => {
        try {
          window.localStorage.clear();
        } catch (e) {}
        memoryStorage.clear();
      },
      get length() {
        try {
          return window.localStorage.length + memoryStorage.size;
        } catch (e) {
          return memoryStorage.size;
        }
      },
      key: (index: number) => {
        try {
          return window.localStorage.key(index) || Array.from(memoryStorage.keys())[index] || null;
        } catch (e) {
          return Array.from(memoryStorage.keys())[index] || null;
        }
      }
    };
  } catch (e) {
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
  const [mainTab, setMainTab] = useState<'dashboard' | 'forms'>('dashboard');
  const [dashboardSubTab, setDashboardSubTab] = useState<'security' | 'vessel-summary' | 'medical' | 'maintenance' | 'extinguisher-map' | 'lifejacket-map' | 'executive-report'>('security');
  const [formsSubTab, setFormsSubTab] = useState<'extinguishers' | 'lifejackets' | 'licenses' | 'medical' | 'maintenance' | 'history' | 'extinguisher-report'>('extinguishers');
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
  
  // Inspection Modal State
  const [inspectingExt, setInspectingExt] = useState<FireExtinguisher | null>(null);
  const [selectedBoatId, setSelectedBoatId] = useState<string | null>(null);

  // Custom Confirmation Dialog State
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

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

  // Show dynamic notification helper
  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
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

  // Helper to add a rectification photo to a history record
  const handleAddRectificationPhoto = (recordId: string, category: string, photoUrl: string) => {
    if (category === 'extinguisher') {
      const updatedHistory = history.map(h => h.id === recordId ? { ...h, rectificationPhotoUrl: photoUrl } : h);
      setHistory(updatedHistory);
      localStorage.setItem('boat_inspection_history', JSON.stringify(updatedHistory));
    } else if (category === 'medical') {
      const updatedHistory = medicalHistory.map(h => h.id === recordId ? { ...h, rectificationPhotoUrl: photoUrl } : h);
      setMedicalHistory(updatedHistory);
      localStorage.setItem('boat_medical_history', JSON.stringify(updatedHistory));
    } else if (category === 'license') {
      const updatedHistory = licenseHistory.map(h => h.id === recordId ? { ...h, rectificationPhotoUrl: photoUrl } : h);
      setLicenseHistory(updatedHistory);
      localStorage.setItem('boat_license_history', JSON.stringify(updatedHistory));
    } else if (category === 'lifejacket') {
      const updatedHistory = lifeJacketHistory.map(h => h.id === recordId ? { ...h, rectificationPhotoUrl: photoUrl } : h);
      setLifeJacketHistory(updatedHistory);
      localStorage.setItem('boat_life_jacket_history', JSON.stringify(updatedHistory));
    }
    triggerToast('แนบรูปถ่ายการแก้ไขสำเร็จ', 'success');
  };

  // Inspect save logic
  const handleSaveInspection = (recordData: Omit<InspectionRecord, 'id'>, updatedType?: ExtinguisherType, updatedSize?: string) => {
    if (!inspectingExt) return;

    // 1. Generate unique ID for historical logs
    const newRecord: InspectionRecord = {
      ...recordData,
      id: `REC-${Date.now()}`,
    };

    // 2. Add to history array
    const newHistory = [newRecord, ...history];
    setHistory(newHistory);
    localStorage.setItem('boat_inspection_history', JSON.stringify(newHistory));

    // 3. Update the fire extinguisher current status, including selectable type and size
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
          lastPhotoUrl: recordData.photoUrl,
        };
      }
      return e;
    });

    setExtinguishers(updatedExts);
    localStorage.setItem('boat_fire_extinguishers', JSON.stringify(updatedExts));

    triggerToast(`บันทึกผลตรวจสอบถังดับเพลิง ${inspectingExt.id} เสร็จสิ้นแล้ว!`, 'success');

    // 4. Auto sync to connected Google Sheet if authenticated and configured
    if (accessToken && sheetsConfig.spreadsheetId) {
      // Run sync in the background so UI doesn't lag
      syncCurrentExtinguishersToSheets(accessToken, sheetsConfig.spreadsheetId, updatedExts)
        .then(() => {
          // Then append this single new inspection to the sheets history
          return appendInspectionsToHistorySheet(accessToken, sheetsConfig.spreadsheetId, [newRecord]);
        })
        .then(() => {
          // Update sync time
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
  const handleSaveMedicalInspection = (recordData: Omit<MedicalInspectionRecord, 'id'>) => {
    const newRecordId = `MEDREC-${Date.now()}`;
    const newRecord: MedicalInspectionRecord = {
      ...recordData,
      id: newRecordId,
    };

    // Update History log list
    const newHistory = [newRecord, ...medicalHistory];
    setMedicalHistory(newHistory);
    localStorage.setItem('boat_medical_history', JSON.stringify(newHistory));

    // Update individual station metrics
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
          lastPhotoUrl: recordData.photoUrl,
        };
      }
      return st;
    });

    setMedicalStations(updatedStations);
    localStorage.setItem('boat_medical_stations', JSON.stringify(updatedStations));

    triggerToast(`บันทึกการตรวจเช็คเวชภัณฑ์สำหรับ ${recordData.targetName} เรียบร้อยแล้ว!`, 'success');

    // 4. Auto sync to connected Google Sheet if authenticated and configured
    if (accessToken && sheetsConfig.spreadsheetId) {
      // Run sync in the background so UI doesn't lag
      syncCurrentMedicalKitsToSheets(accessToken, sheetsConfig.spreadsheetId, updatedStations)
        .then(() => {
          // Then append this single new inspection to the sheets history
          return appendMedicalInspectionsToHistorySheet(accessToken, sheetsConfig.spreadsheetId, [newRecord]);
        })
        .then(() => {
          // Update sync time
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

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDelete({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDelete(null);
      }
    });
  };

  const handleDeleteMedicalInspection = (id: string) => {
    if (!id) return;
    showConfirm(
      'ยืนยันการลบ',
      'คุณต้องการลบประวัติการตรวจสอบเวชภัณฑ์นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
      () => {
        const newHistory = medicalHistory.filter(h => h.id !== id);
        setMedicalHistory(newHistory);
        localStorage.setItem('boat_medical_history', JSON.stringify(newHistory));
        triggerToast('ลบประวัติการตรวจสอบเวชภัณฑ์สำเร็จ', 'info');
      }
    );
  };

  // Boat License Inspection save logic
  const handleSaveLicenseInspection = (recordData: Omit<LicenseInspectionRecord, 'id'>) => {
    const newRecordId = `LICREC-${Date.now()}`;
    const newRecord: LicenseInspectionRecord = {
      ...recordData,
      id: newRecordId,
    };

    // Update History log list
    const newHistory = [newRecord, ...licenseHistory];
    setLicenseHistory(newHistory);
    localStorage.setItem('boat_license_history', JSON.stringify(newHistory));

    // Update individual boat licensing metrics
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
          vesselPhotoUrl: recordData.vesselPhotoUrl,
          helmsmanPhotoUrl: recordData.helmsmanPhotoUrl,
          engineerPhotoUrl: recordData.engineerPhotoUrl,
        };
      }
      return b;
    });

    setBoatLicenses(updatedLicenses);
    localStorage.setItem('boat_licenses', JSON.stringify(updatedLicenses));

    triggerToast(`บันทึกการส่งตรวจสอบใบอนุญาตของเรือ ${recordData.boatName} เสร็จสิ้น!`, 'success');
  };

  const handleDeleteLicenseInspection = (id: string) => {
    if (!id) return;
    showConfirm(
      'ยืนยันการลบ',
      'คุณต้องการลบประวัติการตรวจสอบใบอนุญาตนี้ใช่หรือไม่?',
      () => {
        const newHistory = licenseHistory.filter(h => h.id !== id);
        setLicenseHistory(newHistory);
        localStorage.setItem('boat_license_history', JSON.stringify(newHistory));
        triggerToast('ลบประวัติการตรวจสอบใบอนุญาตสำเร็จ', 'info');
      }
    );
  };

  // Boat Life Jacket Inspection save logic
  const handleSaveLifeJacketInspection = (recordData: LifeJacketInspectionRecord | Omit<LifeJacketInspectionRecord, 'id'>) => {
    let updatedHistory = [...lifeJacketHistory];
    let recordWithId: LifeJacketInspectionRecord;

    if ('id' in recordData && recordData.id) {
      // Editing existing record
      recordWithId = recordData as LifeJacketInspectionRecord;
      updatedHistory = updatedHistory.map((rec) => rec.id === recordWithId.id ? recordWithId : rec);
    } else {
      // New record
      const newRecordId = `LJREC-${Date.now()}`;
      recordWithId = {
        ...recordData,
        id: newRecordId,
      } as LifeJacketInspectionRecord;
      updatedHistory = [recordWithId, ...updatedHistory];
    }

    setLifeJacketHistory(updatedHistory);
    localStorage.setItem('boat_life_jacket_history', JSON.stringify(updatedHistory));

    // Update individual boat life jacket state
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
          photoUrl: recordWithId.photoUrl,
          seats: recordWithId.seats || b.seats,
        };
      }
      return b;
    });

    setLifeJackets(updatedJackets);
    localStorage.setItem('boat_life_jackets', JSON.stringify(updatedJackets));

    triggerToast(`บันทึกการตรวจสอบเสื้อชูชีพของเรือ ${recordWithId.boatName} สำเร็จ!`, 'success');
  };

  const handleDeleteLifeJacketInspection = (id: string) => {
    if (!id) return;
    showConfirm(
      'ยืนยันการลบ',
      'คุณต้องการลบประวัติการตรวจสอบเสื้อชูชีพนี้ใช่หรือไม่?',
      () => {
        const newHistory = lifeJacketHistory.filter(h => h.id !== id);
        setLifeJacketHistory(newHistory);
        localStorage.setItem('boat_life_jacket_history', JSON.stringify(newHistory));
        triggerToast('ลบประวัติการตรวจสอบเสื้อชูชีพสำเร็จ', 'info');
      }
    );
  };

  const handleDeleteExtinguisherInspection = (id: string) => {
    if (!id) return;
    showConfirm(
      'ยืนยันการลบ',
      'คุณต้องการลบประวัติการตรวจสอบถังดับเพลิงนี้ใช่หรือไม่?',
      () => {
        const newHistory = history.filter(h => h.id !== id);
        setHistory(newHistory);
        localStorage.setItem('boat_inspection_history', JSON.stringify(newHistory));
        triggerToast('ลบประวัติการตรวจสอบถังดับเพลิงสำเร็จ', 'info');
      }
    );
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
  const handleSaveMaintenanceRecord = (recordData: Omit<MaintenanceRecord, 'id'>) => {
    const newRecordId = `MAINREC-${Date.now()}`;
    const newRecord: MaintenanceRecord = {
      ...recordData,
      id: newRecordId,
    };

    // Update state
    const updatedRecords = [newRecord, ...maintenanceRecords];
    setMaintenanceRecords(updatedRecords);
    localStorage.setItem('boat_maintenance_history', JSON.stringify(updatedRecords));

    triggerToast(`บันทึกข้อมูลการซ่อมบำรุงเรือ ${recordData.boatName} สำเร็จ!`, 'success');

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
    localStorage.setItem('boat_maintenance_history', JSON.stringify(updatedRecords));
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

  const handleUpdateMaintenanceRecord = (id: string, updates: Partial<MaintenanceRecord>) => {
    const updatedRecords = maintenanceRecords.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    setMaintenanceRecords(updatedRecords);
    localStorage.setItem('boat_maintenance_history', JSON.stringify(updatedRecords));
    
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
    handleUpdateMaintenanceRecord(id, { status: newStatus });
    triggerToast('อัปเดตสถานะการซ่อมบำรุงเรียบร้อยแล้ว', 'success');
  };

  // Clear local storage history
  const handleClearHistory = (category: 'all' | 'extinguisher' | 'lifejacket' | 'license' | 'medical' = 'all') => {
    if (category === 'all' || category === 'extinguisher') {
      setHistory([]);
      localStorage.setItem('boat_inspection_history', JSON.stringify([]));
      
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
      localStorage.setItem('boat_fire_extinguishers', JSON.stringify(resetExts));
    }

    if (category === 'all' || category === 'lifejacket') {
      setLifeJacketHistory([]);
      localStorage.setItem('boat_life_jacket_history', JSON.stringify([]));
      
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
      localStorage.setItem('boat_life_jackets', JSON.stringify(resetLJs));
    }

    if (category === 'all' || category === 'license') {
      setLicenseHistory([]);
      localStorage.setItem('boat_license_history', JSON.stringify([]));
      
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
      localStorage.setItem('boat_licenses', JSON.stringify(resetLicenses));
    }

    if (category === 'all' || category === 'medical') {
      setMedicalHistory([]);
      localStorage.setItem('boat_medical_history', JSON.stringify([]));
      
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
      localStorage.setItem('boat_medical_stations', JSON.stringify(resetMeds));
    }
    
    triggerToast('ล้างประวัติเครื่องและการบันทึกในหมวดหมู่ที่เลือกเรียบร้อยแล้ว', 'info');
  };

  // Nav to specific boat inspection lists
  const handleSelectBoat = (boatId: string | null) => {
    setSelectedBoatId(boatId);
    setMainTab('forms');
    setFormsSubTab('extinguishers');
  };

  // Current month dynamic calculations for reminder alerts
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const totalCount = extinguishers.length;
  const inspectedThisMonthCount = extinguishers.filter(
    (e) => e.lastInspectedDate && e.lastInspectedDate.startsWith(currentMonthStr)
  ).length;
  const pendingInspectionsCount = totalCount - inspectedThisMonthCount;

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-slate-950">
      
      {/* Modern Unified Header */}
      <div className="bg-white text-slate-950 border-b-2 border-slate-300 text-xs py-3.5 px-4 flex flex-col lg:flex-row justify-between items-center z-45 relative gap-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0 border border-teal-200 shadow-sm animate-pulse">
            <HeartPulse className="h-5.5 w-5.5 text-teal-600" />
          </div>
          <div className="text-center lg:text-left">
            <span className="font-black text-slate-950 tracking-wider uppercase text-sm font-sans block">
              ระบบบูรณาการความปลอดภัยทางน้ำ เจ้าพระยา (CHAO PHRAYA MARITIME SAFETY SUITE)
            </span>
            <span className="block text-[10px] text-teal-600 uppercase font-black tracking-widest font-sans mt-1">
              • ตรวจถังดับเพลิงเรือ • เสื้อชูชีพประจำจุด • ใบอนุญาตเรือและกำลังพล • ตู้ยาและเวชภัณฑ์ • บันทึกการแจ้งซ่อมบำรุง
            </span>
          </div>
        </div>

        {/* Primary Module Level Switcher Tabs - Now inside Header */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-300 select-none font-sans gap-1 shadow-inner w-full lg:w-auto">
          <button
            onClick={() => setMainTab('dashboard')}
            className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-black cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              mainTab === 'dashboard'
                ? 'bg-teal-600 text-white shadow-md font-extrabold'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
            }`}
          >
            <span className="text-sm">📊</span> แดชบอร์ดสรุปสถิติ & ภาพรวม (Dashboard)
          </button>
          <button
            onClick={() => setMainTab('forms')}
            className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-black cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              mainTab === 'forms'
                ? 'bg-teal-600 text-white shadow-md font-extrabold'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
            }`}
          >
            <span className="text-sm">📋</span> บันทึกการตรวจสอบ & งานปฏิบัติการ (Inspections & Forms)
          </button>
        </div>
      </div>

      {/* Secondary Sub-Tabs Navigation */}
      <div className="bg-white text-slate-950 shadow-sm border-b-2 border-slate-300 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 shrink-0">
          {mainTab === 'dashboard' ? (
            <nav className="flex space-x-1 pt-2.5">
              {[
                { id: 'security', label: '🛡️ ความปลอดภัย & อุปกรณ์ชูชีพ', icon: ShieldCheck },
                { id: 'vessel-summary', label: '📊 ตารางสรุปรายลำเรือ', icon: FileSpreadsheet },
                { id: 'executive-report', label: '📋 รายงานสรุปผู้บริหาร', icon: FileSpreadsheet },
                { id: 'extinguisher-map', label: '🧯 แผนผังถังดับเพลิง', icon: MapIcon },
                { id: 'lifejacket-map', label: '🧡 แผนผังจุดติดตั้งชูชีพ', icon: Grid },
                { id: 'medical', label: '🏥 คลังยา & เวชภัณฑ์ยารวม', icon: HeartPulse },
                { id: 'maintenance', label: '🔧 สถิติกิจกรรมซ่อมบำรุงรักษา', icon: Sliders },
              ].map((sub) => {
                const SubIcon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setDashboardSubTab(sub.id as any)}
                    className={`py-3 px-4 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 select-none border-b-2 cursor-pointer uppercase font-mono tracking-wide ${
                      dashboardSubTab === sub.id
                        ? 'bg-white text-teal-600 border-teal-500 font-extrabold shadow-sm'
                        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100/60 border-transparent'
                    }`}
                  >
                    <SubIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </nav>
          ) : (
            <nav className="flex space-x-1 pt-2.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'extinguishers', label: '🧯 ตรวจถังดับเพลิง', icon: Flame },
                { id: 'lifejackets', label: '🧡 ตรวจเสื้อชูชีพ', icon: LifeBuoy },
                { id: 'licenses', label: '🚢 ตรวจใบอนุญาตเรือ & เจ้าหน้าที่', icon: ShieldCheck },
                { id: 'medical', label: '🏥 บันทึกตรวจตู้เวชภัณฑ์รายจุด', icon: HeartPulse },
                { id: 'maintenance', label: '🛠️ บันทึกงานแจ้งซ่อมบำรุง', icon: Sliders },
                { id: 'history', label: '📅 ประวัติการตรวจเช็คทั้งหมด', icon: Calendar },
                { id: 'extinguisher-report', label: '📋 รายงานสรุปเครื่องดับเพลิง', icon: FileSpreadsheet },
              ].map((sub) => {
                const SubIcon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setFormsSubTab(sub.id as any);
                      if (sub.id !== 'extinguishers') setSelectedBoatId(null);
                    }}
                    className={`py-3 px-4 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 select-none border-b-2 cursor-pointer uppercase font-mono tracking-wide shrink-0 ${
                      formsSubTab === sub.id
                        ? 'bg-white text-teal-600 border-teal-500 font-extrabold shadow-sm'
                        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100/60 border-transparent'
                    }`}
                  >
                    <SubIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>



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
              <p className="text-xs text-slate-100 font-bold mt-0.5">${toastMessage.text}</p>
            </div>
          </div>
        )}

        {/* Layout Navigation Render Switch */}
        <div className="transition-all duration-300">
          
          {/* Main Tab 1: Dashboard View */}
          {mainTab === 'dashboard' && (
            <>
              {dashboardSubTab === 'security' && (
                <Dashboard
                  extinguishers={extinguishers}
                  boats={boats}
                  onSelectBoat={handleSelectBoat}
                  onSelectExtinguisher={(ext) => {
                    setInspectingExt(ext);
                    setMainTab('forms');
                    setFormsSubTab('extinguishers');
                  }}
                  onOpenQuickScan={() => {
                    setMainTab('forms');
                    setFormsSubTab('extinguishers');
                    handleSelectBoat(null);
                  }}
                  lifeJackets={lifeJackets}
                  licenses={boatLicenses}
                  medicalStations={medicalStations}
                  onNavigateTab={(tab) => {
                    setMainTab('forms');
                    if (tab === 'boats') setFormsSubTab('extinguishers');
                    else if (tab === 'lifejackets') setFormsSubTab('lifejackets');
                    else if (tab === 'licenses') setFormsSubTab('licenses');
                  }}
                  onNavigateModule={(module) => {
                    setMainTab('dashboard');
                    if (module === 'medical') setDashboardSubTab('medical');
                    else if (module === 'maintenance') setDashboardSubTab('maintenance');
                  }}
                />
              )}

              {dashboardSubTab === 'vessel-summary' && (
                <Dashboard
                  extinguishers={extinguishers}
                  boats={boats}
                  onSelectBoat={handleSelectBoat}
                  onSelectExtinguisher={(ext) => {
                    setInspectingExt(ext);
                    setMainTab('forms');
                    setFormsSubTab('extinguishers');
                  }}
                  onOpenQuickScan={() => {
                    setMainTab('forms');
                    setFormsSubTab('extinguishers');
                    handleSelectBoat(null);
                  }}
                  lifeJackets={lifeJackets}
                  licenses={boatLicenses}
                  medicalStations={medicalStations}
                  onNavigateTab={(tab) => {
                    setMainTab('forms');
                    if (tab === 'boats') setFormsSubTab('extinguishers');
                    else if (tab === 'lifejackets') setFormsSubTab('lifejackets');
                    else if (tab === 'licenses') setFormsSubTab('licenses');
                  }}
                  onNavigateModule={(module) => {
                    setMainTab('dashboard');
                    if (module === 'medical') setDashboardSubTab('medical');
                    else if (module === 'maintenance') setDashboardSubTab('maintenance');
                  }}
                  viewMode="summary-only"
                />
              )}

              {dashboardSubTab === 'extinguisher-map' && (
                <Dashboard
                  extinguishers={extinguishers}
                  boats={boats}
                  onSelectBoat={handleSelectBoat}
                  onSelectExtinguisher={(ext) => {
                    setInspectingExt(ext);
                    setMainTab('forms');
                    setFormsSubTab('extinguishers');
                  }}
                  onOpenQuickScan={() => {
                    setMainTab('forms');
                    setFormsSubTab('extinguishers');
                    handleSelectBoat(null);
                  }}
                  lifeJackets={lifeJackets}
                  licenses={boatLicenses}
                  medicalStations={medicalStations}
                  onNavigateTab={(tab) => {
                    setMainTab('forms');
                    if (tab === 'boats') setFormsSubTab('extinguishers');
                    else if (tab === 'lifejackets') setFormsSubTab('lifejackets');
                    else if (tab === 'licenses') setFormsSubTab('licenses');
                  }}
                  onNavigateModule={(module) => {
                    setMainTab('dashboard');
                    if (module === 'medical') setDashboardSubTab('medical');
                    else if (module === 'maintenance') setDashboardSubTab('maintenance');
                  }}
                  viewMode="map-only"
                />
              )}

              {dashboardSubTab === 'lifejacket-map' && (
                <Dashboard
                  extinguishers={extinguishers}
                  boats={boats}
                  onSelectBoat={handleSelectBoat}
                  onSelectExtinguisher={(ext) => {
                    setInspectingExt(ext);
                    setMainTab('forms');
                    setFormsSubTab('extinguishers');
                  }}
                  onOpenQuickScan={() => {
                    setMainTab('forms');
                    setFormsSubTab('extinguishers');
                    handleSelectBoat(null);
                  }}
                  lifeJackets={lifeJackets}
                  licenses={boatLicenses}
                  medicalStations={medicalStations}
                  onNavigateTab={(tab) => {
                    setMainTab('forms');
                    if (tab === 'boats') setFormsSubTab('extinguishers');
                    else if (tab === 'lifejackets') setFormsSubTab('lifejackets');
                    else if (tab === 'licenses') setFormsSubTab('licenses');
                  }}
                  onNavigateModule={(module) => {
                    setMainTab('dashboard');
                    if (module === 'medical') setDashboardSubTab('medical');
                    else if (module === 'maintenance') setDashboardSubTab('maintenance');
                  }}
                  viewMode="lifejacket-map"
                />
              )}

              {dashboardSubTab === 'medical' && (
                <MedicalSection
                  stations={medicalStations}
                  onSaveInspection={handleSaveMedicalInspection}
                  onDeleteInspection={handleDeleteMedicalInspection}
                  history={medicalHistory}
                  activeSubTab="dashboard"
                />
              )}

              {dashboardSubTab === 'maintenance' && (
                <MaintenanceSection
                  records={maintenanceRecords}
                  onSaveRecord={handleSaveMaintenanceRecord}
                  onDeleteRecord={handleDeleteMaintenanceRecord}
                  onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
                  onUpdateRecord={handleUpdateMaintenanceRecord}
                  isSyncing={isSyncing}
                  showOnly="dashboard"
                />
              )}

              {dashboardSubTab === 'executive-report' && (
                <ExecutiveSummaryReport
                  boats={boats}
                  extinguishers={extinguishers}
                  extinguisherHistory={history}
                  medicalStations={medicalStations}
                  medicalHistory={medicalHistory}
                  licenses={boatLicenses}
                  licenseHistory={licenseHistory}
                  lifeJackets={lifeJackets}
                  lifeJacketHistory={lifeJacketHistory}
                />
              )}
            </>
          )}

          {/* Main Tab 2: Operational Forms & Audit Lists */}
          {mainTab === 'forms' && (
            <>
              {formsSubTab === 'extinguishers' && (
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

              {formsSubTab === 'lifejackets' && (
                <LifeJacketSection
                  jackets={lifeJackets}
                  history={lifeJacketHistory}
                  onSaveInspection={handleSaveLifeJacketInspection}
                  onDeleteInspection={handleDeleteLifeJacketInspection}
                />
              )}

              {formsSubTab === 'licenses' && (
                <LicenseSection
                  licenses={boatLicenses}
                  history={licenseHistory}
                  onSaveInspection={handleSaveLicenseInspection}
                  onDeleteInspection={handleDeleteLicenseInspection}
                />
              )}

              {formsSubTab === 'medical' && (
                <MedicalSection
                  stations={medicalStations}
                  onSaveInspection={handleSaveMedicalInspection}
                  onDeleteInspection={handleDeleteMedicalInspection}
                  history={medicalHistory}
                  activeSubTab="forms"
                />
              )}

              {formsSubTab === 'maintenance' && (
                <MaintenanceSection
                  records={maintenanceRecords}
                  onSaveRecord={handleSaveMaintenanceRecord}
                  onDeleteRecord={handleDeleteMaintenanceRecord}
                  onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
                  isSyncing={isSyncing}
                  showOnly="records"
                />
              )}

              {formsSubTab === 'history' && (
                <HistoryLog 
                  extinguisherHistory={history} 
                  lifeJacketHistory={lifeJacketHistory}
                  licenseHistory={licenseHistory}
                  medicalHistory={medicalHistory}
                  onClearHistory={handleClearHistory} 
                  onDeleteRecord={handleDeleteUnifiedRecord}
                  onAddRectificationPhoto={handleAddRectificationPhoto}
                  onShowConfirm={showConfirm}
                />
              )}

              {formsSubTab === 'extinguisher-report' && (
                <ExtinguisherReport 
                  extinguishers={extinguishers}
                  boats={boats}
                />
              )}
            </>
          )}
          
        </div>
      </main>

      {/* Primary Inspection Modal */}
      {inspectingExt && (
        <InspectionForm
          extinguisher={inspectingExt}
          defaultInspectorName={user?.displayName || user?.email || ''}
          onSave={handleSaveInspection}
          onCancel={() => setInspectingExt(null)}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      {confirmDelete && confirmDelete.isOpen && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="max-w-md w-full bg-white border-2 border-slate-900 p-6 shadow-2xl rounded-2xl animate-scale-up">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg shrink-0">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-950 tracking-tight">
                  {confirmDelete.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {confirmDelete.message}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 border border-slate-300 rounded-lg text-sm font-semibold transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDelete.onConfirm();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Humble Elegant Footer Footer */}
      <footer className="bg-white border-t-2 border-slate-300 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-blue-600" />
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
