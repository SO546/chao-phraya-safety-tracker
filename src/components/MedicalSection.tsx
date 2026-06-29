import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  PlusCircle, 
  Calendar, 
  User as UserIcon, 
  Search, 
  Ship as BoatIcon, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  X, 
  ClipboardCheck,
  Package,
  Activity,
  ChevronRight,
  Filter,
  Grid,
  List,
  Trash2
} from 'lucide-react';
import { MedicalKitStation, MedicalInspectionRecord, MedicalItemStatus, OverallStatus } from '../types';
import ImageUpload from './ImageUpload';

interface MedicalSectionProps {
  stations: MedicalKitStation[];
  onSaveInspection: (record: Omit<MedicalInspectionRecord, 'id'>) => void;
  onDeleteInspection: (id: string) => void;
  history: MedicalInspectionRecord[];
}

export default function MedicalSection({
  stations,
  onSaveInspection,
  onDeleteInspection,
  history,
}: MedicalSectionProps) {
  const [stationTypeFilter, setStationTypeFilter] = useState<'all' | 'boat' | 'pier'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pass' | 'Fail' | 'NeverInspected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [medYearFilter, setMedYearFilter] = useState('all');
  const [medMonthFilter, setMedMonthFilter] = useState('all');
  const [medGroupedView, setMedGroupedView] = useState(true);
  const [showMedDashboard, setShowMedDashboard] = useState(true);
  
  // Inspection Modal States
  const [inspectingStation, setInspectingStation] = useState<MedicalKitStation | null>(null);
  const [inspectorName, setInspectorName] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState<string | null>(null);
  
  // Dropdown states for inspection properties (11 items)
  const [paracetamolStatus, setParacetamolStatus] = useState<MedicalItemStatus>('Normal');
  const [paracetamolExpiry, setParacetamolExpiry] = useState('');

  const [motionSicknessStatus, setMotionSicknessStatus] = useState<MedicalItemStatus>('Normal');
  const [motionSicknessExpiry, setMotionSicknessExpiry] = useState('');

  const [ammoniaStatus, setAmmoniaStatus] = useState<MedicalItemStatus>('Normal');
  const [ammoniaExpiry, setAmmoniaExpiry] = useState('');

  const [bandagesStatus, setBandagesStatus] = useState<MedicalItemStatus>('Normal');
  const [bandagesExpiry, setBandagesExpiry] = useState('');

  const [antacidStatus, setAntacidStatus] = useState<MedicalItemStatus>('Normal');
  const [antacidExpiry, setAntacidExpiry] = useState('');

  const [cottonBudsStatus, setCottonBudsStatus] = useState<MedicalItemStatus>('Normal');
  const [cottonBudsExpiry, setCottonBudsExpiry] = useState('');

  const [betadineStatus, setBetadineStatus] = useState<MedicalItemStatus>('Normal');
  const [betadineExpiry, setBetadineExpiry] = useState('');

  const [salineStatus, setSalineStatus] = useState<MedicalItemStatus>('Normal');
  const [salineExpiry, setSalineExpiry] = useState('');

  const [gauzeStatus, setGauzeStatus] = useState<MedicalItemStatus>('Normal');
  const [gauzeExpiry, setGauzeExpiry] = useState('');

  const [surgicalTapeStatus, setSurgicalTapeStatus] = useState<MedicalItemStatus>('Normal');
  const [surgicalTapeExpiry, setSurgicalTapeExpiry] = useState('');

  const [cottonBallsStatus, setCottonBallsStatus] = useState<MedicalItemStatus>('Normal');
  const [cottonBallsExpiry, setCottonBallsExpiry] = useState('');

  const [containerStatus, setContainerStatus] = useState<MedicalItemStatus>('Normal');
  const [remarks, setRemarks] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  // Open modal handler
  const handleOpenInspect = (station: MedicalKitStation) => {
    setInspectingStation(station);
    setInspectorName(station.lastInspector || '');
    setPhotoUrl(station.lastPhotoUrl);
    setInspectionDate(new Date().toISOString().substring(0, 10));
    setParacetamolStatus(station.paracetamolStatus || 'Normal');
    setParacetamolExpiry(station.paracetamolExpiry || '2027-12-31');
    setMotionSicknessStatus(station.motionSicknessStatus || 'Normal');
    setMotionSicknessExpiry(station.motionSicknessExpiry || '2027-10-15');
    setAmmoniaStatus(station.ammoniaStatus || 'Normal');
    setAmmoniaExpiry(station.ammoniaExpiry || '2027-08-30');
    setBandagesStatus(station.bandagesStatus || 'Normal');
    setBandagesExpiry(station.bandagesExpiry || '2028-05-01');
    setAntacidStatus(station.antacidStatus || 'Normal');
    setAntacidExpiry(station.antacidExpiry || '2027-11-15');
    setCottonBudsStatus(station.cottonBudsStatus || 'Normal');
    setCottonBudsExpiry(station.cottonBudsExpiry || '2028-02-10');
    setBetadineStatus(station.betadineStatus || 'Normal');
    setBetadineExpiry(station.betadineExpiry || '2027-11-20');
    setSalineStatus(station.salineStatus || 'Normal');
    setSalineExpiry(station.salineExpiry || '2028-01-15');
    setGauzeStatus(station.gauzeStatus || 'Normal');
    setGauzeExpiry(station.gauzeExpiry || '2028-06-30');
    setSurgicalTapeStatus(station.surgicalTapeStatus || 'Normal');
    setSurgicalTapeExpiry(station.surgicalTapeExpiry || '2028-04-20');
    setCottonBallsStatus(station.cottonBallsStatus || 'Normal');
    setCottonBallsExpiry(station.cottonBallsExpiry || '2028-03-15');
    setContainerStatus(station.containerStatus || 'Normal');
    setRemarks(station.remarks || '');
  };

  const handleCloseInspect = () => {
    setInspectingStation(null);
  };

  const handleSubmitInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingStation) return;
    if (!inspectorName.trim()) {
      alert('กรุณากรอกชื่อผู้ตรวจเช็คสะสมเพื่อบันทึกงานระบบ');
      return;
    }

    // Determine overallStatus based on individual metrics
    const isAnyIssue = 
      paracetamolStatus !== 'Normal' || 
      motionSicknessStatus !== 'Normal' || 
      ammoniaStatus !== 'Normal' ||
      bandagesStatus !== 'Normal' || 
      antacidStatus !== 'Normal' ||
      cottonBudsStatus !== 'Normal' ||
      betadineStatus !== 'Normal' || 
      salineStatus !== 'Normal' || 
      gauzeStatus !== 'Normal' || 
      surgicalTapeStatus !== 'Normal' ||
      cottonBallsStatus !== 'Normal' ||
      containerStatus !== 'Normal';

    const overall: 'Pass' | 'Fail' = isAnyIssue ? 'Fail' : 'Pass';

    onSaveInspection({
      stationId: inspectingStation.id,
      stationType: inspectingStation.stationType,
      targetName: inspectingStation.targetName,
      location: inspectingStation.location,
      inspectionDate,
      inspectorName,
      paracetamolStatus,
      paracetamolExpiry,
      motionSicknessStatus,
      motionSicknessExpiry,
      ammoniaStatus,
      ammoniaExpiry,
      bandagesStatus,
      bandagesExpiry,
      antacidStatus,
      antacidExpiry,
      cottonBudsStatus,
      cottonBudsExpiry,
      betadineStatus,
      betadineExpiry,
      salineStatus,
      salineExpiry,
      gauzeStatus,
      gauzeExpiry,
      surgicalTapeStatus,
      surgicalTapeExpiry,
      cottonBallsStatus,
      cottonBallsExpiry,
      containerStatus,
      overallStatus: overall,
      remarks,
      photoUrl,
    });

    handleCloseInspect();
  };

  // Status mapping
  const getItemStatusText = (status: MedicalItemStatus) => {
    switch (status) {
      case 'Normal': return 'ปกติ/เพียงพอ (Normal)';
      case 'LowStock': return 'ของใกล้หมด/พร่อง (Low Stock)';
      case 'Expired': return 'ยาหมดอายุ (Expired)';
      case 'Missing': return 'สูญหาย/ขาดแคลน (Missing)';
      case 'Damaged': return 'เสียหาย/ชำรุด (Damaged)';
      default: return status;
    }
  };

  const getItemStatusBadgeClass = (status: MedicalItemStatus | 'NeverInspected') => {
    switch (status) {
      case 'Normal': return 'bg-green-50 text-green-700 border-green-200';
      case 'LowStock': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Expired': return 'bg-red-50 text-red-700 border-red-200';
      case 'Missing': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Damaged': return 'bg-red-50 text-red-700 border-red-200 font-bold';
      default: return 'bg-slate-50 text-slate-400 border-slate-200';
    }
  };

  // Filtered stations logic
  const filteredStations = stations.filter((st) => {
    // Type Filter
    if (stationTypeFilter === 'boat' && st.stationType !== 'boat') return false;
    if (stationTypeFilter === 'pier' && st.stationType !== 'pier') return false;

    // Status Filter
    if (statusFilter === 'Pass' && st.overallStatus !== 'Pass') return false;
    if (statusFilter === 'Fail' && st.overallStatus !== 'Fail') return false;
    if (statusFilter === 'NeverInspected' && st.overallStatus !== 'NeverInspected') return false;

    // Search Term Filter
    if (searchTerm.trim() !== '') {
      const match = st.targetName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    st.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    st.id.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }

    return true;
  });

  // Calculate Metrics
  const totalCount = stations.length;
  const boatCount = stations.filter((s) => s.stationType === 'boat').length;
  const pierCount = stations.filter((s) => s.stationType === 'pier').length;
  const passCount = stations.filter((s) => s.overallStatus === 'Pass').length;
  const failCount = stations.filter((s) => s.overallStatus === 'Fail').length;
  const pendingCount = stations.filter((s) => s.overallStatus === 'NeverInspected').length;

  const [activeDashTab, setActiveDashTab] = useState<'stats' | 'defects' | 'normal'>('stats');

  // Medical Dashboard Calculations
  const medicalItems = [
    { key: 'paracetamol', label: 'ยาพาราเซตามอล (Paracetamol)', keyStatus: 'paracetamolStatus', keyExpiry: 'paracetamolExpiry', icon: '💊' },
    { key: 'motionSickness', label: 'ยาแก้เมารถ/เมาเรือ (Motion Sickness)', keyStatus: 'motionSicknessStatus', keyExpiry: 'motionSicknessExpiry', icon: '🤢' },
    { key: 'ammonia', label: 'แอมโมเนียหอม (Ammonia)', keyStatus: 'ammoniaStatus', keyExpiry: 'ammoniaExpiry', icon: '👃' },
    { key: 'bandages', label: 'พลาสเตอร์ปิดแผล (Bandages)', keyStatus: 'bandagesStatus', keyExpiry: 'bandagesExpiry', icon: '🩹' },
    { key: 'antacid', label: 'ยาธาตุน้ำขาว/ยาลดกรด (Antacid)', keyStatus: 'antacidStatus', keyExpiry: 'antacidExpiry', icon: '🥛' },
    { key: 'cottonBuds', label: 'สำลีก้าน (Cotton Buds)', keyStatus: 'cottonBudsStatus', keyExpiry: 'cottonBudsExpiry', icon: '🥢' },
    { key: 'betadine', label: 'ยาเบตาดีนล้างแผล (Betadine)', keyStatus: 'betadineStatus', keyExpiry: 'betadineExpiry', icon: '🟤' },
    { key: 'saline', label: 'น้ำเกลือล้างแผล (Saline)', keyStatus: 'salineStatus', keyExpiry: 'salineExpiry', icon: '💧' },
    { key: 'gauze', label: 'ผ้าก๊อซปิดแผล (Gauze)', keyStatus: 'gauzeStatus', keyExpiry: 'gauzeExpiry', icon: '🕸️' },
    { key: 'surgicalTape', label: 'เทปแต่งแผล (Surgical Tape)', keyStatus: 'surgicalTapeStatus', keyExpiry: 'surgicalTapeExpiry', icon: '🎗️' },
    { key: 'cottonBalls', label: 'สำลีก้อน (Cotton Balls)', keyStatus: 'cottonBallsStatus', keyExpiry: 'cottonBallsExpiry', icon: '⚪' },
    { key: 'container', label: 'กล่อง/ตู้เก็บ (Container Status)', keyStatus: 'containerStatus', keyExpiry: '', icon: '📦' },
  ];

  // Compile statistics per medical item
  const itemStats = medicalItems.map(item => {
    let normal = 0;
    let expired = 0;
    let lowStock = 0;
    let missing = 0;
    let damaged = 0;
    let neverInspected = 0;

    stations.forEach(s => {
      const status = s[item.keyStatus as keyof MedicalKitStation] as MedicalItemStatus | undefined;
      if (s.overallStatus === 'NeverInspected') {
        neverInspected++;
      } else if (status === 'Normal') {
        normal++;
      } else if (status === 'Expired') {
        expired++;
      } else if (status === 'LowStock') {
        lowStock++;
      } else if (status === 'Missing') {
        missing++;
      } else if (status === 'Damaged') {
        damaged++;
      } else {
        normal++; // default
      }
    });

    const totalIssues = expired + lowStock + missing + damaged;

    return {
      ...item,
      normal,
      expired,
      lowStock,
      missing,
      damaged,
      neverInspected,
      totalIssues
    };
  });

  // Collect specific active defects / action required
  interface DefectDetail {
    stationId: string;
    targetName: string;
    location: string;
    stationType: 'boat' | 'pier';
    itemName: string;
    itemKey: string;
    issueType: MedicalItemStatus;
    expiryDate?: string;
    rawStation: MedicalKitStation;
  }

  const defectDetails: DefectDetail[] = [];
  stations.forEach(s => {
    if (s.overallStatus === 'Fail') {
      medicalItems.forEach(item => {
        const status = s[item.keyStatus as keyof MedicalKitStation] as MedicalItemStatus | undefined;
        if (status && status !== 'Normal') {
          const expiry = item.keyExpiry ? (s[item.keyExpiry as keyof MedicalKitStation] as string || '') : undefined;
          defectDetails.push({
            stationId: s.id,
            targetName: s.targetName,
            location: s.location,
            stationType: s.stationType,
            itemName: item.label.split(' (')[0],
            itemKey: item.key,
            issueType: status,
            expiryDate: expiry,
            rawStation: s
          });
        }
      });
    }
  });

  const normalStations = stations.filter(s => s.overallStatus === 'Pass');
  const pendingStations = stations.filter(s => s.overallStatus === 'NeverInspected');

  return (
    <div className="space-y-6 animate-fade-in" id="medical-inspection-module">
      
      {/* Title & Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-cyan-900 text-white rounded p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm">MED-HEALTH</span>
            <span className="text-teal-300 font-mono text-xs">Chao Phraya Tourist Boat Co., Ltd.</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-sans mt-1.5 tracking-tight">
            งานตรวจสอบยาเวชภัณฑ์และอุปกรณ์ปฐมพยาบาล (Marine Medical Kits Audit)
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1 leading-normal">
            ระบบประสานงานบันทึกผลประจำตู้ยาปฐมพยาบาลสำหรับเรือล่องแก่งท่องเที่ยวจำนวน 7 ลำ และส่วนท่าเทียบเรือประสานงาน 11 ท่า รวมเป็น 18 จุดยุทธศาสตร์
          </p>
        </div>
        <div className="flex items-center gap-2 py-1 px-3 bg-teal-950/40 rounded border border-teal-700/60 font-mono text-[11px] text-teal-200">
          <Calendar className="h-4 w-4" />
          <span>วันที่อ้างอิงล่าสุด: {new Date().toLocaleDateString('th-TH')}</span>
        </div>
      </div>

      {/* Metrics Summary Panels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded border border-slate-200 border-l-4 border-l-teal-600 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-sm hidden sm:block">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none mb-1">จุดติดตั้งทั้งหมด</span>
            <span className="text-xl font-bold font-mono text-slate-900">{totalCount} จุด</span>
            <span className="text-[9px] text-slate-500 block">เรือ 7 ลำ / ท่าเรือ 11 ท่า</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded border border-slate-200 border-l-4 border-l-green-600 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-green-50 text-green-700 rounded-sm hidden sm:block">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none mb-1">ผ่านเกณฑ์สมบูรณ์</span>
            <span className="text-xl font-bold font-mono text-green-600">{passCount} จุด</span>
            <span className="text-[9px] text-slate-500 block">ยาครบ เวชภัณฑ์พร้อมใช้งาน</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded border border-slate-200 border-l-4 border-l-red-600 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-red-50 text-red-700 rounded-sm hidden sm:block">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none mb-1">พบค้างปรับปรุง (Defects)</span>
            <span className="text-xl font-bold font-mono text-red-600">{failCount} จุด</span>
            <span className="text-[9px] text-slate-500 block">ยาพร่อง/หมดอายุ หรือของชำรุด</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded border border-slate-200 border-l-4 border-l-amber-500 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-sm hidden sm:block">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none mb-1">รอตรวจเช็คในรอบเดือน</span>
            <span className="text-xl font-bold font-mono text-amber-500">{pendingCount} จุด</span>
            <span className="text-[9px] text-slate-500 block">ยังไม่ได้ทำการตรวจสอบ</span>
          </div>
        </div>
      </div>

      {/* Collapsible Dashboard Toggle Button */}
      <button
        onClick={() => setShowMedDashboard(!showMedDashboard)}
        className="w-full bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded flex items-center justify-between text-left transition-all shadow-3xs cursor-pointer focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-teal-50 text-teal-800 rounded border border-teal-100">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-2">
              📊 แดชบอร์ดสรุปผลการตรวจสอบยาเวชภัณฑ์และอุปกรณ์ปฐมพยาบาล (Interactive Dashboard)
              <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                วิเคราะห์เชิงรุก
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5 tracking-wider">
              วิเคราะห์ความเสี่ยงรายเวชภัณฑ์, แสดงรายงานจุดติดตั้งที่ปกติสมบูรณ์ และจุดบกพร่องที่ต้องเร่งแก้ไข
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] font-extrabold text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full">
            {showMedDashboard ? '🙈 ซ่อนแดชบอร์ด (Hide)' : '👀 แสดงแดชบอร์ด (Show)'}
          </span>
        </div>
      </button>

      {/* Interactive Medical Dashboard Body */}
      {showMedDashboard && (
        <div className="bg-slate-50/50 border border-slate-200 rounded p-5 space-y-5 animate-fade-in">
          {/* Dashboard Tabs Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex flex-wrap gap-1.5 p-0.5 bg-slate-200/80 rounded-lg">
              <button
                onClick={() => setActiveDashTab('stats')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  activeDashTab === 'stats'
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                📈 วิเคราะห์สถานะเวชภัณฑ์ (Supply Health)
              </button>
              <button
                onClick={() => setActiveDashTab('defects')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeDashTab === 'defects'
                    ? 'bg-rose-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                🚨 รายงานจุดที่พบปัญหาต้องแก้ไข
                <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-mono font-bold ${
                  activeDashTab === 'defects' ? 'bg-rose-950 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  {defectDetails.length}
                </span>
              </button>
              <button
                onClick={() => setActiveDashTab('normal')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeDashTab === 'normal'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                ✅ รายงานจุดที่ปกติสมบูรณ์
                <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-mono font-bold ${
                  activeDashTab === 'normal' ? 'bg-emerald-950 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {normalStations.length}
                </span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-semibold font-mono">
              อัตราการผ่านเกณฑ์: {totalCount - pendingCount > 0 ? ((passCount / (totalCount - pendingCount)) * 100).toFixed(1) : 0}% 
              ({passCount}/{totalCount - pendingCount} จุดที่ตรวจแล้ว)
            </div>
          </div>

          {/* Tab 1: Stats & Analytics */}
          {activeDashTab === 'stats' && (
            <div className="space-y-4">
              {/* Summary Text Info */}
              <div className="bg-white p-3.5 rounded border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-3xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-700">🔎 บทวิเคราะห์ภาพรวมการตรวจยาเวชภัณฑ์ของเรือท่องเที่ยวและท่าเทียบเรือ</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    จากการตรวจสอบจุดบริการยาและกล่องปฐมพยาบาลทั้งหมด {totalCount} จุด มีจุดที่มีเวชภัณฑ์ครบถ้วนสมบูรณ์พร้อมใช้งานจำนวน <span className="text-emerald-600 font-bold">{passCount} จุด ({((passCount / totalCount) * 100).toFixed(0)}%)</span>, 
                    พบข้อบกพร่อง/ค้างปรับปรุง <span className="text-rose-600 font-bold">{failCount} จุด ({((failCount / totalCount) * 100).toFixed(0)}%)</span>, 
                    และยังรอการตรวจสอบในรอบนี้อีก <span className="text-amber-600 font-bold">{pendingCount} จุด ({((pendingCount / totalCount) * 100).toFixed(0)}%)</span>
                  </p>
                </div>
                
                {/* Key stat card inside info */}
                <div className="bg-slate-50 p-2.5 rounded border border-slate-150 flex items-center gap-3 w-full md:w-auto shrink-0">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">รายการที่มีปัญหาบ่อยที่สุด</span>
                    <span className="text-xs font-bold text-slate-800">
                      {(() => {
                        const sorted = [...itemStats].sort((a, b) => b.totalIssues - a.totalIssues);
                        const top = sorted[0];
                        return top && top.totalIssues > 0 
                          ? `${top.label.split(' (')[0]} (พบข้อบกพร่อง ${top.totalIssues} แห่ง)`
                          : 'ไม่มี (ทุกรายการสมบูรณ์ดี)';
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid displaying the 12 items status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {itemStats.map((item) => {
                  const issuePercent = item.totalIssues > 0 && (totalCount - item.neverInspected) > 0
                    ? Math.round((item.totalIssues / (totalCount - item.neverInspected)) * 100)
                    : 0;

                  return (
                    <div key={item.key} className="bg-white p-3 rounded border border-slate-200 shadow-3xs flex flex-col justify-between space-y-2.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-lg shrink-0">{item.icon}</span>
                          <span className="font-bold text-xs text-slate-800 truncate" title={item.label}>
                            {item.label.split(' (')[0]}
                          </span>
                        </div>
                        {item.totalIssues > 0 ? (
                          <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-150 px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                            ชำรุด {item.totalIssues}
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-bold bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.2 rounded-full">
                            พร้อมใช้
                          </span>
                        )}
                      </div>

                      {/* Progress micro chart */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-medium text-slate-500">
                          <span>อัตราปัญหา: {issuePercent}%</span>
                          <span>ชำรุด/ขาด/หมดอายุ</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                          <div 
                            style={{ width: `${100 - issuePercent}%` }} 
                            className="bg-emerald-500 h-full animate-pulse-slow" 
                            title="ปกติ"
                          />
                          <div 
                            style={{ width: `${issuePercent}%` }} 
                            className="bg-rose-500 h-full" 
                            title="พบปัญหา"
                          />
                        </div>
                      </div>

                      {/* Detailed micro badges */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                        <div className="flex justify-between">
                          <span>ปกติ:</span>
                          <span className="font-bold text-green-600">{item.normal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>หมดอายุ:</span>
                          <span className="font-bold text-red-600">{item.expired}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>พร่อง:</span>
                          <span className="font-bold text-amber-600">{item.lowStock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ขาด/ชำรุด:</span>
                          <span className="font-bold text-orange-600">{item.missing + item.damaged}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Defect Report (จุดที่พบปัญหาต้องแก้ไข) */}
          {activeDashTab === 'defects' && (
            <div className="space-y-4">
              {defectDetails.length === 0 ? (
                <div className="py-10 text-center bg-white border border-slate-200 rounded flex flex-col items-center justify-center space-y-2">
                  <span className="text-3xl">🎉</span>
                  <div className="text-sm font-bold text-emerald-800">สุดยอด! ไม่พบตู้ยาที่มีเวชภัณฑ์ชำรุดหรือขาดแคลนในขณะนี้</div>
                  <p className="text-xs text-slate-500 max-w-sm">ตู้ยาและจุดติดตั้งทั้งหมดที่ผ่านการตรวจสอบมีอุปกรณ์ครบถ้วนสมบูรณ์ 100%</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-3xs">
                  <div className="p-3 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
                    <h4 className="font-bold text-xs text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 animate-bounce" />
                      รายงานรายการเวชภัณฑ์ค้างแก้ไขและต้องเร่งดำเนินการจัดสรรใหม่ ({defectDetails.length} รายการที่พบปัญหา)
                    </h4>
                    <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-mono font-bold">
                      Action Required
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                    {defectDetails.map((defect, idx) => {
                      let statusLabelText = '';
                      let statusColor = '';

                      switch (defect.issueType) {
                        case 'Expired':
                          statusLabelText = `❌ หมดอายุ (Expiry: ${defect.expiryDate || '-'})`;
                          statusColor = 'text-red-700 bg-red-50 border-red-250';
                          break;
                        case 'LowStock':
                          statusLabelText = '⚠️ ยาพร่อง/ใกล้หมด (Low Stock)';
                          statusColor = 'text-amber-700 bg-amber-50 border-amber-250';
                          break;
                        case 'Missing':
                          statusLabelText = '🚫 สูญหาย/ไม่พบตัวยา';
                          statusColor = 'text-orange-700 bg-orange-50 border-orange-255';
                          break;
                        case 'Damaged':
                          statusLabelText = '💔 ชำรุด/เปิดใช้แล้ว/บรรจุภัณฑ์เสียหาย';
                          statusColor = 'text-red-800 bg-red-100 border-red-250';
                          break;
                        default:
                          statusLabelText = defect.issueType;
                          statusColor = 'text-slate-600 bg-slate-50';
                      }

                      return (
                        <div key={idx} className="p-3 hover:bg-slate-50/60 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                                defect.stationType === 'boat' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-teal-700'
                              }`}>
                                {defect.stationId}
                              </span>
                              <strong className="text-slate-800 font-extrabold">{defect.targetName}</strong>
                              <span className="text-slate-400 font-mono">•</span>
                              <span className="text-slate-500 font-semibold">{defect.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-650 font-medium">เวชภัณฑ์ที่ชำรุด:</span>
                              <span className="font-extrabold text-slate-800">{defect.itemName}</span>
                              <span className="text-slate-300">|</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${statusColor}`}>
                                {statusLabelText}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenInspect(defect.rawStation)}
                            className="shrink-0 bg-teal-850 hover:bg-teal-900 text-white border border-teal-950 px-3 py-1.5 rounded text-[11px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs hover:scale-102"
                          >
                            🔧 ทำการตรวจเช็คแก้ไข (Fix Now)
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Normal Points Report (รายงานจุดที่ปกติสมบูรณ์) */}
          {activeDashTab === 'normal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Part A: Normal Points */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-3xs">
                  <div className="p-3 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
                    <h4 className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                      จุดติดตั้งยาที่ผ่านเกณฑ์สมบูรณ์พร้อมบริการ ({normalStations.length} จุด)
                    </h4>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono font-bold">
                      100% Ready
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                    {normalStations.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400 font-medium">ยังไม่พบคลังหรือตู้ยาที่ปกติสมบูรณ์ 100%</div>
                    ) : (
                      normalStations.map((st) => (
                        <div key={st.id} className="p-3 hover:bg-slate-50/40 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{st.targetName}</span>
                              <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.2 rounded font-mono">PASS</span>
                            </div>
                            <p className="text-[10px] text-slate-500">{st.location}</p>
                          </div>
                          <div className="text-right text-[10.5px] text-slate-500 font-mono">
                            <span className="block font-bold text-slate-700">ตรวจล่าสุด: {st.lastInspectedDate || 'ไม่ระบุ'}</span>
                            <span className="text-[9px] block text-slate-400">โดย: {st.lastInspector || '-'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Part B: Pending Points */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-3xs">
                  <div className="p-3 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
                    <h4 className="font-bold text-xs text-amber-800 flex items-center gap-1.5">
                      <Calendar className="h-4.5 w-4.5 text-amber-600" />
                      จุดติดตั้งยาที่ยังค้างตรวจเช็คในรอบเดือน ({pendingStations.length} จุด)
                    </h4>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono font-bold">
                      Pending Check
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                    {pendingStations.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400 font-medium">ไม่มีจุดค้างตรวจสอบในระบบ ทุกจุดได้รับตรวจแล้ว!</div>
                    ) : (
                      pendingStations.map((st) => (
                        <div key={st.id} className="p-3 hover:bg-slate-50/40 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <strong className="text-slate-800 font-bold block">{st.targetName}</strong>
                            <p className="text-[10px] text-slate-500">{st.location}</p>
                          </div>
                          
                          <button
                            onClick={() => handleOpenInspect(st)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 rounded text-[10.5px] font-bold cursor-pointer transition-all border border-amber-700 shadow-3xs"
                          >
                            📋 ตรวจเปิดบันทึก
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workspace Area: Search, Filters & Interactive Grid */}
      <div className="bg-white border rounded border-slate-200 shadow-sm" id="medical-workspace-inner">
        {/* Navigation & Toolbar Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 sm:flex sm:items-center sm:justify-between space-y-3 sm:space-y-0 gap-4">
          
          {/* Quick Tabs Toggle */}
          <div className="flex rounded-md p-1 bg-slate-200 max-w-sm">
            <button
              onClick={() => setStationTypeFilter('all')}
              className={`flex-1 text-[11px] font-bold px-3 py-1.5 rounded cursor-pointer transition-all ${
                stationTypeFilter === 'all' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ดึงจุดทั้งหมด ({totalCount})
            </button>
            <button
              onClick={() => setStationTypeFilter('boat')}
              className={`flex-1 text-[11px] font-bold px-3 py-1.5 rounded cursor-pointer transition-all flex items-center gap-1 justify-center ${
                stationTypeFilter === 'boat' 
                  ? 'bg-white text-teal-800 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BoatIcon className="w-3.5 h-3.5" />
              เรือท่องเที่ยว ({boatCount})
            </button>
            <button
              onClick={() => setStationTypeFilter('pier')}
              className={`flex-1 text-[11px] font-bold px-3 py-1.5 rounded cursor-pointer transition-all flex items-center gap-1 justify-center ${
                stationTypeFilter === 'pier' 
                  ? 'bg-white text-teal-800 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              ท่าเรือ 11 ท่า ({pierCount})
            </button>
          </div>

          {/* Filtering and Query Block */}
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            
            {/* Status Select Filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded p-1 text-xs">
              <Filter className="h-3 w-3 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">กรองทุกสถานะ</option>
                <option value="Pass">ผ่านเกณฑ์สมบูรณ์</option>
                <option value="Fail">พบค้างปรับปรุง</option>
                <option value="NeverInspected">ยังไม่ตรวจเช็ค</option>
              </select>
            </div>

            {/* Keyword Search Input */}
            <div className="relative text-xs w-full sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 pointer-events-none">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder="ค้นหากล่องยา/ชื่อท่า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-2 py-1.5 w-full bg-white text-slate-800 border border-slate-300 rounded-sm focus:outline-none focus:border-cyan-700 text-[11px]"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Stations Cards List Container */}
        <div className="p-4 sm:p-6 bg-slate-50/40">
          
          {filteredStations.length === 0 ? (
            <div className="py-16 text-center bg-white border-2 border-dashed border-slate-200 rounded flex flex-col items-center justify-center space-y-3">
              <AlertCircle className="h-8 w-8 text-slate-400" />
              <div className="text-sm font-bold text-slate-700">ไม่พบจุดตรวจสอบตรงตามเงื่อนไขที่ระบุ</div>
              <p className="text-xs text-slate-400 max-w-xs">ทดลองลบคำค้นหา ย้ายสถานะตัวกรอง หรือเปลี่ยนแท็บเรือปฐมพยาบาล</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {filteredStations.map((st) => {
                const isBoat = st.stationType === 'boat';
                
                return (
                  <div
                    key={st.id}
                    className="bg-white border rounded border-slate-200 transition-all hover:shadow-md flex flex-col justify-between overflow-hidden"
                    id={`med-card-${st.id}`}
                  >
                    
                    {/* Header bar colored by overall status */}
                    <div className="p-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/80 flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            isBoat 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}>
                            {st.id}
                          </span>
                          
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                            {isBoat ? 'ตู้ยาบนเรือ' : 'ตู้ยาประจำท่าเรือ'}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-sm text-slate-800 mt-1 flex items-center gap-1 truncate">
                          {isBoat && <BoatIcon className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />}
                          {!isBoat && <MapPin className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />}
                          <span className="truncate">{st.targetName}</span>
                        </h3>
                      </div>

                      {/* Overall Status Badge */}
                      <span className={`text-[9px] font-bold rounded-sm px-2 py-0.5 border flex-shrink-0 uppercase font-sans ${
                        st.overallStatus === 'Pass'
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : st.overallStatus === 'Fail'
                          ? 'bg-red-100 text-red-700 border-red-300 animate-pulse'
                          : 'bg-amber-100 text-amber-700 border-amber-300'
                      }`}>
                        {st.overallStatus === 'Pass' ? 'ผ่านเกณฑ์ (PASS)' : st.overallStatus === 'Fail' ? 'ชำรุด (DEFECT)' : 'ค้างตรวจ'}
                      </span>
                    </div>

                    {/* Central Body Specifying Items Status Matrix */}
                    <div className="p-4 space-y-3.5 flex-1 bg-white">
                      <div>
                        <span className="text-[9px] block text-slate-400 font-bold uppercase tracking-wider font-mono">ที่จัดวางอย่างละเอียด (Location)</span>
                        <span className="text-xs text-slate-700 font-bold block truncate mt-0.5 text-ellipsis overflow-hidden" title={st.location}>{st.location}</span>
                      </div>

                      {/* Items status checks container */}
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <span className="text-[9px] block text-slate-400 font-extrabold uppercase tracking-widest font-mono">ผลประเมินยารายชิ้นทั่วไป (Medical Supply Quality Checklist)</span>
                        
                        {st.overallStatus === 'NeverInspected' ? (
                          <div className="py-2.5 text-center bg-slate-50 text-slate-500 font-bold rounded text-[11px] font-mono">
                            ⚠️ ค้างการตรวจสอบประจำรอบบิลนี้
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[9px]">
                            
                            <div className="flex flex-col p-1.5 bg-slate-50 rounded-sm border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 font-medium truncate" title="ยาปวดพาราเซตามอล">💊 1. ยาพาราฯ</span>
                                <span className={`px-1 rounded-xs border text-[7.5px] leading-tight flex-shrink-0 ${getItemStatusBadgeClass(st.paracetamolStatus)}`}>
                                  {st.paracetamolStatus === 'Normal' ? 'ปกติ' : 'พร่อง/ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Exp: {st.paracetamolExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-1.5 bg-slate-50 rounded-sm border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 font-medium truncate" title="ยาแก้เมาเรือ">🤢 2. ยาแก้เมาเรือ</span>
                                <span className={`px-1 rounded-xs border text-[7.5px] leading-tight flex-shrink-0 ${getItemStatusBadgeClass(st.motionSicknessStatus)}`}>
                                  {st.motionSicknessStatus === 'Normal' ? 'ปกติ' : 'พร่อง/ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Exp: {st.motionSicknessExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-1.5 bg-slate-50 rounded-sm border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 font-medium truncate" title="แอมโมเนียหอม">👃 3. แอมโมเนียหอม</span>
                                <span className={`px-1 rounded-xs border text-[7.5px] leading-tight flex-shrink-0 ${getItemStatusBadgeClass(st.ammoniaStatus)}`}>
                                  {st.ammoniaStatus === 'Normal' ? 'ปกติ' : 'พร่อง/ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Exp: {st.ammoniaExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-1.5 bg-slate-50 rounded-sm border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 font-medium truncate" title="พลาสเตอร์ปิดแผล">🩹 4. พลาสเตอร์</span>
                                <span className={`px-1 rounded-xs border text-[7.5px] leading-tight flex-shrink-0 ${getItemStatusBadgeClass(st.bandagesStatus)}`}>
                                  {st.bandagesStatus === 'Normal' ? 'ปกติ' : 'พร่อง/ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Exp: {st.bandagesExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-1.5 bg-slate-50 rounded-sm border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 font-medium truncate" title="ยาธาตุน้ำขาว/ยาลดกรด">🥛 5. ยาลดกรด</span>
                                <span className={`px-1 rounded-xs border text-[7.5px] leading-tight flex-shrink-0 ${getItemStatusBadgeClass(st.antacidStatus)}`}>
                                  {st.antacidStatus === 'Normal' ? 'ปกติ' : 'พร่อง/ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Exp: {st.antacidExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-1.5 bg-slate-50 rounded-sm border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 font-medium truncate" title="สำลีก้าน">🎋 6. สำลีก้าน</span>
                                <span className={`px-1 rounded-xs border text-[7.5px] leading-tight flex-shrink-0 ${getItemStatusBadgeClass(st.cottonBudsStatus)}`}>
                                  {st.cottonBudsStatus === 'Normal' ? 'ปกติ' : 'พร่อง/ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Exp: {st.cottonBudsExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-1.5 bg-slate-50 rounded-sm border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 font-medium truncate" title="ยาเบตาดีนล้างแผล">🟤 7. ยาเบตาดีน</span>
                                <span className={`px-1 rounded-xs border text-[7.5px] leading-tight flex-shrink-0 ${getItemStatusBadgeClass(st.betadineStatus)}`}>
                                  {st.betadineStatus === 'Normal' ? 'ปกติ' : 'พร่อง/ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Exp: {st.betadineExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-1.5 bg-slate-50 rounded-sm border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 font-medium truncate" title="น้ำเกลือล้างแผล">💧 8. น้ำเกลือล้างแผล</span>
                                <span className={`px-1 rounded-xs border text-[7.5px] leading-tight flex-shrink-0 ${getItemStatusBadgeClass(st.salineStatus)}`}>
                                  {st.salineStatus === 'Normal' ? 'ปกติ' : 'พร่อง/ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Exp: {st.salineExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-1.5 bg-slate-50 rounded-sm border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 font-medium truncate" title="ผ้าก๊อซปิดแผล">🕸️ 9. ผ้าก๊อซปิดแผล</span>
                                <span className={`px-1 rounded-xs border text-[7.5px] leading-tight flex-shrink-0 ${getItemStatusBadgeClass(st.gauzeStatus)}`}>
                                  {st.gauzeStatus === 'Normal' ? 'ปกติ' : 'พร่อง/ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Exp: {st.gauzeExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-1.5 bg-slate-50 rounded-sm border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 font-medium truncate" title="เทปแต่งแผล">🎗️ 10. เทปแต่งแผล</span>
                                <span className={`px-1 rounded-xs border text-[7.5px] leading-tight flex-shrink-0 ${getItemStatusBadgeClass(st.surgicalTapeStatus)}`}>
                                  {st.surgicalTapeStatus === 'Normal' ? 'ปกติ' : 'พร่อง/ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Exp: {st.surgicalTapeExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-1.5 bg-slate-50 rounded-sm border border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 font-medium truncate" title="สำลีก้อนสำหรับทาแผล,ซับเลือด">⚪ 11. สำลีก้อน</span>
                                <span className={`px-1 rounded-xs border text-[7.5px] leading-tight flex-shrink-0 ${getItemStatusBadgeClass(st.cottonBallsStatus)}`}>
                                  {st.cottonBallsStatus === 'Normal' ? 'ปกติ' : 'พร่อง/ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Exp: {st.cottonBallsExpiry || '-'}</span>
                            </div>

                            <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-sm border border-slate-100 col-span-1">
                              <span className="text-slate-600 font-medium truncate">📦 ตัวตู้/กล่อง</span>
                              <span className={`px-1 py-0.2 rounded-xs border text-[7.5px] flex-shrink-0 ${getItemStatusBadgeClass(st.containerStatus)}`}>
                                {st.containerStatus === 'Normal' ? 'ปกติ' : 'ต้องแก้ไข'}
                              </span>
                            </div>

                          </div>
                        )}
                      </div>

                      {/* Display inspection metadata */}
                      <div className="border-t border-slate-100 pt-3 text-[10px] space-y-1">
                        <div className="flex justify-between text-slate-500 font-mono">
                          <span>ตรวจเช็คล่าสุด:</span>
                          <span className="font-bold text-slate-700">{st.lastInspectedDate || 'ยังไม่ได้ตรวจ'}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-mono">
                          <span>เจ้าหน้าที่ผู้รับผิดชอบ:</span>
                          <span className="font-bold text-slate-700">{st.lastInspector || 'ไม่มีข้อมูล'}</span>
                        </div>
                        {st.remarks && (
                          <div className="mt-2 text-[10px] p-2 bg-rose-50 text-rose-800 rounded border border-rose-100 h-10 overflow-y-auto leading-normal">
                            <strong>หมายเหตุ: </strong>{st.remarks}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Bottom Trigger Action button to pop-up Audit modal */}
                    <div className="bg-slate-50 border-t border-slate-100 p-3">
                      <button
                        onClick={() => handleOpenInspect(st)}
                        className="w-full bg-slate-900 border border-slate-950 font-bold hover:bg-slate-800 text-white p-2 text-xs rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <PlusCircle className="h-4 w-4 text-teal-400" />
                        <span>ลงบันทึกการตรวจเช็ค (Record Audit)</span>
                      </button>
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>

      {/* Historical Logs List */}
      <div className="bg-white border rounded border-slate-200 shadow-sm space-y-4 p-4">
        <div className="border-b border-slate-200 bg-slate-50/70 p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3 rounded-t">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4.5 w-4.5 text-slate-700" />
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">ประวัติบันทึกการตรวจเวชภัณฑ์ยารวม (Monthly Audit Logs)</h3>
          </div>
          <span className="bg-teal-150 text-teal-900 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
            พบตามตัวกรอง: {history.filter(h => {
              const [y, m] = h.inspectionDate.split('-');
              return (medYearFilter === 'all' || y === medYearFilter) && (medMonthFilter === 'all' || m === medMonthFilter);
            }).length} / ทั้งหมด {history.length} รายการ
          </span>
        </div>

        {/* Filters for medical history */}
        <div className="bg-slate-50/80 p-3 rounded border border-slate-150 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 min-w-[70px]">ปี พ.ศ.:</span>
            <select
              value={medYearFilter}
              onChange={(e) => setMedYearFilter(e.target.value)}
              className="w-full bg-white text-slate-700 border border-slate-200 rounded p-1.5 font-bold focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="all">แสดงทุกปี (All Years)</option>
              {['2026', '2027', '2028', '2029', '2030', '2031'].map((y) => (
                <option key={y} value={y}>
                  พ.ศ. {parseInt(y, 10) + 543} ({y})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 min-w-[70px]">เดือนตรวจ:</span>
            <select
              value={medMonthFilter}
              onChange={(e) => setMedMonthFilter(e.target.value)}
              className="w-full bg-white text-slate-700 border border-slate-200 rounded p-1.5 font-bold focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="all">แสดงทุกเดือน (All Months)</option>
              {[
                { v: '01', l: 'มกราคม' },
                { v: '02', l: 'กุมภาพันธ์' },
                { v: '03', l: 'มีนาคม' },
                { v: '04', l: 'เมษายน' },
                { v: '05', l: 'พฤษภาคม' },
                { v: '06', l: 'มิถุนายน' },
                { v: '07', l: 'กรกฎาคม' },
                { v: '08', l: 'สิงหาคม' },
                { v: '09', l: 'กันยายน' },
                { v: '10', l: 'ตุลาคม' },
                { v: '11', l: 'พฤศจิกายน' },
                { v: '12', l: 'ธันวาคม' },
              ].map((m) => (
                <option key={m.v} value={m.v}>
                  {m.l}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-2 border-l border-slate-200/60 pl-2">
            <span className="font-bold text-slate-700">การแสดงผล:</span>
            <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 shadow-3xs">
              <button
                onClick={() => setMedGroupedView(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  medGroupedView
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                จัดกลุ่มรายเดือน
              </button>
              <button
                onClick={() => setMedGroupedView(false)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  !medGroupedView
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                ทั้งหมด
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-150 max-h-[450px] overflow-y-auto space-y-4">
          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">ยังไม่พบประวัติการตรวจเช็คเวชภัณฑ์ถูกเขียนบันทึก</div>
          ) : (() => {
            // Apply filtering
            const filteredLogs = history.filter((h) => {
              const [y, m] = h.inspectionDate.split('-');
              const matchYear = medYearFilter === 'all' || y === medYearFilter;
              const matchMonth = medMonthFilter === 'all' || m === medMonthFilter;
              return matchYear && matchMonth;
            }).sort((a, b) => b.inspectionDate.localeCompare(a.inspectionDate));

            if (filteredLogs.length === 0) {
              return (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  ไม่พบบันทึกการตรวจตามปีหรือเดือนที่ระบุ
                </div>
              );
            }

            // Grouping logic if enabled
            if (medGroupedView) {
              const grouped: { [key: string]: MedicalInspectionRecord[] } = {};
              filteredLogs.forEach((l) => {
                const ym = l.inspectionDate.substring(0, 7); // "YYYY-MM"
                if (!grouped[ym]) grouped[ym] = [];
                grouped[ym].push(l);
              });

              const sortedYmKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

              const thaiMonthsNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
              const getMonthYearLabelThai = (ym: string) => {
                const [y, m] = ym.split('-');
                const monthName = thaiMonthsNames[parseInt(m, 10) - 1] || m;
                return `เดือน${monthName} พ.ศ. ${parseInt(y, 10) + 543} (ค.ศ. ${y})`;
              };

              return sortedYmKeys.map((ymKey) => (
                <div key={ymKey} className="bg-slate-50/40 p-3 rounded-lg border border-slate-150 space-y-2 mt-2">
                  <div className="bg-teal-900 text-teal-50 px-3 py-1.5 rounded font-extrabold text-xs flex justify-between items-center shadow-3xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>{getMonthYearLabelThai(ymKey)}</span>
                    </div>
                    <span className="bg-teal-950 px-2 py-0.5 rounded text-[10px] font-mono">
                      จำนวน {grouped[ymKey].length} บันทึก
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 bg-white rounded border border-slate-200">
                    {grouped[ymKey].map((h, hIdx) => (
                      <div key={h.id || hIdx} className="p-3 hover:bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                              h.stationType === 'boat' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-teal-700'
                            }`}>
                              {h.stationId}
                            </span>
                            <strong className="text-slate-800 text-sm font-bold">{h.targetName}</strong>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-600 font-medium">{h.location}</span>
                          </div>

                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-450 font-mono">
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3 text-slate-400" />
                              <span>ตรวจโดย: <span className="text-slate-700 font-bold">{h.inspectorName}</span></span>
                            </div>
                            <span>•</span>
                            <div>
                              <span>วันที่: <span className="text-slate-700 font-bold">{h.inspectionDate}</span></span>
                            </div>
                          </div>

                          {h.remarks && (
                            <p className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded inline-block mt-1">
                              <strong>หมายเหตุเพิ่มเติม:</strong> {h.remarks}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 sm:text-right">
                          {/* Status checklist metrics summarized */}
                          <div className="hidden lg:flex gap-1 flex-wrap justify-end max-w-sm">
                            <span className={`text-[8px] px-1 border rounded-xs ${h.paracetamolStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="ยาแก้ปวดพาราเซตามอล">1.พาราฯ</span>
                            <span className={`text-[8px] px-1 border rounded-xs ${h.motionSicknessStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="ยาแก้เมาเรือ">2.แก้เมารถ</span>
                            <span className={`text-[8px] px-1 border rounded-xs ${h.ammoniaStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="แอมโมเนียหอม">3.แอมโมเนีย</span>
                            <span className={`text-[8px] px-1 border rounded-xs ${h.bandagesStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="พลาสเตอร์ปิดแผล">4.พลาสเตอร์</span>
                            <span className={`text-[8px] px-1 border rounded-xs ${h.antacidStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="ยาธาตุน้ำขาว/ยาลดกรด">5.ยาลดกรด</span>
                            <span className={`text-[8px] px-1 border rounded-xs ${h.cottonBudsStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="สำลีก้าน">6.สำลีก้าน</span>
                            <span className={`text-[8px] px-1 border rounded-xs ${h.betadineStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="ยาเบตาดีนล้างแผล">7.เบตาดีน</span>
                            <span className={`text-[8px] px-1 border rounded-xs ${h.salineStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="น้ำเกลือล้างแผล">8.น้ำเกลือ</span>
                            <span className={`text-[8px] px-1 border rounded-xs ${h.gauzeStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="ผ้าก๊อซปิดแผล">9.ผ้าก๊อซ</span>
                            <span className={`text-[8px] px-1 border rounded-xs ${h.surgicalTapeStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="เทปแต่งแผล">10.เทปแต่งแผล</span>
                            <span className={`text-[8px] px-1 border rounded-xs ${h.cottonBallsStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="สำลีก้อนสำหรับทาแผล,ซับเลือด">11.สำลีก้อน</span>
                            <span className={`text-[8px] px-1 border rounded-xs ${h.containerStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="กล่อง/ตู้เก็บ">ตู้ยา</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {h.photoUrl && (
                              <div 
                                onClick={() => setSelectedLightboxPhoto(h.photoUrl || null)}
                                className="relative w-8 h-8 rounded border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 hover:scale-105 transition-all shadow-xs"
                                title="ดูรูปถ่ายรายงาน"
                              >
                                <img 
                                  src={h.photoUrl} 
                                  alt="Medical Kit Audit" 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                            <span className={`text-[10px] font-bold py-1 px-2.5 rounded border ${
                              h.overallStatus === 'Pass' 
                                ? 'bg-green-50 text-green-600 border-green-200' 
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}>
                              {h.overallStatus === 'Pass' ? 'ผ่านเกณฑ์ปกติ' : 'ชำรุด/พบค้างซ่อม'}
                            </span>
                            <button
                              onClick={() => onDeleteInspection(h.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200 cursor-pointer transition-colors"
                              title="ลบประวัตินี้"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            }

            // Else, plain flat list of logs
            return filteredLogs.map((h, hIdx) => (
              <div key={h.id || hIdx} className="p-4 hover:bg-slate-50/60 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      h.stationType === 'boat' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-teal-700'
                    }`}>
                      {h.stationId}
                    </span>
                    <strong className="text-slate-800 text-sm font-bold">{h.targetName}</strong>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600 font-medium">{h.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-450 font-mono">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-3 w-3 text-slate-400" />
                      <span>ตรวจโดย: <span className="text-slate-700 font-bold">{h.inspectorName}</span></span>
                    </div>
                    <span>•</span>
                    <div>
                      <span>วันที่: <span className="text-slate-700 font-bold">{h.inspectionDate}</span></span>
                    </div>
                  </div>

                  {h.remarks && (
                    <p className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded inline-block mt-1">
                      <strong>หมายเหตุเพิ่มเติม:</strong> {h.remarks}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:text-right">
                  {/* Status checklist metrics summarized */}
                  <div className="hidden md:flex gap-1 flex-wrap justify-end max-w-md">
                    <span className={`text-[8px] px-1 border rounded-xs ${h.paracetamolStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="ยาแก้ปวดพาราเซตามอล">1.พาราฯ</span>
                    <span className={`text-[8px] px-1 border rounded-xs ${h.motionSicknessStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="ยาแก้เมาเรือ">2.แก้เมารถ</span>
                    <span className={`text-[8px] px-1 border rounded-xs ${h.ammoniaStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="แอมโมเนียหอม">3.แอมโมเนีย</span>
                    <span className={`text-[8px] px-1 border rounded-xs ${h.bandagesStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="พลาสเตอร์ปิดแผล">4.พลาสเตอร์</span>
                    <span className={`text-[8px] px-1 border rounded-xs ${h.antacidStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="ยาธาตุน้ำขาว/ยาลดกรด">5.ยาลดกรด</span>
                    <span className={`text-[8px] px-1 border rounded-xs ${h.cottonBudsStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="สำลีก้าน">6.สำลีก้าน</span>
                    <span className={`text-[8px] px-1 border rounded-xs ${h.betadineStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="ยาเบตาดีนล้างแผล">7.เบตาดีน</span>
                    <span className={`text-[8px] px-1 border rounded-xs ${h.salineStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="น้ำเกลือล้างแผล">8.น้ำเกลือ</span>
                    <span className={`text-[8px] px-1 border rounded-xs ${h.gauzeStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="ผ้าก๊อซปิดแผล">9.ผ้าก๊อซ</span>
                    <span className={`text-[8px] px-1 border rounded-xs ${h.surgicalTapeStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="เทปแต่งแผล">10.เทปแต่งแผล</span>
                    <span className={`text-[8px] px-1 border rounded-xs ${h.cottonBallsStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="สำลีก้อนสำหรับทาแผล,ซับเลือด">11.สำลีก้อน</span>
                    <span className={`text-[8px] px-1 border rounded-xs ${h.containerStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`} title="กล่อง/ตู้เก็บ">ตู้ยา</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {h.photoUrl && (
                      <div 
                        onClick={() => setSelectedLightboxPhoto(h.photoUrl || null)}
                        className="relative w-8 h-8 rounded border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 hover:scale-105 transition-all shadow-xs"
                        title="ดูรูปถ่ายรายงาน"
                      >
                        <img 
                          src={h.photoUrl} 
                          alt="Medical Kit Audit" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <span className={`text-[10px] font-bold py-1 px-2.5 rounded border ${
                      h.overallStatus === 'Pass' 
                        ? 'bg-green-50 text-green-600 border-green-200' 
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {h.overallStatus === 'Pass' ? 'ผ่านเกณฑ์ปกติ' : 'ชำรุด/พบค้างซ่อม'}
                    </span>
                    <button
                      onClick={() => onDeleteInspection(h.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200 cursor-pointer transition-colors"
                      title="ลบประวัตินี้"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Interactive Modal Sheet Overlay */}
      {inspectingStation && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
          <div 
            className="bg-white rounded border-2 border-slate-900 shadow-2xl max-w-xl w-full max-h-[95vh] flex flex-col overflow-hidden animate-fade-in"
            id="inspection-modal"
          >
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b-2 border-slate-950 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest bg-teal-600 text-white px-2 py-0.5 rounded-sm font-mono border border-teal-500">
                  AUDIT ID: {inspectingStation.id}
                </span>
                <h3 className="text-base font-bold uppercase mt-1.5 tracking-tight">
                  บันทึกผลตรวจสอบ: {inspectingStation.targetName}
                </h3>
              </div>
              <button 
                onClick={handleCloseInspect}
                className="p-2 text-slate-400 hover:text-white rounded transition-colors"
                id="close-modal-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Container form */}
            <form onSubmit={handleSubmitInspection} className="flex flex-col overflow-hidden min-h-0 flex-1">
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* Target metadata display */}
              <div className="p-3 bg-teal-50 text-teal-950 rounded text-xs leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[11px] text-teal-900">
                  <Activity className="h-4 w-4 text-teal-600 animate-pulse" />
                  <span>ตำแหน่งงาน: {inspectingStation.stationId} ({inspectingStation.stationType === 'boat' ? 'ตู้ยาพกพาบนเรือ' : 'ตู้ยาสถานีรายท่าเทียบ'})</span>
                </div>
                <div><strong>ตู้ยาประจำ:</strong> {inspectingStation.targetName} | <strong>รายละเอียดจุดติดตั้ง:</strong> {inspectingStation.location}</div>
              </div>

              {/* Inspector details entry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block gap-1">
                    👨‍✈️ ชื่อเจ้าหน้าที่ผู้ตรวจสอบ (Auditor Name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ระบุชื่อ-นามสกุล เช่น สมศรี สุขสบาย"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full bg-white text-slate-800 text-xs border border-slate-300 rounded p-2 focus:outline-none focus:border-slate-900 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    📅 วันที่เข้าทำความสะอาดและตรวจสอบ (Date)
                  </label>
                  <input
                    type="date"
                    required
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full bg-white text-slate-800 text-xs border border-slate-300 rounded p-2 focus:outline-none focus:border-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Matrix of items select box indicators */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-widest font-mono">
                  การคัดกรองประเมินรายเวชภัณฑ์ (Inspection Parameters)
                </h4>

                {/* Param 1: Paracetamol */}
                <div className="bg-slate-50/80 p-3 rounded border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-bold text-slate-800 block">💊 1. ยาแก้ปวดพาราเซตามอล</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Paracetamol 500mg</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">สถานะ (Status)</label>
                    <select
                      value={paracetamolStatus}
                      onChange={(e) => setParacetamolStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 ยาหมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 เสียหาย / ชำรุด</option>
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">วันหมดอายุ (Expiry Date)</label>
                    <input
                      type="date"
                      required
                      value={paracetamolExpiry}
                      onChange={(e) => setParacetamolExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Param 2: Motion Sickness */}
                <div className="bg-slate-50/80 p-3 rounded border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-bold text-slate-800 block">🤢 2. ยาแก้เมาเรือ</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Dimenhydrinate (Motion Sickness)</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">สถานะ (Status)</label>
                    <select
                      value={motionSicknessStatus}
                      onChange={(e) => setMotionSicknessStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 ยาหมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 เสียหาย / ชำรุด</option>
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">วันหมดอายุ (Expiry Date)</label>
                    <input
                      type="date"
                      required
                      value={motionSicknessExpiry}
                      onChange={(e) => setMotionSicknessExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Param 3: Ammonia */}
                <div className="bg-slate-50/80 p-3 rounded border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-bold text-slate-800 block">👃 3. แอมโมเนียหอม</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Ammonia Inhalant</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">สถานะ (Status)</label>
                    <select
                      value={ammoniaStatus}
                      onChange={(e) => setAmmoniaStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 เสียหาย / ผิดรูป</option>
                    </select>
                    {ammoniaStatus !== 'Normal' && <div className="text-[10px] font-bold text-red-600 mt-1.5 bg-red-50 p-1 px-2 rounded-sm border border-red-100">* โปรดระบุหมายเหตุ/เบิกทดแทน</div>}
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">วันหมดอายุ (Expiry Date)</label>
                    <input
                      type="date"
                      required
                      value={ammoniaExpiry}
                      onChange={(e) => setAmmoniaExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Param 4: Bandages */}
                <div className="bg-slate-50/80 p-3 rounded border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-bold text-slate-800 block">🩹 4. พลาสเตอร์ปิดแผล</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Adhesive Bandages</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">สถานะ (Status)</label>
                    <select
                      value={bandagesStatus}
                      onChange={(e) => setBandagesStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 เสียหาย / ชื้นเปียก</option>
                    </select>
                    {bandagesStatus !== 'Normal' && <div className="text-[10px] font-bold text-red-600 mt-1.5 bg-red-50 p-1 px-2 rounded-sm border border-red-100">* โปรดระบุหมายเหตุ/เบิกทดแทน</div>}
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">วันหมดอายุ (Expiry Date)</label>
                    <input
                      type="date"
                      required
                      value={bandagesExpiry}
                      onChange={(e) => setBandagesExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Param 5: Antacid */}
                <div className="bg-slate-50/80 p-3 rounded border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-bold text-slate-800 block">🥛 5. ยาธาตุน้ำขาว/ยาลดกรด</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Antacid / Stomachic</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">สถานะ (Status)</label>
                    <select
                      value={antacidStatus}
                      onChange={(e) => setAntacidStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 กล่องรั่ว / บรรจุภัณฑ์ชำรุด</option>
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">วันหมดอายุ (Expiry Date)</label>
                    <input
                      type="date"
                      required
                      value={antacidExpiry}
                      onChange={(e) => setAntacidExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Param 6: Cotton Buds */}
                <div className="bg-slate-50/80 p-3 rounded border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-bold text-slate-800 block">🎋 6. สำลีก้าน</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Cotton Swabs</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">สถานะ (Status)</label>
                    <select
                      value={cottonBudsStatus}
                      onChange={(e) => setCottonBudsStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 บรรจุภัณฑ์ฉีกขาด / สกปรก</option>
                    </select>
                    {cottonBudsStatus !== 'Normal' && <div className="text-[10px] font-bold text-red-600 mt-1.5 bg-red-50 p-1 px-2 rounded-sm border border-red-100">* โปรดระบุหมายเหตุ/เบิกทดแทน</div>}
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">วันหมดอายุ (Expiry Date)</label>
                    <input
                      type="date"
                      required
                      value={cottonBudsExpiry}
                      onChange={(e) => setCottonBudsExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Param 7: Betadine */}
                <div className="bg-slate-50/80 p-3 rounded border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-bold text-slate-800 block">🟤 7. ยาเบตาดีนล้างแผล</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Betadine Wound Cleanser</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">สถานะ (Status)</label>
                    <select
                      value={betadineStatus}
                      onChange={(e) => setBetadineStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 ยาหมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 ฝาแตก / รั่วซึม</option>
                    </select>
                    {betadineStatus !== 'Normal' && <div className="text-[10px] font-bold text-red-600 mt-1.5 bg-red-50 p-1 px-2 rounded-sm border border-red-100">* โปรดระบุหมายเหตุ/เบิกทดแทน</div>}
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">วันหมดอายุ (Expiry Date)</label>
                    <input
                      type="date"
                      required
                      value={betadineExpiry}
                      onChange={(e) => setBetadineExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Param 8: Saline */}
                <div className="bg-slate-50/80 p-3 rounded border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-bold text-slate-800 block">💧 8. น้ำเกลือล้างแผล</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Saline Wound Wash</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">สถานะ (Status)</label>
                    <select
                      value={salineStatus}
                      onChange={(e) => setSalineStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 ยาหมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 เปิดใช้แล้ว / ขวดแตก</option>
                    </select>
                    {salineStatus !== 'Normal' && <div className="text-[10px] font-bold text-red-600 mt-1.5 bg-red-50 p-1 px-2 rounded-sm border border-red-100">* โปรดระบุหมายเหตุ/เบิกทดแทน</div>}
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">วันหมดอายุ (Expiry Date)</label>
                    <input
                      type="date"
                      required
                      value={salineExpiry}
                      onChange={(e) => setSalineExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Param 9: Gauze */}
                <div className="bg-slate-50/80 p-3 rounded border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-bold text-slate-800 block">🕸️ 9. ผ้าก๊อซปิดแผล</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Gauze Pads</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">สถานะ (Status)</label>
                    <select
                      value={gauzeStatus}
                      onChange={(e) => setGauzeStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 ปนเปื้อน / ซองฉีกขาด</option>
                    </select>
                    {gauzeStatus !== 'Normal' && <div className="text-[10px] font-bold text-red-600 mt-1.5 bg-red-50 p-1 px-2 rounded-sm border border-red-100">* โปรดระบุหมายเหตุ/เบิกทดแทน</div>}
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">วันหมดอายุ (Expiry Date)</label>
                    <input
                      type="date"
                      required
                      value={gauzeExpiry}
                      onChange={(e) => setGauzeExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Param 10: Surgical Tape */}
                <div className="bg-slate-50/80 p-3 rounded border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-bold text-slate-800 block">🎗️ 10. เทปแต่งแผล</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Medical Tape</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">สถานะ (Status)</label>
                    <select
                      value={surgicalTapeStatus}
                      onChange={(e) => setSurgicalTapeStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 หมดกาว / เก่าชำรุด</option>
                    </select>
                    {surgicalTapeStatus !== 'Normal' && <div className="text-[10px] font-bold text-red-600 mt-1.5 bg-red-50 p-1 px-2 rounded-sm border border-red-100">* โปรดระบุหมายเหตุ/เบิกทดแทน</div>}
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">วันหมดอายุ (Expiry Date)</label>
                    <input
                      type="date"
                      required
                      value={surgicalTapeExpiry}
                      onChange={(e) => setSurgicalTapeExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Param 11: Cotton Balls */}
                <div className="bg-slate-50/80 p-3 rounded border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-bold text-slate-800 block">⚪ 11. สำลีก้อนสำหรับทาแผล,ซับเลือด</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Cotton Balls</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">สถานะ (Status)</label>
                    <select
                      value={cottonBallsStatus}
                      onChange={(e) => setCottonBallsStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 ซองฉีกขาด / ปนเปื้อน</option>
                    </select>
                    {cottonBallsStatus !== 'Normal' && <div className="text-[10px] font-bold text-red-600 mt-1.5 bg-red-50 p-1 px-2 rounded-sm border border-red-100">* โปรดระบุหมายเหตุ/เบิกทดแทน</div>}
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">วันหมดอายุ (Expiry Date)</label>
                    <input
                      type="date"
                      required
                      value={cottonBallsExpiry}
                      onChange={(e) => setCottonBallsExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Param 12: Container */}
                <div className="bg-slate-50/80 p-3 rounded border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-bold text-slate-800 block">📦 12. สภาพกล่อง/ตัวตู้ยา</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Container Quality</span>
                  </div>
                  <div className="sm:col-span-2 space-y-0.5">
                    <label className="text-[8px] font-extrabold text-slate-400 block uppercase">สถานะกล่อง/บานพับ/ระบบล็อค</label>
                    <select
                      value={containerStatus}
                      onChange={(e) => setContainerStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / แข็งแรงและแห้งมิดชิด (Safe & Normal)</option>
                      <option value="Damaged">🔴 แตกหัก / ชำรุดฝาล็อคไม่ได้ (Damaged)</option>
                      <option value="Missing">🟠 ตู้สูญหาย / ถูกเคลื่อนย้าย (Missing)</option>
                    </select>
                    {containerStatus !== 'Normal' && <div className="text-[10px] font-bold text-red-600 mt-1.5 bg-red-50 p-1 px-2 rounded-sm border border-red-100">* โปรดระบุหมายเหตุการชำรุด/สูญหาย</div>}
                  </div>
                </div>

              </div>

              {/* Photo Upload Box */}
              <div className="space-y-1 border-t border-slate-200 pt-4">
                <ImageUpload
                  label="แนบรูปถ่ายสภาพตู้ยา / เวชภัณฑ์ประกอบการตรวจสอบ"
                  onImageSelected={setPhotoUrl}
                  existingImage={photoUrl}
                />
              </div>

              {/* Remarks Box */}
              <div className="space-y-1 border-t border-slate-200 pt-4">
                <label className="text-xs font-bold text-slate-700 block">
                  📝 รายละเอียดเพิ่มเติม / แผนเสนอแก้ไขเบิกอุปกรณ์ (Remarks & Orders)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="เช่น เบิกพาราเซตามอลมาเติม 2 แผง และแอลกอฮอล์เพิ่มเนื่องจากเปิดใช้แล้ว..."
                  className="w-full bg-white text-slate-800 text-xs border border-slate-300 rounded p-2.5 h-16 focus:outline-none focus:border-slate-800 font-sans leading-normal"
                />
              </div>
              </div>

              {/* Form Actions Footer */}
              <div className="px-6 py-4 bg-slate-100 border-t-2 border-slate-200 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseInspect}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded font-mono uppercase tracking-wide cursor-pointer"
                >
                  ยกเลิก (CANCEL)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-950 rounded border border-slate-950 transition-all flex items-center gap-2 shadow-sm font-mono uppercase tracking-wide cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  บันทึกรายงาน (SAVE AUDIT)
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Interactive Lightbox Portal for Zooming Medical Images */}
      {selectedLightboxPhoto && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedLightboxPhoto(null)}
        >
          <div className="relative bg-white p-2 rounded border border-slate-900 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <button
              onClick={() => setSelectedLightboxPhoto(null)}
              className="absolute top-4 right-4 bg-slate-900/80 text-white p-2 rounded-full cursor-pointer hover:bg-slate-950 transition-colors z-10 font-bold"
              title="Close"
            >
              ✕ CLOSE
            </button>
            <div className="flex-1 bg-slate-950 flex items-center justify-center overflow-hidden rounded">
              <img 
                src={selectedLightboxPhoto} 
                alt="Medical Kit Zoom" 
                className="max-w-full max-h-[75vh] object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
