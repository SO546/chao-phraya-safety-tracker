import React, { useEffect, useState } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import { db } from '../lib/firestore';
import { collection, getDocs } from 'firebase/firestore';
import {
  Boat,
  FireExtinguisher,
  BoatLifeJacketState,
  BoatLicenseState,
  MedicalKitStation
} from '../types';
import BackupRestore from './BackupRestore';

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

  // Callback for restore data
  onRestoreData?: (data: any) => void;
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
  onRestoreData,
}: DashboardProps) {
  // Current month in YYYY-MM
  const currentMonthStr = new Date().toISOString().substring(0, 7); // "2026-06"
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const currentYearThai = new Date().getFullYear() + 543;
  const currentMonthThai = thaiMonths[new Date().getMonth()];

  // Fetch data from Firebase 'safety' collection
  const [safetyData, setSafetyData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูลจากคอลเล็กชันชื่อ "safety" ที่เราไปสร้างไว้ในระบบ
        const querySnapshot = await getDocs(collection(db, 'safety'));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setSafetyData(data);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      }
    };

    fetchData();
  }, []);

  // 1. --- CALCULATE FIRE EXTINGUISHER METRICS ---
  const totalExtCount = extinguishers.length;
  const extInspectedThisMonth = extinguishers.filter(
    (e) => e.lastInspectedDate && e.lastInspectedDate.startsWith(currentMonthStr)
  );
  const extInspectedCount = extInspectedThisMonth.length;
  const extPendingCount = totalExtCount - extInspectedCount;
  const extFailedCount = extinguishers.filter((e) => e.overallStatus === 'Fail').length;
  const extPassRate = totalExtCount > 0 ? Math.round(((totalExtCount - extFailedCount) / totalExtCount) * 100) : 100;

  // 2. --- CALCULATE LIFE JACKET METRICS ---
  const totalAdultJackets = lifeJackets.reduce((sum, item) => sum + (item.totalAdults || 0), 0);
  const totalKidsJackets = lifeJackets.reduce((sum, item) => sum + (item.totalKids || 0), 0);
  const failedLifeJacketsCount = lifeJackets.filter(
    (item) => item.overallStatus === 'Fail' || 
    item.adultsStatus !== 'Normal' || 
    item.kidsStatus !== 'Normal' || 
    item.whistleStatus !== 'Normal' || 
    item.lightStatus !== 'Normal' || 
    item.cabinetStatus !== 'Normal' ||
    item.seats?.some(s => s.status === 'red' || s.status === 'orange')
  ).length;
  const lifeJacketPassRate = lifeJackets.length > 0 
    ? Math.round(((lifeJackets.length - failedLifeJacketsCount) / lifeJackets.length) * 100) 
    : 100;

  // 3. --- CALCULATE VESSEL & STAFF LICENSE METRICS ---
  const expiredLicensesCount = licenses.filter(
    (l) => l.vesselLicenseStatus === 'Expired' || 
    l.helmsmanLicenseStatus === 'Expired' || 
    l.engineerLicenseStatus === 'Expired'
  ).length;
  const warningLicensesCount = licenses.filter(
    (l) => (l.vesselLicenseStatus === 'NearExpiry' || 
    l.helmsmanLicenseStatus === 'NearExpiry' || 
    l.engineerLicenseStatus === 'NearExpiry') &&
    !(l.vesselLicenseStatus === 'Expired' || l.helmsmanLicenseStatus === 'Expired' || l.engineerLicenseStatus === 'Expired')
  ).length;
  const licensePassRate = licenses.length > 0
    ? Math.round(((licenses.length - expiredLicensesCount) / licenses.length) * 100)
    : 100;

  // 4. --- CALCULATE MEDICAL STATION METRICS ---
  const boatMedKits = medicalStations.filter((s) => s.stationType === 'boat');
  const pierMedKits = medicalStations.filter((s) => s.stationType === 'pier');
  const failedMedKitsCount = medicalStations.filter((s) => s.overallStatus === 'Fail').length;
  const medicalPassRate = medicalStations.length > 0
    ? Math.round(((medicalStations.length - failedMedKitsCount) / medicalStations.length) * 100)
    : 100;

  // Overall Safety Score (Average of 4 key pillars)
  const fleetSafetyScore = Math.round((extPassRate + lifeJacketPassRate + licensePassRate + medicalPassRate) / 4);

  // Identify all critical alerts across modules
  const extinguisherAlerts = extinguishers.filter(
    (e) => e.overallStatus === 'Fail' ||
      e.pressureStatus !== 'Normal' ||
      e.safetyPinStatus !== 'Normal' ||
      e.tankStatus !== 'Normal' ||
      e.hoseStatus !== 'Normal' ||
      e.weightStatus !== 'Normal'
  ).map(e => ({
    type: 'extinguisher' as const,
    id: e.id,
    boatName: e.boatName,
    title: `ถังดับเพลิงบกพร่องที่ ${e.location}`,
    details: [
      e.pressureStatus !== 'Normal' ? `แรงดัน: ${e.pressureStatus === 'Low' ? 'ต่ำ' : 'สูงเกิน'}` : null,
      e.safetyPinStatus !== 'Normal' ? `สลักนิรภัย: ${e.safetyPinStatus === 'Missing' ? 'สูญหาย' : 'ชำรุด'}` : null,
      e.tankStatus !== 'Normal' ? `สภาพถัง: ${e.tankStatus === 'Rusted' ? 'ขึ้นสนิม' : 'บุบ/ชำรุด'}` : null,
      e.hoseStatus !== 'Normal' ? `สายฉีด: ชำรุด/แตกแห้ง` : null,
      e.weightStatus !== 'Normal' ? `น้ำหนักเคมี: ไม่ได้เกณฑ์` : null,
    ].filter(Boolean).join(', '),
    date: e.lastInspectedDate || 'ยังไม่ได้ตรวจ',
    status: 'Fail' as const,
    raw: e
  }));

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

  const medicalAlerts = medicalStations.filter(
    (s) => s.overallStatus === 'Fail'
  ).map(s => {
    const issues: string[] = [];
    
    const checkItem = (status: string, label: string) => {
      if (status === 'Expired') issues.push(`${label}หมดอายุ`);
      else if (status === 'LowStock') issues.push(`${label}เหลือน้อย`);
      else if (status === 'Missing') issues.push(`ขาดแคลน ${label}`);
    };

    checkItem(s.paracetamolStatus, 'ยาพารา');
    checkItem(s.motionSicknessStatus, 'ยาแก้เมา');
    checkItem(s.ammoniaStatus, 'แอมโมเนีย');
    checkItem(s.betadineStatus, 'เบตาดีน');
    checkItem(s.salineStatus, 'น้ำเกลือ');
    checkItem(s.gauzeStatus, 'ผ้าก๊อซ');
    checkItem(s.bandagesStatus, 'พลาสเตอร์');
    checkItem(s.cottonBallsStatus, 'สำลี');

    if (s.containerStatus !== 'Normal') issues.push('สภาพตู้อุปกรณ์ไม่สมบูรณ์');

    return {
      type: 'medical' as const,
      id: s.id,
      boatName: s.targetName,
      title: `ตรวจพบเวชภัณฑ์บกพร่อง/ยาหมดอายุ (${s.stationType === 'boat' ? 'บนเรือ' : 'ท่าเทียบเรือ'})`,
      details: issues.length > 0 ? issues.join(', ') : 'มีรายการบกพร่องสะสม',
      date: s.lastInspectedDate || 'ยังไม่ได้ตรวจ',
      status: 'Fail' as const,
      raw: s
    };
  });

  // Merge all alerts
  const allAlerts = [
    ...extinguisherAlerts,
    ...lifeJacketAlerts,
    ...licenseAlerts,
    ...medicalAlerts
  ];

  // Group status for each of the 7 boats
  const detailedBoatStats = boats.map((b) => {
    // 1. Extinguisher status for this boat
    const boatExts = extinguishers.filter((e) => e.boatId === b.id);
    const extTotal = boatExts.length;
    const extInspected = boatExts.filter(e => e.lastInspectedDate && e.lastInspectedDate.startsWith(currentMonthStr)).length;
    const extFailing = boatExts.filter(e => e.overallStatus === 'Fail').length;
    
    let extStatusText = 'ยังไม่ตรวจ';
    let extStatusType: 'success' | 'warning' | 'error' = 'error';
    if (extInspected === extTotal && extFailing === 0) {
      extStatusText = 'ตรวจครบถ้วน';
      extStatusType = 'success';
    } else if (extFailing > 0) {
      extStatusText = `ชำรุด ${extFailing} ถัง`;
      extStatusType = 'error';
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
      if (boatMed.overallStatus === 'Pass') {
        medStatusText = 'ปกติสมบูรณ์';
        medStatusType = 'success';
      } else {
        medStatusText = 'ยาหมดอายุ/ขาด';
        medStatusType = 'error';
      }
    }

    return {
      id: b.id,
      name: b.name,
      ext: { text: extStatusText, type: extStatusType, count: extTotal, inspected: extInspected },
      lj: { text: ljStatusText, type: ljStatusType, raw: boatLJ },
      lic: { text: licStatusText, type: licStatusType, raw: boatLic },
      med: { text: medStatusText, type: medStatusType, raw: boatMed },
      overallPass: extFailing === 0 && (!boatLJ || boatLJ.overallStatus === 'Pass') && (!boatLic || licStatusType !== 'error') && (!boatMed || boatMed.overallStatus === 'Pass')
    };
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* 1. Welcoming Dynamic Header & Comprehensive Safety Score Banner */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-950 p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none transform translate-x-20 -translate-y-20"></div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
            🛡️ CHAOPHRAYA MARITIME COMPLIANCE ENGINE
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            สรุปข้อมูลความปลอดภัยเรือท่องเที่ยวกองเรือหลวง
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            อัปเดตระบบตรวจสอบสารบรรณความปลอดภัยล่าสุดประจำงวด <span className="text-emerald-400 font-bold underline underline-offset-4">{currentMonthThai} {currentYearThai}</span> ครอบคลุมเครื่องดับเพลิง เสื้อชูชีพ ใบอนุญาตใช้เรือ ใบอนุญาตเดินเรือ และตู้ปฐมพยาบาลเวชภัณฑ์ ทั้งหมดในที่เดียว
          </p>
        </div>

        {/* Dynamic score graphic widget */}
        <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800 shrink-0 relative z-10 self-start md:self-center">
          <div className="relative flex items-center justify-center w-20 h-20">
            {/* SVG circle stroke */}
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className={`${fleetSafetyScore >= 90 ? 'stroke-green-500' : fleetSafetyScore >= 75 ? 'stroke-amber-500' : 'stroke-red-500'} transition-all duration-1000`}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * fleetSafetyScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-black font-mono leading-none block">{fleetSafetyScore}%</span>
              <span className="text-[8px] text-slate-400 block uppercase font-mono tracking-wider font-bold">READY</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">ดัชนีพร้อมใช้งาน</span>
            <span className={`text-sm font-bold block ${fleetSafetyScore >= 90 ? 'text-green-400' : fleetSafetyScore >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
              {fleetSafetyScore >= 90 ? '✅ มาตรฐานความปลอดภัยดีเยี่ยม' : fleetSafetyScore >= 75 ? '⚠️ ควรเฝ้าระวังและปรับปรุง' : '🚨 ต่ำกว่าเกณฑ์มาตรฐานความปลอดภัย'}
            </span>
            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">รวมการวิเคราะห์ข้อมูลความปลอดภัยจาก 4 เสาหลักของเรือ</span>
          </div>
        </div>
      </div>

      {/* 2. Four Main Pillars Compliance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Pillar 1: Fire Extinguishers */}
        <div 
          onClick={() => onNavigateTab?.('boats')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-red-500 shadow-3xs cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                <Flame className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full font-mono">
                {extPassRate}% ผ่าน
              </span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">หมวดตรวจดับเพลิง</span>
              <span className="text-lg font-bold text-slate-800">เครื่องดับเพลิงเรือ</span>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span>รวม {totalExtCount} ถัง</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">ตรวจแล้ว {extInspectedCount}</span>
                {extPendingCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 font-semibold">ค้าง {extPendingCount}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
            <span>ตรวจสอบถังดับเพลิง</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 2: Passenger Life Jackets */}
        <div 
          onClick={() => onNavigateTab?.('lifejackets')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-500 shadow-3xs cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full font-mono">
                {lifeJacketPassRate}% ผ่าน
              </span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">หมวดชูชีพผู้โดยสาร</span>
              <span className="text-lg font-bold text-slate-800">เสื้อชูชีพ & นกหวีด</span>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span>ผู้ใหญ่ {totalAdultJackets} ตัว</span>
                <span>•</span>
                <span>เด็ก {totalKidsJackets} ตัว</span>
                {failedLifeJacketsCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-500 font-bold">ชำรุด {failedLifeJacketsCount}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
            <span>ตรวจนับและสภาพตู้ชูชีพ</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 3: Crew & Vessel Licenses */}
        <div 
          onClick={() => onNavigateTab?.('licenses')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-600 shadow-3xs cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-mono">
                {licensePassRate}% ผ่าน
              </span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">หมวดกฎหมายและบุคลากร</span>
              <span className="text-lg font-bold text-slate-800">ใบอนุญาตใช้เรือ & นายท้าย</span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 flex-wrap">
                <span>เรือ 7 ลำ</span>
                <span>•</span>
                {expiredLicensesCount > 0 ? (
                  <span className="text-red-600 font-bold">หมดอายุ {expiredLicensesCount}</span>
                ) : warningLicensesCount > 0 ? (
                  <span className="text-amber-600 font-bold">ใกล้หมด {warningLicensesCount}</span>
                ) : (
                  <span className="text-green-600 font-semibold">ถูกต้องสมบูรณ์</span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
            <span>ตรวจสอบวันหมดอายุใบนายท้าย</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 4: Medical Kits & First Aid */}
        <div 
          onClick={() => onNavigateModule?.('medical')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 shadow-3xs cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-mono">
                {medicalPassRate}% ผ่าน
              </span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">หมวดดูแลสุขอนามัย</span>
              <span className="text-lg font-bold text-slate-800">ตู้ยาเวชภัณฑ์ปฐมพยาบาล</span>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span>เรือ {boatMedKits.length} ตู้</span>
                <span>•</span>
                <span>ท่าเรือ {pierMedKits.length} ตู้</span>
                {failedMedKitsCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-500 font-bold">ขาดแคลน {failedMedKitsCount}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
            <span>ตรวจเช็คอายุยาบนเรือและท่าเรือ</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* 3. Main Split Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: 7 Boats Status Center (Boat Inspection Grid) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <BoatIcon className="h-5 w-5 text-slate-700" />
                แผงควบคุมรายลำเรือ (Vessel Status Grid)
              </h3>
              <p className="text-xs text-slate-500">สรุปความปลอดภัยรวม 4 ด้านรายลำเรือ คลิกที่ลำเรือเพื่อเข้าจัดการถังดับเพลิง</p>
            </div>
            <span className="text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 self-start sm:self-center font-mono">
              7 SHIPS SYSTEM READY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {detailedBoatStats.map((boat) => (
              <div
                key={boat.id}
                onClick={() => onSelectBoat(boat.id)}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.01] hover:shadow-sm cursor-pointer relative flex flex-col justify-between ${
                  boat.overallPass 
                    ? 'bg-slate-50/20 hover:border-slate-300 border-slate-150' 
                    : 'bg-red-50/5 hover:border-red-300 border-red-150'
                }`}
                id={`boat-card-${boat.id}`}
              >
                <div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 text-white rounded ${boat.overallPass ? 'bg-slate-900' : 'bg-red-600 animate-pulse'}`}>
                        <BoatIcon className="h-4 w-4" />
                      </div>
                      <span className="font-extrabold text-slate-850 text-sm tracking-tight">{boat.name}</span>
                    </div>
                    {boat.overallPass ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-black rounded-full">
                        <Check className="h-3 w-3" /> ผ่านมาตรฐาน
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[10px] font-black rounded-full animate-bounce">
                        ⚠️ พบบกพร่อง
                      </span>
                    )}
                  </div>

                  {/* Badges checklist for safety pillars */}
                  <div className="mt-3.5 space-y-2">
                    
                    {/* Pillar A: Extinguishers */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-slate-400" /> ถังดับเพลิง:
                      </span>
                      <span className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                        boat.ext.type === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-150' 
                          : boat.ext.type === 'warning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-150'
                          : 'bg-red-50 text-red-700 border border-red-150'
                      }`}>
                        {boat.ext.text}
                      </span>
                    </div>

                    {/* Pillar B: Life Jackets */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <LifeBuoy className="h-3.5 w-3.5 text-slate-400" /> เสื้อชูชีพ:
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        boat.lj.type === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-150' 
                          : 'bg-red-50 text-red-700 border border-red-150'
                      }`}>
                        {boat.lj.text}
                      </span>
                    </div>

                    {/* Pillar C: Licenses */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-slate-400" /> ทะเบียน/นายท้าย:
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        boat.lic.type === 'success' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-150' 
                          : boat.lic.type === 'warning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-150'
                          : 'bg-red-50 text-red-700 border border-red-150'
                      }`}>
                        {boat.lic.text}
                      </span>
                    </div>

                    {/* Pillar D: Medical */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <HeartPulse className="h-3.5 w-3.5 text-slate-400" /> กล่องเวชภัณฑ์:
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        boat.med.type === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-150' 
                          : 'bg-red-50 text-red-700 border border-red-150'
                      }`}>
                        {boat.med.text}
                      </span>
                    </div>

                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-150 text-[10.5px] font-bold text-slate-400 flex items-center justify-between group-hover:text-blue-600 transition-colors">
                  <span>คลิกเพื่อเปิดดูรายละเอียดความปลอดภัยลำเรือ</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Consolidated Safety Warning Alerts Center */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
                  รายการเฝ้าระวังบกพร่องสะสม
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">พบบกพร่องรวมทุกหมวดหมู่งานความปลอดภัยเรือ</p>
              </div>
              <span className="font-mono text-xs font-black bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded">
                {allAlerts.length}
              </span>
            </div>

            {allAlerts.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                <div className="p-3 bg-green-50 text-green-600 rounded-full border border-green-100">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">เรืออยู่ในสภาพสมบูรณ์ 100%</div>
                  <div className="text-[11px] text-slate-400 px-6 mt-1 leading-relaxed">ตรวจไม่พบบกพร่องสะสม ทั้งในระบบถังดับเพลิง เสื้อชูชีพ ยาหมดอายุ หรือใบอนุญาตเรือหมดกำหนด</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {allAlerts.map((alert, idx) => {
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
                      className={`p-3 border rounded-xl flex justify-between items-start cursor-pointer transition-all hover:bg-slate-50/50 ${
                        isFail 
                          ? 'border-red-150 bg-red-50/5 border-l-4 border-l-red-500' 
                          : 'border-amber-150 bg-amber-50/5 border-l-4 border-l-amber-500'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border leading-none ${
                            alert.type === 'extinguisher' 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : alert.type === 'lifejacket'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : alert.type === 'license'
                              ? 'bg-blue-50 text-blue-750 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {alertBadge}
                          </span>
                          <span className="text-xs font-black text-slate-800">{alert.boatName}</span>
                        </div>
                        <h4 className="text-[11.5px] font-bold text-slate-800 leading-tight">{alert.title}</h4>
                        <p className="text-[10.5px] text-slate-500 leading-tight font-medium">{alert.details}</p>
                      </div>
                      <div className="text-right flex flex-col justify-between h-full min-h-[50px] shrink-0 ml-3">
                        <span className="text-[9px] text-slate-400 block font-mono">{alert.date}</span>
                        <span className={`text-[8.5px] px-1 py-0.5 font-bold font-mono tracking-widest uppercase inline-block text-center rounded mt-2 border ${
                          isFail ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
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

          {/* Firebase Safety Data Display */}
          {safetyData.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="text-sm font-bold text-blue-900 mb-3">ข้อมูลความปลอดภัยจาก Firebase</h4>
              <div className="space-y-2">
                {safetyData.map((item) => (
                  <p key={item.id} className="text-xs text-blue-800">
                    ข้อมูลความปลอดภัย: {item.safety || JSON.stringify(item)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Backup & Restore Section */}
          <BackupRestore
            data={{
              extinguishers,
              boats,
              lifeJackets,
              licenses,
              medicalStations
            }}
            onRestore={onRestoreData || (() => {})}
          />

          <div className="pt-4 mt-6 border-t border-slate-100 bg-slate-950 text-white p-4 rounded-xl space-y-2">
            <div className="text-[9px] font-extrabold text-slate-400 block tracking-widest uppercase font-mono">ข้อกำหนดความปลอดภัยประจำวันเชิงปฏิบัติการ (Daily Routine Checklist)</div>
            <ul className="text-[10px] text-slate-450 space-y-1.5 list-none leading-relaxed">
              <li className="flex gap-1.5 items-start">
                <span className="text-red-500 font-bold">•</span>
                <span>พนักงานเรือทุกคนต้องมีใบอนุญาตทำการในเรือที่ถูกต้องและยังไม่หมดกำหนด</span>
              </li>
              <li className="flex gap-1.5 items-start">
                <span className="text-red-500 font-bold">•</span>
                <span>เสื้อชูชีพผู้โดยสารต้องจัดเตรียมพร้อมใช้ นกหวีด และไฟสัญญาณใช้งานได้สมบูรณ์</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
