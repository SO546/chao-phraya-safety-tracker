import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  ClipboardList, 
  Clock, 
  Ship as BoatIcon, 
  LifeBuoy, 
  HeartPulse, 
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Check,
  Shield,
  FileSpreadsheet,
  Map as MapIcon,
  Grid
} from 'lucide-react';
import { 
  Boat, 
  FireExtinguisher, 
  BoatLifeJacketState, 
  BoatLicenseState, 
  MedicalKitStation 
} from '../types';
import BoatMap from './BoatMap';
import SeatMapGrid from './SeatMapGrid';

function formatExpiryThai(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const match = dateStr.match(/^(\d{4})-(\d{2})/);
  if (!match) return dateStr;
  const year = parseInt(match[1]);
  const monthIdx = parseInt(match[2]) - 1;
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const thaiMonth = thaiMonths[monthIdx] || match[2];
  const thaiYear = year + 543;
  return `${thaiMonth} ${thaiYear}`;
}

interface DashboardProps {
  extinguishers: FireExtinguisher[];
  boats: Boat[];
  onSelectBoat: (boatId: string) => void;
  onSelectExtinguisher: (ext: FireExtinguisher) => void;
  onOpenQuickScan: () => void;
  
  // Complete inspection states for unified summary
  lifeJackets?: BoatLifeJacketState[];
  licenses?: BoatLicenseState[];
  medicalStations?: MedicalKitStation[];
  
  // Callback to navigate to tabs or modules
  onNavigateTab?: (tab: 'dashboard' | 'boats' | 'lifejackets' | 'licenses' | 'history' | 'sheets') => void;
  onNavigateModule?: (module: 'security' | 'medical' | 'maintenance') => void;
  viewMode?: 'full' | 'map-only' | 'lifejacket-map' | 'summary-only';
}

export default function Dashboard({
  extinguishers = [],
  boats = [],
  onSelectBoat,
  onSelectExtinguisher,
  onOpenQuickScan,
  lifeJackets = [],
  licenses = [],
  medicalStations = [],
  onNavigateTab,
  onNavigateModule,
  viewMode = 'full',
}: DashboardProps) {
  const [selectedMapBoatId, setSelectedMapBoatId] = useState<string>('');
  const [selectedFilterBoatId, setSelectedFilterBoatId] = useState<string | null>(null);
  
  const selectedMapBoat = boats.find(b => b.id === selectedMapBoatId) || boats[0];
  
  // Current month in YYYY-MM
  const currentMonthStr = new Date().toISOString().substring(0, 7); // "2026-06"
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const currentYearThai = new Date().getFullYear() + 543;
  const currentMonthThai = thaiMonths[new Date().getMonth()];

  // Helper to check if a date is within 2 months (60 days) or already expired
  const checkExpiryStatus = (expiryDateStr: string | null | undefined) => {
    if (!expiryDateStr) return { isExpired: false, isNearExpiry: false, daysRemaining: 9999 };
    const expiryDate = new Date(expiryDateStr);
    if (isNaN(expiryDate.getTime())) return { isExpired: false, isNearExpiry: false, daysRemaining: 9999 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      isExpired: diffDays < 0,
      isNearExpiry: diffDays >= 0 && diffDays <= 60, // 60 days is approximately 2 months
      daysRemaining: diffDays
    };
  };

  const extinguishersNearExpiryCount = extinguishers.filter(e => {
    const exp = checkExpiryStatus(e.expiryDate);
    return exp.isNearExpiry;
  }).length;
  
  const extinguishersExpiredCount = extinguishers.filter(e => {
    const exp = checkExpiryStatus(e.expiryDate);
    return exp.isExpired;
  }).length;

  let medicalItemsNearExpiryCount = 0;
  let medicalItemsExpiredCount = 0;

  medicalStations.forEach(s => {
    const checkItemExpiry = (expiry: string) => {
      const exp = checkExpiryStatus(expiry);
      if (exp.isNearExpiry) medicalItemsNearExpiryCount++;
      if (exp.isExpired) medicalItemsExpiredCount++;
    };
    checkItemExpiry(s.paracetamolExpiry);
    checkItemExpiry(s.motionSicknessExpiry);
    checkItemExpiry(s.ammoniaExpiry);
    checkItemExpiry(s.bandagesExpiry);
    checkItemExpiry(s.antacidExpiry);
    checkItemExpiry(s.cottonBudsExpiry);
    checkItemExpiry(s.betadineExpiry);
    checkItemExpiry(s.salineExpiry);
    checkItemExpiry(s.gauzeExpiry);
    checkItemExpiry(s.surgicalTapeExpiry);
    checkItemExpiry(s.cottonBallsExpiry);
  });

  // 1. --- CALCULATE FIRE EXTINGUISHER METRICS ---
  const currentExts = selectedFilterBoatId ? extinguishers.filter(e => e.boatId === selectedFilterBoatId) : extinguishers;
  const totalExtCount = currentExts.length;
  const extInspectedThisMonth = currentExts.filter(
    (e) => e.lastInspectedDate && e.lastInspectedDate.startsWith(currentMonthStr)
  );
  const extInspectedCount = extInspectedThisMonth.length;
  const extPendingCount = totalExtCount - extInspectedCount;
  const extFailedCount = currentExts.filter((e) => e.overallStatus === 'Fail').length;
  const extPassRate = totalExtCount > 0 ? Math.round(((totalExtCount - extFailedCount) / totalExtCount) * 100) : 100;

  // 2. --- CALCULATE LIFE JACKET METRICS ---
  const currentLJs = selectedFilterBoatId ? lifeJackets.filter(l => l.boatId === selectedFilterBoatId) : lifeJackets;
  const totalAdultJackets = currentLJs.reduce((sum, item) => sum + (item.totalAdults || 0), 0);
  const totalKidsJackets = currentLJs.reduce((sum, item) => sum + (item.totalKids || 0), 0);
  const failedLifeJacketsCount = currentLJs.filter(
    (item) => item.overallStatus === 'Fail' || 
    item.adultsStatus !== 'Normal' || 
    item.kidsStatus !== 'Normal' || 
    item.whistleStatus !== 'Normal' || 
    item.lightStatus !== 'Normal' || 
    item.cabinetStatus !== 'Normal' ||
    item.seats?.some(s => s.status === 'red' || s.status === 'orange')
  ).length;
  const lifeJacketPassRate = currentLJs.length > 0 
    ? Math.round(((currentLJs.length - failedLifeJacketsCount) / currentLJs.length) * 100) 
    : 100;

  // 3. --- CALCULATE VESSEL & STAFF LICENSE METRICS ---
  const currentLic = selectedFilterBoatId ? licenses.filter(l => l.boatId === selectedFilterBoatId) : licenses;
  const expiredLicensesCount = currentLic.filter(
    (l) => l.vesselLicenseStatus === 'Expired' || 
    l.helmsmanLicenseStatus === 'Expired' || 
    l.engineerLicenseStatus === 'Expired'
  ).length;
  const warningLicensesCount = currentLic.filter(
    (l) => (l.vesselLicenseStatus === 'NearExpiry' || 
    l.helmsmanLicenseStatus === 'NearExpiry' || 
    l.engineerLicenseStatus === 'NearExpiry') &&
    !(l.vesselLicenseStatus === 'Expired' || l.helmsmanLicenseStatus === 'Expired' || l.engineerLicenseStatus === 'Expired')
  ).length;
  const licensePassRate = currentLic.length > 0
    ? Math.round(((currentLic.length - expiredLicensesCount) / currentLic.length) * 100)
    : 100;

  // 4. --- CALCULATE MEDICAL STATION METRICS ---
  const currentMed = selectedFilterBoatId ? medicalStations.filter(s => s.targetId === selectedFilterBoatId) : medicalStations;
  const boatMedKits = currentMed.filter((s) => s.stationType === 'boat');
  const pierMedKits = currentMed.filter((s) => s.stationType === 'pier');
  const failedMedKitsCount = currentMed.filter((s) => s.overallStatus === 'Fail').length;
  const medicalPassRate = currentMed.length > 0
    ? Math.round(((currentMed.length - failedMedKitsCount) / currentMed.length) * 100)
    : 100;

  // Overall Safety Score (Average of 4 key pillars)
  const fleetSafetyScore = Math.round((extPassRate + lifeJacketPassRate + licensePassRate + medicalPassRate) / 4);

  // Identify all critical alerts across modules
  const extinguisherAlerts = extinguishers.map(e => {
    const physIssues = [
      e.pressureStatus !== 'Normal' ? `แรงดัน: ${e.pressureStatus === 'Low' ? 'ต่ำ' : 'สูงเกิน'}` : null,
      e.safetyPinStatus !== 'Normal' ? `สลักนิรภัย: ${e.safetyPinStatus === 'Missing' ? 'สูญหาย' : 'ชำรุด'}` : null,
      e.tankStatus !== 'Normal' ? `สภาพถัง: ${e.tankStatus === 'Rusted' ? 'ขึ้นสนิม' : 'บุบ/ชำรุด'}` : null,
      e.hoseStatus !== 'Normal' ? `สายฉีด: ชำรุด/แตกแห้ง` : null,
      e.weightStatus !== 'Normal' ? `น้ำหนักเคมี: ไม่ได้เกณฑ์` : null,
    ].filter(Boolean);

    const expInfo = checkExpiryStatus(e.expiryDate);
    const isPhysFaulty = e.overallStatus === 'Fail' || physIssues.length > 0;
    
    if (!isPhysFaulty && !expInfo.isNearExpiry && !expInfo.isExpired) {
      return null;
    }

    let title = `ถังดับเพลิงบกพร่องที่ ${e.location}`;
    let status: 'Fail' | 'Warning' = 'Fail';
    let detailsList = [...physIssues];

    if (expInfo.isExpired) {
      title = `⚠️ ถังดับเพลิงหมดอายุที่ ${e.location}`;
      status = 'Fail';
      detailsList.unshift(`หมดอายุเมื่อ ${formatExpiryThai(e.expiryDate)} (ล่วงเลยมา ${Math.abs(expInfo.daysRemaining)} วัน)`);
    } else if (expInfo.isNearExpiry) {
      title = `⚠️ ถังดับเพลิงใกล้หมดอายุที่ ${e.location}`;
      status = 'Warning';
      detailsList.unshift(`จะหมดอายุเมื่อ ${formatExpiryThai(e.expiryDate)} (เหลือเวลาอีก ${expInfo.daysRemaining} วัน)`);
    }

    return {
      type: 'extinguisher' as const,
      id: e.id,
      boatName: e.boatName,
      title,
      details: detailsList.join(', '),
      date: e.lastInspectedDate || 'ยังไม่ได้ตรวจ',
      status,
      raw: e
    };
  }).filter(Boolean) as Array<{
    type: 'extinguisher';
    id: string;
    boatName: string;
    title: string;
    details: string;
    date: string;
    status: 'Fail' | 'Warning';
    raw: any;
  }>;

  const lifeJacketAlerts = lifeJackets.filter(
    (item) => item.overallStatus === 'Fail' || 
    item.adultsStatus !== 'Normal' || 
    item.kidsStatus !== 'Normal' || 
    item.whistleStatus !== 'Normal' || 
    item.lightStatus !== 'Normal' || 
    item.cabinetStatus !== 'Normal' ||
    item.seats?.some(s => s.status === 'red' || s.status === 'orange')
  ).map(item => {
    const redSeats = item.seats?.filter(s => s.status === 'red').length || 0;
    const orangeSeats = item.seats?.filter(s => s.status === 'orange').length || 0;
    const seatIssues = [];
    if (redSeats > 0) seatIssues.push(`ไม่มีชูชีพที่ที่นั่ง ${redSeats} ตัว`);
    if (orangeSeats > 0) seatIssues.push(`ชำรุด/เก่าที่ที่นั่ง ${orangeSeats} ตัว`);

    return {
      type: 'lifejacket' as const,
      id: `LJ-${item.boatId}`,
      boatName: item.boatName,
      title: `ตรวจพบปัญหาเสื้อชูชีพ`,
      details: [
        item.adultsStatus !== 'Normal' ? `ชูชีพผู้ใหญ่: บกพร่อง` : null,
        item.kidsStatus !== 'Normal' ? `ชูชีพเด็ก: บกพร่อง` : null,
        item.whistleStatus !== 'Normal' ? `นกหวีด: ไม่สมบูรณ์` : null,
        item.lightStatus !== 'Normal' ? `ไฟสัญญาณ: ชำรุด/ถ่านหมด` : null,
        item.cabinetStatus !== 'Normal' ? `สภาพตู้จัดเก็บ: ไม่พร้อมใช้` : null,
        ...seatIssues
      ].filter(Boolean).join(', '),
      date: item.lastInspectedDate || 'ยังไม่ได้ตรวจ',
      status: 'Fail' as const,
      raw: item
    };
  });

  const licenseAlerts = licenses.filter(
    (l) => l.vesselLicenseStatus !== 'Normal' || 
    l.helmsmanLicenseStatus !== 'Normal' || 
    l.engineerLicenseStatus !== 'Normal'
  ).map(l => {
    const issues: string[] = [];
    if (l.vesselLicenseStatus === 'Expired') issues.push('ใบอนุญาตใช้เรือหมดอายุ');
    else if (l.vesselLicenseStatus === 'NearExpiry') issues.push('ใบอนุญาตใช้เรือใกล้หมดอายุ');

    if (l.helmsmanLicenseStatus === 'Expired') issues.push('ใบนายท้ายหมดอายุ');
    else if (l.helmsmanLicenseStatus === 'NearExpiry') issues.push('ใบนายท้ายใกล้หมดอายุ');

    if (l.engineerLicenseStatus === 'Expired') issues.push('ใบช่างเครื่องหมดอายุ');
    else if (l.engineerLicenseStatus === 'NearExpiry') issues.push('ใบช่างเครื่องใกล้หมดอายุ');

    const isExpired = l.vesselLicenseStatus === 'Expired' || l.helmsmanLicenseStatus === 'Expired' || l.engineerLicenseStatus === 'Expired';

    return {
      type: 'license' as const,
      id: `LIC-${l.boatId}`,
      boatName: l.boatName,
      title: isExpired ? `พบบัตรหรือใบอนุญาตชำรุด/หมดอายุ` : `แจ้งเตือนใบอนุญาตใกล้หมดอายุ`,
      details: issues.join(', '),
      date: l.lastInspectedDate || 'ยังไม่ได้ตรวจ',
      status: (isExpired ? 'Fail' : 'Warning') as 'Fail' | 'Warning',
      raw: l
    };
  });

  const medicalAlerts = medicalStations.map(s => {
    const issues: string[] = [];
    const nearExpiryIssues: string[] = [];
    const expiredIssues: string[] = [];
    
    const checkItem = (status: string, expiry: string, label: string) => {
      if (status === 'LowStock') issues.push(`${label}เหลือน้อย`);
      else if (status === 'Missing') issues.push(`ขาดแคลน ${label}`);
      else if (status === 'Damaged') issues.push(`${label}ชำรุด`);
      
      const exp = checkExpiryStatus(expiry);
      if (exp.isExpired || status === 'Expired') {
        expiredIssues.push(`${label}หมดอายุ (${expiry || 'ไม่ระบุ'})`);
      } else if (exp.isNearExpiry) {
        nearExpiryIssues.push(`${label}ใกล้หมดอายุใน ${exp.daysRemaining} วัน (${expiry})`);
      }
    };

    checkItem(s.paracetamolStatus, s.paracetamolExpiry, 'ยาพารา');
    checkItem(s.motionSicknessStatus, s.motionSicknessExpiry, 'ยาแก้เมา');
    checkItem(s.ammoniaStatus, s.ammoniaExpiry, 'แอมโมเนีย');
    checkItem(s.bandagesStatus, s.bandagesExpiry, 'พลาสเตอร์');
    checkItem(s.antacidStatus, s.antacidExpiry, 'ยาธาตุน้ำขาว');
    checkItem(s.cottonBudsStatus, s.cottonBudsExpiry, 'สำลีก้าน');
    checkItem(s.betadineStatus, s.betadineExpiry, 'เบตาดีน');
    checkItem(s.salineStatus, s.salineExpiry, 'น้ำเกลือ');
    checkItem(s.gauzeStatus, s.gauzeExpiry, 'ผ้าก๊อซ');
    checkItem(s.surgicalTapeStatus, s.surgicalTapeExpiry, 'เทปแต่งแผล');
    checkItem(s.cottonBallsStatus, s.cottonBallsExpiry, 'สำลีก้อน');

    if (s.containerStatus !== 'Normal') {
      issues.push('สภาพตู้อุปกรณ์ไม่สมบูรณ์');
    }

    const hasFailIssues = s.overallStatus === 'Fail' || issues.length > 0 || expiredIssues.length > 0;
    const hasWarningIssues = nearExpiryIssues.length > 0;

    if (!hasFailIssues && !hasWarningIssues) {
      return null;
    }

    let title = `ตรวจพบเวชภัณฑ์บกพร่อง (${s.stationType === 'boat' ? 'บนเรือ' : 'ท่าเทียบเรือ'})`;
    let status: 'Fail' | 'Warning' = 'Fail';
    let details = '';

    if (hasFailIssues) {
      status = 'Fail';
      const allFailText = [...expiredIssues, ...issues];
      details = allFailText.join(', ');
      if (expiredIssues.length > 0) {
        title = `⚠️ ตรวจพบยาหมดอายุ (${s.stationType === 'boat' ? 'บนเรือ' : 'ท่าเทียบเรือ'})`;
      }
    } else if (hasWarningIssues) {
      status = 'Warning';
      title = `⚠️ เวชภัณฑ์ใกล้หมดอายุ (${s.stationType === 'boat' ? 'บนเรือ' : 'ท่าเทียบเรือ'})`;
      details = nearExpiryIssues.join(', ');
    }

    return {
      type: 'medical' as const,
      id: s.id,
      boatName: s.targetName,
      title,
      details: details || 'มีรายการบกพร่องสะสม',
      date: s.lastInspectedDate || 'ยังไม่ได้ตรวจ',
      status,
      raw: s
    };
  }).filter(Boolean) as Array<{
    type: 'medical';
    id: string;
    boatName: string;
    title: string;
    details: string;
    date: string;
    status: 'Fail' | 'Warning';
    raw: any;
  }>;

  // Merge all alerts
  const allAlerts = [
    ...extinguisherAlerts,
    ...lifeJacketAlerts,
    ...licenseAlerts,
    ...medicalAlerts
  ];

  const filteredAlerts = selectedFilterBoatId 
    ? allAlerts.filter(alert => {
        const boat = boats.find(b => b.id === selectedFilterBoatId);
        return alert.boatName === boat?.name || (alert.raw && alert.raw.boatId === selectedFilterBoatId);
      })
    : allAlerts;

  // Group status for each of the 7 boats
  const detailedBoatStats = boats.map((b) => {
    // 1. Extinguisher status for this boat
    const boatExts = extinguishers.filter((e) => e.boatId === b.id);
    const extTotal = boatExts.length;
    const extInspected = boatExts.filter(e => e.lastInspectedDate && e.lastInspectedDate.startsWith(currentMonthStr)).length;
    const extFailing = boatExts.filter(e => e.overallStatus === 'Fail').length;
    const boatExtsExpired = boatExts.filter(e => checkExpiryStatus(e.expiryDate).isExpired).length;
    const boatExtsNearExpiry = boatExts.filter(e => checkExpiryStatus(e.expiryDate).isNearExpiry).length;
    
    let extStatusText = 'ยังไม่ตรวจ';
    let extStatusType: 'success' | 'warning' | 'error' = 'error';
    
    if (extFailing > 0 || boatExtsExpired > 0) {
      extStatusText = boatExtsExpired > 0 ? `🚨 หมดอายุ ${boatExtsExpired} ถัง` : `ชำรุด ${extFailing} ถัง`;
      extStatusType = 'error';
    } else if (boatExtsNearExpiry > 0) {
      extStatusText = `⚠️ ใกล้หมดอายุ ${boatExtsNearExpiry} ถัง`;
      extStatusType = 'warning';
    } else if (extInspected === extTotal) {
      extStatusText = 'ตรวจครบถ้วน';
      extStatusType = 'success';
    } else if (extInspected > 0) {
      extStatusText = `ตรวจแล้ว ${extInspected}/${extTotal}`;
      extStatusType = 'warning';
    }

    // 2. Life jacket status for this boat
    const boatLJ = lifeJackets.find(l => l.boatId === b.id);
    let ljStatusText = 'ยังไม่ได้ตรวจ';
    let ljStatusType: 'success' | 'warning' | 'error' = 'error';
    if (boatLJ) {
      const redSeats = boatLJ.seats?.filter(s => s.status === 'red').length || 0;
      const orangeSeats = boatLJ.seats?.filter(s => s.status === 'orange').length || 0;
      const hasSeatIssues = redSeats > 0 || orangeSeats > 0;

      if (boatLJ.overallStatus === 'Pass' && !hasSeatIssues) {
        ljStatusText = `ปกติ (${boatLJ.totalAdults + boatLJ.totalKids} ตัว)`;
        ljStatusType = 'success';
      } else {
        const issues = [];
        if (boatLJ.adultsStatus !== 'Normal' || boatLJ.kidsStatus !== 'Normal') {
          issues.push('ชำรุดหลัก');
        } else {
          if (redSeats > 0) issues.push(`ขาด ${redSeats} ที่นั่ง`);
          if (orangeSeats > 0) issues.push(`ชำรุด ${orangeSeats} ที่นั่ง`);
        }
        ljStatusText = issues.length > 0 ? issues.join(', ') : 'พบบกพร่อง';
        ljStatusType = 'error';
      }
    }

    // 3. License status for this boat
    const boatLic = licenses.find(l => l.boatId === b.id);
    let licStatusText = 'ยังไม่ได้ตรวจ';
    let licStatusType: 'success' | 'warning' | 'error' = 'error';
    if (boatLic) {
      const expired = boatLic.vesselLicenseStatus === 'Expired' || boatLic.helmsmanLicenseStatus === 'Expired' || boatLic.engineerLicenseStatus === 'Expired';
      const warning = boatLic.vesselLicenseStatus === 'NearExpiry' || boatLic.helmsmanLicenseStatus === 'NearExpiry' || boatLic.engineerLicenseStatus === 'NearExpiry';
      
      if (expired) {
        licStatusText = 'มีหมดอายุ!';
        licStatusType = 'error';
      } else if (warning) {
        licStatusText = 'ใกล้หมดอายุ';
        licStatusType = 'warning';
      } else {
        licStatusText = 'ถูกต้อง 3 ใบ';
        licStatusType = 'success';
      }
    }

    // 4. Medical kit status for this boat (targetId or matching boatName)
    const boatMed = medicalStations.find(s => s.stationType === 'boat' && s.targetId === b.id);
    let medStatusText = 'ไม่มีข้อมูล';
    let medStatusType: 'success' | 'warning' | 'error' = 'warning';
    if (boatMed) {
      let boatMedExpired = 0;
      let boatMedNearExpiry = 0;
      const checkItemExp = (expiry: string) => {
        const exp = checkExpiryStatus(expiry);
        if (exp.isExpired) boatMedExpired++;
        if (exp.isNearExpiry) boatMedNearExpiry++;
      };
      checkItemExp(boatMed.paracetamolExpiry);
      checkItemExp(boatMed.motionSicknessExpiry);
      checkItemExp(boatMed.ammoniaExpiry);
      checkItemExp(boatMed.bandagesExpiry);
      checkItemExp(boatMed.antacidExpiry);
      checkItemExp(boatMed.cottonBudsExpiry);
      checkItemExp(boatMed.betadineExpiry);
      checkItemExp(boatMed.salineExpiry);
      checkItemExp(boatMed.gauzeExpiry);
      checkItemExp(boatMed.surgicalTapeExpiry);
      checkItemExp(boatMed.cottonBallsExpiry);

      if (boatMed.overallStatus === 'Fail' || boatMedExpired > 0) {
        medStatusText = boatMedExpired > 0 ? `🚨 หมดอายุ ${boatMedExpired} รายการ` : 'พบบกพร่อง';
        medStatusType = 'error';
      } else if (boatMedNearExpiry > 0) {
        medStatusText = `⚠️ ใกล้หมดอายุ (${boatMedNearExpiry} รายการ)`;
        medStatusType = 'warning';
      } else if (boatMed.overallStatus === 'Pass') {
        medStatusText = 'ปกติสมบูรณ์';
        medStatusType = 'success';
      }
    }

    const hasError = extStatusType === 'error' || 
                      ljStatusType === 'error' || 
                      licStatusType === 'error' || 
                      medStatusType === 'error';

    const hasWarning = extStatusType === 'warning' || 
                        licStatusType === 'warning' || 
                        medStatusType === 'warning';

    let boatStatusState: 'success' | 'warning' | 'error' = 'success';
    if (hasError) {
      boatStatusState = 'error';
    } else if (hasWarning) {
      boatStatusState = 'warning';
    }

    return {
      id: b.id,
      name: b.name,
      ext: { text: extStatusText, type: extStatusType, count: extTotal, inspected: extInspected },
      lj: { text: ljStatusText, type: ljStatusType as 'success' | 'warning' | 'error', raw: boatLJ },
      lic: { text: licStatusText, type: licStatusType, raw: boatLic },
      med: { text: medStatusText, type: medStatusType, raw: boatMed },
      extStatus: extStatusType === 'error' ? 'Fail' : 'Pass',
      ljStatus: ljStatusType === 'error' ? 'Fail' : 'Pass',
      licStatus: licStatusType === 'error' ? 'Fail' : 'Pass',
      medStatus: medStatusType === 'error' ? 'Fail' : 'Pass',
      boatStatusState,
      overallPass: !hasError
    };
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {viewMode === 'summary-only' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card in clean, high-contrast light mode with white background */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                <FileSpreadsheet className="h-4 w-4" />
                ตารางสรุปมาตรฐานความปลอดภัยเรือ
              </div>
              <h2 className="text-xl font-black text-slate-950">ตารางสรุปภาพรวมความปลอดภัยรายลำเรือ</h2>
              <p className="text-xs text-slate-500 font-bold">สรุปสถานะ Pass/Fail ของทุกหมวดหมู่ (ถังดับเพลิง, เวชภัณฑ์, ชูชีพ, ใบอนุญาต)</p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-300 p-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-1.5 px-3 border-r border-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-black text-slate-700">ปกติ (Pass)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                <span className="text-[10px] font-black text-slate-700">บกพร่อง (Fail)</span>
              </div>
            </div>
          </div>

          {/* Table Container in clean, light mode with white background */}
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-slate-600 font-black text-[10px] uppercase tracking-widest border-b border-slate-300">
                    <th className="p-5 w-48">ชื่อเรือ (Vessel Name)</th>
                    <th className="p-5 text-center">ถังดับเพลิง</th>
                    <th className="p-5 text-center">เวชภัณฑ์</th>
                    <th className="p-5 text-center">ชูชีพ</th>
                    <th className="p-5 text-center">ใบอนุญาต</th>
                    <th className="p-5 text-center">สถานะภาพรวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {detailedBoatStats.map((stat) => (
                    <tr key={stat.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${
                            stat.overallPass ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'
                          }`}>
                            <BoatIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-950 group-hover:text-indigo-600 transition-colors">{stat.name}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{stat.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                            stat.extStatus === 'Pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {stat.extStatus === 'Pass' ? 'PASS' : 'FAIL'}
                          </div>
                          <span className="text-[9px] font-black text-slate-600 uppercase">{stat.ext.text}</span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                            stat.medStatus === 'Pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {stat.medStatus === 'Pass' ? 'PASS' : 'FAIL'}
                          </div>
                          <span className="text-[9px] font-bold text-slate-600 uppercase">{stat.med.text}</span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                            stat.ljStatus === 'Pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {stat.ljStatus === 'Pass' ? 'PASS' : 'FAIL'}
                          </div>
                          <span className="text-[9px] font-bold text-slate-600 uppercase">{stat.lj.text}</span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                            stat.licStatus === 'Pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {stat.licStatus === 'Pass' ? 'PASS' : 'FAIL'}
                          </div>
                          <span className="text-[9px] font-bold text-slate-600 uppercase">{stat.lic.text}</span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm ${
                          stat.overallPass 
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/10' 
                            : 'bg-rose-500 text-white border-rose-400 shadow-rose-500/10'
                        }`}>
                          {stat.overallPass ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                          <span className="text-xs font-black uppercase tracking-widest">{stat.overallPass ? 'Secure' : 'Unsafe'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-white border-t border-slate-300 flex items-center justify-between">
               <div className="text-[10px] font-bold text-slate-550 uppercase tracking-widest">
                 ข้อมูลวิเคราะห์โดย CHAO PHRAYA SAFETY ENGINE • ประจำงวดเดือน {currentMonthThai}
               </div>
               <button 
                 onClick={() => onNavigateModule?.('security')}
                 className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:text-indigo-800 transition-all"
               >
                 ดูรายละเอียดความปลอดภัยรายลำ <ArrowRight className="h-3 w-3" />
               </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'full' && (
        <>
          {/* 1. Welcoming Dynamic Header & Comprehensive Safety Score Banner */}
          <div className="bg-white text-slate-950 rounded-2xl border-2 border-slate-300 p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none transform translate-x-24 -translate-y-24"></div>
            <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-2.5 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[10.5px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                🛡️ CHAOPHRAYA MARITIME COMPLIANCE ENGINE
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 leading-tight">
                สรุปข้อมูลความปลอดภัยเรือท่องเที่ยวกองเรือหลวง
              </h2>
              <p className="text-xs text-slate-650 leading-relaxed max-w-xl font-medium">
                อัปเดตระบบตรวจสอบสารบรรณความปลอดภัยล่าสุดประจำงวด <span className="text-emerald-600 font-bold underline underline-offset-4 decoration-2">{currentMonthThai} {currentYearThai}</span> ครอบคลุมเครื่องดับเพลิง เสื้อชูชีพ ใบอนุญาตใช้เรือ ใบอนุญาตเดินเรือ และตู้ปฐมพยาบาลเวชภัณฑ์ ทั้งหมดในที่เดียว
              </p>
            </div>

            {/* Dynamic score graphic widget */}
            <div className="flex items-center gap-4 bg-white p-4.5 rounded-2xl border border-slate-300 shrink-0 relative z-10 self-start md:self-center shadow-sm">
              <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
                {/* SVG circle stroke */}
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="stroke-slate-200"
                    strokeWidth="6.5"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className={`${fleetSafetyScore >= 90 ? 'stroke-emerald-600' : fleetSafetyScore >= 75 ? 'stroke-amber-500' : 'stroke-rose-600'} transition-all duration-1000`}
                    strokeWidth="6.5"
                    fill="transparent"
                    strokeDasharray="213.6"
                    strokeDashoffset={213.6 - (213.6 * fleetSafetyScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black font-mono leading-none block text-slate-950 tracking-tighter">{fleetSafetyScore}%</span>
                  <span className="text-[8px] text-slate-500 block uppercase font-mono tracking-widest font-extrabold mt-0.5">READY</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">ดัชนีพร้อมใช้งาน (Compliance Index)</span>
                <span className={`text-sm font-black block ${fleetSafetyScore >= 90 ? 'text-emerald-600' : fleetSafetyScore >= 75 ? 'text-amber-500' : 'text-rose-600'}`}>
                  {fleetSafetyScore >= 90 ? '✅ มาตรฐานความปลอดภัยดีเยี่ยม' : fleetSafetyScore >= 75 ? '⚠️ ควรเฝ้าระวังและปรับปรุง' : '🚨 ต่ำกว่าเกณฑ์มาตรฐานความปลอดภัย'}
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight">วิเคราะห์สังเคราะห์ร่วมจาก 4 มิติความปลอดภัยเรือ</span>
              </div>
            </div>
          </div>

          {/* 2. Main Split Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side: 7 Boats Status Center (Boat Inspection Grid) */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-sm lg:col-span-2 space-y-4 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-300 gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-950 uppercase tracking-tight flex items-center gap-1.5">
                    <BoatIcon className="h-5 w-5 text-teal-600" />
                    แผงควบคุมรายลำเรือ (Vessel Status Grid)
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">สรุปความปลอดภัยรวม 4 ด้านรายลำเรือ คลิกที่ลำเรือเพื่อคัดกรองข้อมูล</p>
                </div>
                
                <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-lg border border-slate-300">
                  <button
                    onClick={() => setSelectedFilterBoatId(null)}
                    className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-tighter ${
                      !selectedFilterBoatId 
                        ? 'bg-white text-slate-950 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-200 hover:text-slate-950'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {boats.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedFilterBoatId(b.id)}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-tighter ${
                        selectedFilterBoatId === b.id 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-500 hover:bg-slate-200 hover:text-slate-950'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overall Fleet Compliance Matrix */}
              <div className="overflow-x-auto rounded-xl border border-slate-300 mb-6 bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-300">
                      <th className="px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">ลำเรือ (Boat)</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">🧯 ดับเพลิง</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">🧡 ชูชีพ</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">📜 ใบอนุญาต</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">🏥 ตู้ยา</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">ผลประเมิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedBoatStats
                      .filter(boat => !selectedFilterBoatId || boat.id === selectedFilterBoatId)
                      .map((boat) => (
                      <tr key={boat.id} className="border-b border-slate-300 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${boat.boatStatusState === 'error' ? 'bg-red-500' : boat.boatStatusState === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span className="text-sm font-black text-slate-950 uppercase tracking-tighter">{boat.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${boat.extStatus === 'Fail' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {boat.extStatus === 'Fail' ? 'FAIL' : 'PASS'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${boat.ljStatus === 'Fail' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {boat.ljStatus === 'Fail' ? 'FAIL' : 'PASS'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${boat.licStatus === 'Fail' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {boat.licStatus === 'Fail' ? 'FAIL' : 'PASS'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${boat.medStatus === 'Fail' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {boat.medStatus === 'Fail' ? 'FAIL' : 'PASS'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            boat.boatStatusState === 'error' 
                              ? 'bg-red-600 text-white shadow-sm' 
                              : boat.boatStatusState === 'warning'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-emerald-600 text-white shadow-sm'
                          }`}>
                            {boat.boatStatusState === 'error' ? 'ไม่ผ่านเกณฑ์' : boat.boatStatusState === 'warning' ? 'ควรระวัง' : 'พร้อมบริการ'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {detailedBoatStats
                  .filter(boat => !selectedFilterBoatId || boat.id === selectedFilterBoatId)
                  .map((boat) => (
                  <div
                    key={boat.id}
                    onClick={() => {
                      setSelectedFilterBoatId(boat.id);
                      setSelectedMapBoatId(boat.id);
                    }}
                    className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer relative flex flex-col justify-between ${
                      boat.boatStatusState === 'error' 
                        ? 'bg-rose-50 border-rose-200 hover:border-rose-500' 
                        : boat.boatStatusState === 'warning'
                        ? 'bg-amber-50 border-amber-200 hover:border-amber-500'
                        : 'bg-white border-slate-300 hover:border-teal-500 hover:bg-slate-50'
                    }`}
                    id={`boat-card-${boat.id}`}
                  >
                    <div>
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-300">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 text-white rounded-lg ${
                            boat.boatStatusState === 'error' ? 'bg-rose-600 animate-pulse' :
                            boat.boatStatusState === 'warning' ? 'bg-amber-500' : 'bg-white'
                          }`}>
                            <BoatIcon className="h-4 w-4" />
                          </div>
                          <span className="font-extrabold text-slate-950 text-sm tracking-tight">{boat.name}</span>
                        </div>
                        {boat.boatStatusState === 'error' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black rounded-full shadow-sm">
                            ⚠️ พบบกพร่อง
                          </span>
                        ) : boat.boatStatusState === 'warning' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black rounded-full">
                            ⚠️ ใกล้หมดอายุ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black rounded-full">
                            <Check className="h-3 w-3 text-emerald-600 stroke-[3px]" /> ผ่านมาตรฐาน
                          </span>
                        )}
                      </div>
     
                      {/* Badges checklist for safety pillars */}
                      <div className="mt-3.5 grid grid-cols-2 gap-2">
                        
                        {/* Pillar A: Extinguishers */}
                        <div className="flex flex-col gap-1.5 text-[10px] bg-white p-2 rounded-lg border border-slate-300 shadow-sm">
                          <span className="text-slate-600 font-bold flex items-center justify-center gap-1.5">
                            <Flame className="h-3.5 w-3.5 text-slate-500 shrink-0" /> ถังดับเพลิง
                          </span>
                          <span className={`font-black font-mono px-1.5 py-1 rounded-md text-center text-[10px] border ${
                            boat.ext.type === 'success' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : boat.ext.type === 'warning'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {boat.ext.text}
                          </span>
                        </div>
     
                        {/* Pillar B: Life Jackets */}
                        <div className="flex flex-col gap-1.5 text-[10px] bg-white p-2 rounded-lg border border-slate-300 shadow-sm">
                          <span className="text-slate-600 font-bold flex items-center justify-center gap-1.5">
                            <LifeBuoy className="h-3.5 w-3.5 text-slate-500 shrink-0" /> เสื้อชูชีพ
                          </span>
                          <span className={`font-black px-1.5 py-1 rounded-md text-center text-[10px] border ${
                            boat.lj.type === 'success' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : boat.lj.type === 'warning'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {boat.lj.text}
                          </span>
                        </div>

                        {/* Pillar C: Licenses */}
                        <div className="flex flex-col gap-1.5 text-[10px] bg-white p-2 rounded-lg border border-slate-300 shadow-sm">
                          <span className="text-slate-600 font-bold flex items-center justify-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" /> ใบอนุญาต
                          </span>
                          <span className={`font-black px-1.5 py-1 rounded-md text-center text-[10px] border ${
                            boat.lic.type === 'success' 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                              : boat.lic.type === 'warning'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {boat.lic.text}
                          </span>
                        </div>
     
                        {/* Pillar D: Medical */}
                        <div className="flex flex-col gap-1.5 text-[10px] bg-white p-2 rounded-lg border border-slate-300 shadow-sm">
                          <span className="text-slate-600 font-bold flex items-center justify-center gap-1.5">
                            <HeartPulse className="h-3.5 w-3.5 text-slate-500 shrink-0" /> เวชภัณฑ์
                          </span>
                          <span className={`font-black px-1.5 py-1 rounded-md text-center text-[10px] border ${
                            boat.med.type === 'success' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : boat.med.type === 'warning'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {boat.med.text}
                          </span>
                        </div>
                      </div>
                    </div>
     
                    <div className="mt-4 pt-3 border-t border-slate-300 text-[10.5px] font-black text-slate-550 flex items-center justify-between group-hover:text-indigo-600 transition-colors">
                      <span>คลิกเพื่อเปิดดูรายละเอียดความปลอดภัยลำเรือ</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Consolidated Safety Warning Alerts Center */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col justify-between transition-all duration-300">
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-300 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-950 flex items-center gap-1.5">
                      <AlertTriangle className="h-5 w-5 text-rose-600 animate-pulse" />
                      รายการเฝ้าระวังบกพร่องสะสม
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">พบบกพร่องรวมทุกหมวดหมู่งานความปลอดภัยเรือ{selectedFilterBoatId ? ` เฉพาะเรือ ${boats.find(b => b.id === selectedFilterBoatId)?.name}` : ''}</p>
                  </div>
                  <span className="font-mono text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">
                    {filteredAlerts.length}
                  </span>
                </div>

                {filteredAlerts.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 bg-white border border-dashed border-slate-300 rounded-xl">
                    <div className="p-3 bg-emerald-50 text-emerald-750 rounded-full border border-emerald-200">
                      <ShieldCheck className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-950 uppercase tracking-wider">เรืออยู่ในสภาพสมบูรณ์ 100%</div>
                      <div className="text-[11px] text-slate-550 px-6 mt-1 leading-relaxed">
                        {selectedFilterBoatId 
                          ? `เรือ ${boats.find(b => b.id === selectedFilterBoatId)?.name} ไม่พบบกพร่องสะสมในระบบ`
                          : 'ตรวจไม่พบบกพร่องสะสม ทั้งในระบบถังดับเพลิง เสื้อชูชีพ ยาหมดอายุ หรือใบอนุญาตเรือหมดกำหนด'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredAlerts.map((alert, idx) => {
                      const isFail = alert.status === 'Fail';
                      const alertBadge = alert.type === 'extinguisher' ? '🧯 ดับเพลิง' : alert.type === 'lifejacket' ? '🧡 เสื้อชูชีพ' : alert.type === 'license' ? '🚢 ใบอนุญาต' : '🏥 ตู้ยา';
                      
                      const handleClick = () => {
                        if (alert.type === 'extinguisher') {
                          onSelectExtinguisher(alert.raw);
                        } else if (alert.type === 'lifejacket') {
                          onNavigateTab?.('lifejackets');
                        } else if (alert.type === 'license') {
                          onNavigateTab?.('licenses');
                        } else if (alert.type === 'medical') {
                          onNavigateModule?.('medical');
                        }
                      };

                      return (
                        <div
                          key={idx}
                          onClick={handleClick}
                          className={`p-3 border rounded-xl flex justify-between items-start cursor-pointer transition-all hover:bg-slate-50 ${
                            isFail 
                              ? 'border-rose-200 bg-rose-50/50 border-l-4 border-l-rose-500' 
                              : 'border-amber-200 bg-amber-50/50 border-l-4 border-l-amber-500'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border leading-none ${
                                alert.type === 'extinguisher' 
                                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                  : alert.type === 'lifejacket'
                                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                                  : alert.type === 'license'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {alertBadge}
                              </span>
                              <span className="text-xs font-black text-slate-950">{alert.boatName}</span>
                            </div>
                            <h4 className="text-[11.5px] font-bold text-slate-950 leading-tight">{alert.title}</h4>
                            <p className="text-[10.5px] text-slate-600 leading-tight font-medium">{alert.details}</p>
                          </div>
                          <div className="text-right flex flex-col justify-between h-full min-h-[50px] shrink-0 ml-3">
                            <span className="text-[9px] text-slate-500 block font-mono">{alert.date}</span>
                            <span className={`text-[8.5px] px-1 py-0.5 font-bold font-mono tracking-widest uppercase inline-block text-center rounded mt-2 border ${
                              isFail ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {alert.status === 'Fail' ? 'FAULTY' : 'WARNING'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-6 border-t border-slate-300 bg-white text-slate-950 p-4 rounded-xl space-y-2">
                <div className="text-[9px] font-extrabold text-slate-550 block tracking-widest uppercase font-mono">ข้อกำหนดความปลอดภัยประจำวันเชิงปฏิบัติการ (Daily Routine Checklist)</div>
                <ul className="text-[10px] text-slate-655 space-y-1.5 list-none leading-relaxed">
                  <li className="flex gap-1.5 items-start">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>พนักงานเรือทุกคนต้องมีใบอนุญาตทำการในเรือที่ถูกต้องและยังไม่หมดกำหนด</span>
                  </li>
                  <li className="flex gap-1.5 items-start">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>เสื้อชูชีพผู้โดยสารต้องจัดเตรียมพร้อมใช้ นกหวีด และไฟสัญญาณใช้งานได้สมบูรณ์</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 5. Interactive Seat Map / Life Jacket Map */}
      {viewMode === 'lifejacket-map' && (
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-6 border-b border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-200">
                <Grid className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">VIEWPORT: INTERACTIVE TACTILE COMPLIANCE GRID</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">แผนผังจุดติดตั้งเสื้อชูชีพแบบรายที่นั่ง (Life Jacket Seat Map Visualizer)</p>
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {boats.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedMapBoatId(b.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border uppercase font-mono shadow-sm transition-all cursor-pointer whitespace-nowrap ${
                    (selectedMapBoatId ? selectedMapBoatId === b.id : boats[0]?.id === b.id)
                      ? 'bg-indigo-600 text-white border-indigo-700 font-extrabold'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 min-h-[500px] flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                <span className="text-xs font-black text-slate-950 uppercase tracking-tighter">🚢 {selectedMapBoat?.name || 'Vessel'} SEAT MAP</span>
              </div>
              <div className="text-[10px] font-black text-amber-600 animate-pulse uppercase tracking-widest bg-amber-50 px-3 py-1 rounded border border-amber-200">
                จิ้มตรวจสอบเสื้อชูชีพแบบเต็มจอได้ที่ผังนี้
              </div>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-slate-300 p-4 shadow-inner">
              <SeatMapGrid 
                seats={lifeJackets.find(l => l.boatId === (selectedMapBoatId || boats[0]?.id))?.seats || []}
                boatName={selectedMapBoat?.name}
                interactive={false}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">ชูชีพปกติ (🟢)</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">
                  {lifeJackets.find(l => l.boatId === (selectedMapBoatId || boats[0]?.id))?.seats?.filter(s => s.status === 'green').length || 0} ตัว
                </span>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">ไม่มีชูชีพ (🔴)</span>
                <span className="text-2xl font-black text-rose-700 font-mono">
                  {lifeJackets.find(l => l.boatId === (selectedMapBoatId || boats[0]?.id))?.seats?.filter(s => s.status === 'red').length || 0} ตัว
                </span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">ชูชีพชำรุด/เก่า (🟠)</span>
                <span className="text-2xl font-black text-amber-700 font-mono">
                  {lifeJackets.find(l => l.boatId === (selectedMapBoatId || boats[0]?.id))?.seats?.filter(s => s.status === 'orange').length || 0} ตัว
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive Deck Blueprint / Fire Extinguisher Map */}
      {viewMode === 'map-only' && (
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-6 border-b border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <div>
              <h3 className="text-base font-black text-slate-950 uppercase tracking-tight flex items-center gap-1.5">
                <MapIcon className="h-5 w-5 text-indigo-600" />
                แผนผังจุดติดตั้งถังดับเพลิงประจำเรือ (Interactive Deck Blueprint)
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1">แสดงตำแหน่งถังดับเพลิงและสถานะการตรวจสอบล่าสุดบนโครงสร้างเรือ</p>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {boats.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedMapBoatId(b.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border uppercase font-mono shadow-sm transition-all cursor-pointer whitespace-nowrap ${
                    (selectedMapBoatId ? selectedMapBoatId === b.id : boats[0]?.id === b.id)
                      ? 'bg-indigo-600 text-white border-indigo-700 font-extrabold'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 min-h-[400px]">
            <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-inner">
              {selectedMapBoat ? (
                <BoatMap 
                  boat={selectedMapBoat}
                  extinguishers={extinguishers}
                  onInspectExtinguisher={onSelectExtinguisher}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm font-bold">
                  กรุณาเลือกเรือเพื่อดูแผนผัง
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
