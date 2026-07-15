import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowUpDown, 
  ShieldCheck, 
  Flame, 
  AlertCircle, 
  Calendar, 
  Users, 
  Filter, 
  CheckCircle, 
  Trash2, 
  List, 
  Grid,
  LifeBuoy,
  HeartPulse,
  FileText,
  Eye,
  ChevronDown,
  ImagePlus,
  Camera,
  FileJson,
  Download,
  Upload
} from 'lucide-react';
import { 
  InspectionRecord, 
  LifeJacketInspectionRecord, 
  LicenseInspectionRecord, 
  MedicalInspectionRecord 
} from '../types';

interface HistoryLogProps {
  extinguisherHistory?: InspectionRecord[];
  lifeJacketHistory?: LifeJacketInspectionRecord[];
  licenseHistory?: LicenseInspectionRecord[];
  medicalHistory?: MedicalInspectionRecord[];
  onClearHistory: (category: 'all' | 'extinguisher' | 'lifejacket' | 'license' | 'medical') => void;
  onDeleteRecord?: (id: string, category: 'extinguisher' | 'lifejacket' | 'license' | 'medical') => void;
  onAddRectificationPhoto?: (id: string, category: 'extinguisher' | 'lifejacket' | 'license' | 'medical', photoUrl: string) => void;
  onShowConfirm?: (title: string, message: string, onConfirm: () => void) => void;
  onRestoreBackup?: (backupData: any) => void;
}

export default function HistoryLog({ 
  extinguisherHistory = [], 
  lifeJacketHistory = [], 
  licenseHistory = [], 
  medicalHistory = [],
  onClearHistory,
  onDeleteRecord,
  onAddRectificationPhoto,
  onShowConfirm,
  onRestoreBackup
}: HistoryLogProps) {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'extinguisher' | 'lifejacket' | 'license' | 'medical'>('all');
  const [boatFilter, setBoatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [groupedByMonthView, setGroupedByMonthView] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedLicenseRecord, setSelectedLicenseRecord] = useState<LicenseInspectionRecord | null>(null);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<MedicalInspectionRecord | null>(null);

  const thaiMonths = [
    { value: '01', label: 'มกราคม' },
    { value: '02', label: 'กุมภาพันธ์' },
    { value: '03', label: 'มีนาคม' },
    { value: '04', label: 'เมษายน' },
    { value: '05', label: 'พฤษภาคม' },
    { value: '06', label: 'มิถุนายน' },
    { value: '07', label: 'กรกฎาคม' },
    { value: '08', label: 'สิงหาคม' },
    { value: '09', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' },
  ];

  const yearsList = ['2026', '2027', '2028', '2029', '2030', '2031'];

  const handleExportBackup = () => {
    const backupData = {
      boat_fire_extinguishers: window.localStorage.getItem('boat_fire_extinguishers'),
      boat_inspection_history: window.localStorage.getItem('boat_inspection_history'),
      boat_medical_stations: window.localStorage.getItem('boat_medical_stations'),
      boat_medical_history: window.localStorage.getItem('boat_medical_history'),
      boat_licenses: window.localStorage.getItem('boat_licenses'),
      boat_license_history: window.localStorage.getItem('boat_license_history'),
      boat_life_jackets: window.localStorage.getItem('boat_life_jackets'),
      boat_life_jacket_history: window.localStorage.getItem('boat_life_jacket_history'),
      boat_maintenance_history: window.localStorage.getItem('boat_maintenance_history'),
      boat_sheets_config: window.localStorage.getItem('boat_sheets_config'),
      boat_seat_positions: window.localStorage.getItem('boat_seat_positions'),
      backup_timestamp: new Date().toISOString(),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `maritime_safety_backup_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Basic check to see if it is our backup file format
        const keys = [
          'boat_fire_extinguishers',
          'boat_inspection_history',
          'boat_medical_stations',
          'boat_medical_history',
          'boat_licenses',
          'boat_license_history',
          'boat_life_jackets',
          'boat_life_jacket_history'
        ];
        
        const hasSomeKeys = keys.some(key => key in parsed);
        if (!hasSomeKeys) {
          alert('ไฟล์ที่นำเข้ามาไม่ใช่รูปแบบไฟล์สำรองข้อมูลของระบบนี้ กรุณาเลือกไฟล์สำรองข้อมูล JSON ที่ถูกต้อง');
          return;
        }

        const confirmMsg = 'คุณแน่ใจหรือไม่ที่จะทำการเขียนทับข้อมูลในเครื่องปัจจุบันทั้งหมดด้วยข้อมูลจากไฟล์สำรองนี้? การทำรายการนี้จะไม่สามารถกู้คืนได้';
        if (onShowConfirm) {
          onShowConfirm('ยืนยันการกู้คืนข้อมูล', confirmMsg, () => {
            if (onRestoreBackup) {
              onRestoreBackup(parsed);
            }
          });
        } else {
          const isConfirmed = window.confirm(confirmMsg);
          if (isConfirmed && onRestoreBackup) {
            onRestoreBackup(parsed);
          }
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON กรุณาตรวจสอบว่าไฟล์ไม่เสียหาย');
      }
    };
    reader.readAsText(file);
    
    // Clear input so same file can be uploaded again if needed
    e.target.value = '';
  };

  // --- Map and unify all records ---
  interface UnifiedRecord {
    id: string;
    category: 'extinguisher' | 'lifejacket' | 'license' | 'medical';
    boatOrTargetName: string;
    locationOrDetail: string;
    inspectionDate: string;
    inspectorName: string;
    status: 'Pass' | 'Fail';
    remarks: string;
    photoUrl?: string;
    rectificationPhotoUrl?: string;
    raw: any;
  }

  const unifiedExts: UnifiedRecord[] = extinguisherHistory.map(item => ({
    id: item.id,
    category: 'extinguisher',
    boatOrTargetName: item.boatName,
    locationOrDetail: `ถังดับเพลิง: ${item.location} (${item.type})`,
    inspectionDate: item.inspectionDate,
    inspectorName: item.inspectorName,
    status: item.overallStatus,
    remarks: item.remarks,
    photoUrl: item.photoUrl,
    rectificationPhotoUrl: item.rectificationPhotoUrl,
    raw: item
  }));

  const unifiedLJs: UnifiedRecord[] = lifeJacketHistory.map(item => ({
    id: item.id,
    category: 'lifejacket',
    boatOrTargetName: item.boatName,
    locationOrDetail: `เสื้อชูชีพผู้โดยสาร (ผู้ใหญ่: ${item.totalAdults} ตัว / เด็ก: ${item.totalKids} ตัว)`,
    inspectionDate: item.inspectionDate,
    inspectorName: item.inspectorName,
    status: item.overallStatus,
    remarks: item.remarks,
    photoUrl: item.photoUrl,
    rectificationPhotoUrl: item.rectificationPhotoUrl,
    raw: item
  }));

  const unifiedLics: UnifiedRecord[] = licenseHistory.map(item => ({
    id: item.id,
    category: 'license',
    boatOrTargetName: item.boatName,
    locationOrDetail: `ใบอนุญาตใช้เรือ ใบขับขี่เรือ และช่างเครื่องประจำเรือ`,
    inspectionDate: item.inspectionDate,
    inspectorName: item.inspectorName,
    status: item.overallStatus,
    remarks: item.remarks,
    photoUrl: item.vesselPhotoUrl || item.helmsmanPhotoUrl || item.engineerPhotoUrl,
    rectificationPhotoUrl: item.rectificationPhotoUrl,
    raw: item
  }));

  const unifiedMeds: UnifiedRecord[] = medicalHistory.map(item => ({
    id: item.id,
    category: 'medical',
    boatOrTargetName: item.targetName,
    locationOrDetail: `ตู้ยาเวชภัณฑ์ปฐมพยาบาล (${item.stationType === 'boat' ? 'บนเรือ' : 'ท่าเทียบเรือ'} - ${item.location})`,
    inspectionDate: item.inspectionDate,
    inspectorName: item.inspectorName,
    status: item.overallStatus,
    remarks: item.remarks,
    photoUrl: item.photoUrl,
    rectificationPhotoUrl: item.rectificationPhotoUrl,
    raw: item
  }));

  // Combine and apply filters
  const allUnifiedRecords = [
    ...unifiedExts,
    ...unifiedLJs,
    ...unifiedLics,
    ...unifiedMeds
  ];

  // Get unique boat names from unified history for filtering
  const uniqueBoats = Array.from(new Set(allUnifiedRecords.map(item => item.boatOrTargetName))).filter(Boolean);

  const filteredHistory = allUnifiedRecords
    .filter((h) => {
      const matchCategory = categoryFilter === 'all' || h.category === categoryFilter;
      const matchBoat = boatFilter === 'all' || h.boatOrTargetName === boatFilter;
      const matchStatus = statusFilter === 'all' || h.status === statusFilter;
      
      // Date split: YYYY-MM-DD
      const dateParts = h.inspectionDate.split('-');
      const year = dateParts[0];
      const month = dateParts[1];

      const matchYear = yearFilter === 'all' || year === yearFilter;
      const matchMonth = monthFilter === 'all' || month === monthFilter;

      return matchCategory && matchBoat && matchStatus && matchYear && matchMonth;
    })
    .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime());

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'extinguisher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10.5px] font-extrabold rounded-md uppercase">
            <Flame className="h-3 w-3" /> ถังดับเพลิง
          </span>
        );
      case 'lifejacket':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10.5px] font-extrabold rounded-md uppercase">
            <LifeBuoy className="h-3 w-3" /> เสื้อชูชีพ
          </span>
        );
      case 'license':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10.5px] font-extrabold rounded-md uppercase">
            <FileText className="h-3 w-3" /> ใบอนุญาตเรือ
          </span>
        );
      case 'medical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10.5px] font-extrabold rounded-md uppercase">
            <HeartPulse className="h-3 w-3" /> ตู้ยาเวชภัณฑ์
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusIndicator = (val: string) => {
    if (val === 'Pass') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black rounded-md py-0.5 uppercase tracking-wider">
          <CheckCircle className="h-3 w-3" /> ผ่านเกณฑ์
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black rounded-md py-0.5 animate-pulse uppercase tracking-wider">
        <AlertCircle className="h-3 w-3" /> บกพร่อง
      </span>
    );
  };

  const handleClearConfirm = () => {
    let confirmMsg = 'คุณต้องการที่จะล้างประวัติการตรวจสอบทั้งหมดออกจากระบบบราวเซอร์ หรือไม่?';
    if (categoryFilter !== 'all') {
      const catTh = categoryFilter === 'extinguisher' ? 'ถังดับเพลิง' : categoryFilter === 'lifejacket' ? 'เสื้อชูชีพ' : categoryFilter === 'license' ? 'ใบอนุญาตเรือ' : 'ตู้ยาเวชภัณฑ์';
      confirmMsg = `คุณต้องการที่จะล้างประวัติเฉพาะหมวดหมู่ [${catTh}] ออกจากบราวเซอร์ หรือไม่?`;
    }
    if (onShowConfirm) {
      onShowConfirm('ยืนยันการล้างประวัติ', confirmMsg, () => {
        onClearHistory(categoryFilter);
      });
    } else {
      const isConfirmed = window.confirm(confirmMsg);
      if (isConfirmed) {
        onClearHistory(categoryFilter);
      }
    }
  };

  // Group records by Month-Year
  const getGroupedRecords = () => {
    const groups: { [key: string]: UnifiedRecord[] } = {};
    filteredHistory.forEach((item) => {
      const ym = item.inspectionDate.substring(0, 7); // "YYYY-MM"
      if (!groups[ym]) {
        groups[ym] = [];
      }
      groups[ym].push(item);
    });
    return groups;
  };

  const groupedRecords = getGroupedRecords();
  const sortedGroupKeys = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));

  const getMonthLabelThai = (ymString: string) => {
    const [year, month] = ymString.split('-');
    const monthObj = thaiMonths.find((m) => m.value === month);
    const monthLabel = monthObj ? monthObj.label : month;
    const yearThai = parseInt(year, 10) + 543;
    return `เดือน${monthLabel} พ.ศ. ${yearThai} (ค.ศ. ${year})`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-2xl space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-950 flex items-center gap-2 tracking-tight">
            <Calendar className="h-6 w-6 text-indigo-700 animate-pulse" />
            ศูนย์ประวัติบันทึกความปลอดภัยแบบรวมศูนย์ (Integrated Safety Inspection Logs)
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-bold">
            เก็บบันทึกข้อมูลตรวจสอบและสถานะย้อนหลังอย่างเป็นทางการ สำหรับถังดับเพลิง เสื้อชูชีพ ใบรับรองเรือ และตู้ยา สำหรับเรือท่องเที่ยว 7 ลำ และท่าเทียบเรือ 11 ท่า
          </p>
        </div>

        {allUnifiedRecords.length > 0 && (
          <button
            onClick={handleClearConfirm}
            className="text-rose-500 border border-rose-500/30 hover:bg-rose-500/10 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all self-start md:self-center shrink-0 uppercase tracking-wider shadow-lg shadow-rose-200/20"
            title="ล้างประวัติเครื่อง"
          >
            <Trash2 className="h-4 w-4" />
            <span>ล้างประวัติ ({categoryFilter === 'all' ? 'ทั้งหมด' : 'เฉพาะหมวด'})</span>
          </button>
        )}
      </div>

      {/* JSON Backup & Restore System */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-350 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
            <FileJson className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-extrabold text-sm text-slate-950">
              ระบบสำรองและกู้คืนข้อมูลผ่านไฟล์ JSON (Data Backup & Recovery)
            </h3>
            <p className="text-[11px] text-slate-500 font-bold">
              สำรองข้อมูลประวัติทั้งหมด พิกัดเก้าอี้ และการตั้งค่าลงเครื่อง หรือนำข้อมูลสำรองเก่ากลับมาใช้งานใหม่
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Export / Backup Section */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-250 flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                📥 สำรองข้อมูลระบบ (Export JSON Backup)
              </h4>
              <p className="text-[11.5px] text-slate-600 leading-relaxed mt-2 font-medium">
                ดาวน์โหลดไฟล์ข้อมูลความปลอดภัยย้อนหลังทั้งหมดของกองเรือ รวมถึงพิกัดตำแหน่งเสื้อชูชีพและถังดับเพลิง บันทึกเวชภัณฑ์ และใบอนุญาต เพื่อเก็บไว้เป็นหลักฐานภายนอก
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="mt-4 w-full py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold text-xs rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>ดาวน์โหลดไฟล์สำรองข้อมูล (.json)</span>
            </button>
          </div>

          {/* Import / Restore Section */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-250 flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-xs text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                📤 กู้คืนข้อมูลระบบ (Import JSON Backup)
              </h4>
              <p className="text-[11.5px] text-slate-600 leading-relaxed mt-2 font-medium text-rose-800">
                ⚠️ คำเตือน: การกู้คืนข้อมูลผ่านไฟล์ JSON จะเขียนข้อมูลทับประวัติการตรวจในเบราว์เซอร์ปัจจุบันทันที กรุณาตรวจสอบให้แน่ใจว่าไฟล์ที่นำเข้ามานั้นถูกต้อง
              </p>
            </div>
            <div className="relative mt-4">
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                id="json-backup-upload"
                className="hidden"
              />
              <label
                htmlFor="json-backup-upload"
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250 font-extrabold text-xs rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-3xs"
              >
                <Upload className="h-4 w-4" />
                <span>นำเข้าและกู้คืนข้อมูลจากไฟล์ JSON</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Category Switch Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-300 pb-3">
        {[
          { id: 'all', label: '📁 ประวัติทั้งหมด', count: allUnifiedRecords.length, color: 'border-slate-300 bg-white text-slate-950' },
          { id: 'extinguisher', label: '🧯 ตรวจถังดับเพลิง', count: unifiedExts.length, color: 'border-red-500 bg-red-600 text-white' },
          { id: 'lifejacket', label: '🧡 ตรวจเสื้อชูชีพ', count: unifiedLJs.length, color: 'border-orange-500 bg-orange-500 text-white' },
          { id: 'license', label: '🚢 ตรวจใบอนุญาตเรือ/เจ้าหน้าที่', count: unifiedLics.length, color: 'border-blue-600 bg-blue-600 text-white' },
          { id: 'medical', label: '🏥 ตรวจตู้ยาเวชภัณฑ์', count: unifiedMeds.length, color: 'border-emerald-600 bg-emerald-600 text-white' },
        ].map((cat) => {
          const isActive = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryFilter(cat.id as any);
                setBoatFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                  : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-200 hover:text-slate-950'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-500 border border-slate-300'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Advanced Multi-Filter Options Panel */}
      <div className="bg-white p-4 border border-slate-300 rounded-2xl text-xs space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 mr-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="font-extrabold text-slate-500 uppercase tracking-widest text-[10px]">ตัวกรองระบบ:</span>
          </div>

          {/* Boat Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-black">เรือ/เป้าหมาย:</span>
            <select value={boatFilter}
              onChange={(e) => setBoatFilter(e.target.value)}
              className="bg-white text-slate-950 border border-slate-300 rounded-lg py-1.5 px-2.5 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-3xs"
            >
              <option value="all">ทั้งหมด (All Boats/Piers)</option>
              {uniqueBoats.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-black">ผลตรวจ:</span>
            <select value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white text-slate-950 border border-slate-300 rounded-lg py-1.5 px-2.5 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-3xs"
            >
              <option value="all">ทุกสถานะ (All)</option>
              <option value="Pass">ผ่านเกณฑ์ (Pass)</option>
              <option value="Fail">ไม่ผ่านเกณฑ์ (Fail)</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">ปี พ.ศ.:</span>
            <select value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-white text-slate-950 border border-slate-300 rounded-lg py-1.5 px-2.5 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-3xs"
            >
              <option value="all">ทุกปี</option>
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {parseInt(y, 10) + 543} ({y})
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">เดือน:</span>
            <select value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-white text-slate-950 border border-slate-300 rounded-lg py-1.5 px-2.5 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-3xs"
            >
              <option value="all">ทุกเดือน</option>
              {thaiMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Display options & total items found counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-300 pt-3 text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>มุมมองการแสดงผล:</span>
            <div className="inline-flex rounded-xl border border-slate-300 bg-white p-0.5 shadow-3xs">
              <button
                onClick={() => setGroupedByMonthView(true)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  groupedByMonthView
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100/50'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                จัดกลุ่มรายเดือน
              </button>
              <button
                onClick={() => setGroupedByMonthView(false)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  !groupedByMonthView
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100/50'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                แสดงตารางเต็ม
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span>พบข้อมูลประวัติตามตัวกรอง:</span>
            <span className="font-extrabold font-mono text-indigo-700 bg-white border border-slate-300 rounded px-2.5 py-0.5">
              {filteredHistory.length} รายการ
            </span>
          </div>
        </div>
      </div>

      {/* 3. History Logs Rendering */}
      {filteredHistory.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl flex flex-col items-center justify-center space-y-3 border border-dashed border-slate-300">
          <Calendar className="h-10 w-10 text-slate-700" />
          <div className="text-sm font-bold text-slate-500">ไม่พบประวัติการตรวจสอบย่อยในเงื่อนไขปัจจุบัน</div>
          <div className="text-xs text-slate-500 max-w-sm px-6">
            กรุณาตรวจสอบว่าคุณเลือกแท็บด้านบนถูกต้อง หรือมีข้อมูลที่ตรงกับตัวกรองชื่อเรือท่องเที่ยว/ท่าเทียบเรือ หรือผลการตรวจสอบหรือไม่
          </div>
        </div>
      ) : groupedByMonthView ? (
        /* 3.1 Monthly Grouped View representing standard workflow */
        <div className="space-y-8">
          {sortedGroupKeys.map((ymKey) => {
            const records = groupedRecords[ymKey];
            const passCount = records.filter((r) => r.status === 'Pass').length;
            const failCount = records.filter((r) => r.status === 'Fail').length;

            return (
              <div key={ymKey} className="bg-white rounded-2xl border border-slate-300 p-4 space-y-4">
                
                {/* Month block banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-300 px-4 py-3 rounded-xl shadow-3xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-950">
                      {getMonthLabelThai(ymKey)}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
                    <span className="text-slate-500">
                      รวมตรวจสอบในงวดนี้: <span className="text-slate-700 font-mono bg-white border border-slate-300 px-2 py-0.5 rounded">{records.length} รายการ</span>
                    </span>
                    <span className="text-slate-950">|</span>
                    <span className="text-emerald-700 bg-emerald-50/40 border border-emerald-200/50 px-2 py-0.5 rounded-md">
                      ผ่าน: {passCount}
                    </span>
                    {failCount > 0 && (
                      <span className="text-rose-700 bg-rose-50/40 border border-rose-200/50 px-2 py-0.5 rounded-md animate-pulse">
                        บกพร่อง: {failCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid layout for cards / small tables for responsiveness */}
                <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-white text-slate-950 font-black border-b border-slate-300">
                        <th className="p-3 font-mono w-20">รหัสบันทึก</th>
                        <th className="p-3">หมวดตรวจ</th>
                        <th className="p-3">เรือ / สถานที่</th>
                        <th className="p-3">รายละเอียดผลตรวจสอบ</th>
                        <th className="p-3">วันที่ตรวจสอบ</th>
                        <th className="p-3">ผู้บันทึกตรวจ</th>
                        <th className="p-3">ผลลัพธ์</th>
                        <th className="p-3">รูปภาพแนบ</th>
                        <th className="p-3">เจาะลึก/หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {records.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-100/50 transition-colors">
                          <td className="p-3 font-mono font-black text-indigo-700">{item.id.substring(0, 10)}</td>
                          <td className="p-3">{getCategoryBadge(item.category)}</td>
                          <td className="p-3 font-black text-slate-950">{item.boatOrTargetName}</td>
                          <td className="p-3 font-bold text-slate-700 truncate max-w-xs" title={item.locationOrDetail}>
                            {item.locationOrDetail}
                          </td>
                          <td className="p-3 font-mono text-slate-500 font-black">{item.inspectionDate}</td>
                          <td className="p-3 font-bold text-slate-950 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-slate-500" />
                            <span>{item.inspectorName}</span>
                          </td>
                          <td className="p-3">{getStatusIndicator(item.status)}</td>
                          <td className="p-3">
                            {item.photoUrl ? (
                              <div 
                                onClick={() => setSelectedPhoto(item.photoUrl || null)}
                                className="relative w-10 h-10 rounded-lg border border-slate-300 overflow-hidden cursor-pointer hover:border-slate-500 hover:scale-105 transition-all shadow-3xs"
                              >
                                <img 
                                  src={item.photoUrl} 
                                  alt="Attachment" 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : (
                              <span className="text-slate-600 font-mono">-</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-500 max-w-xs">
                            <div className="flex items-center gap-2">
                              <span className="truncate block flex-1" title={item.remarks}>{item.remarks || '-'}</span>
                              {item.category === 'license' && (
                                <button 
                                  onClick={() => setSelectedLicenseRecord(item.raw)}
                                  className="p-1 text-indigo-700 hover:bg-indigo-50 border border-indigo-800 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5"
                                >
                                  <Eye className="h-3 w-3" /> ใบอนุญาต
                                </button>
                              )}
                              {item.category === 'medical' && (
                                <button 
                                  onClick={() => setSelectedMedicalRecord(item.raw)}
                                  className="p-1 text-emerald-700 hover:bg-emerald-50 border border-emerald-800 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5"
                                >
                                  <Eye className="h-3 w-3" /> ดูเวชภัณฑ์
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 3.2 Flat List View of all records unified */
        <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xl bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white text-slate-500 font-extrabold border-b border-slate-300">
                <th className="p-4 font-mono w-20">รหัสบันทึก</th>
                <th className="p-4">หมวดตรวจ</th>
                <th className="p-4">เรือ / สถานที่</th>
                <th className="p-4">รายละเอียด</th>
                <th className="p-4">วันที่ตรวจสอบ</th>
                <th className="p-4">ผู้บันทึกรายงาน</th>
                <th className="p-4">ผลสรุป</th>
                <th className="p-4">รูปถ่ายแนบ</th>
                <th className="p-4">หมายเหตุและเจาะลึก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-100/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-indigo-700">{item.id.substring(0, 10)}</td>
                  <td className="p-4">{getCategoryBadge(item.category)}</td>
                  <td className="p-4 font-extrabold text-slate-950">{item.boatOrTargetName}</td>
                  <td className="p-4 text-slate-500 font-medium" title={item.locationOrDetail}>
                    {item.locationOrDetail}
                  </td>
                  <td className="p-4 font-mono text-slate-500 font-bold">{item.inspectionDate}</td>
                  <td className="p-4 font-medium text-slate-700 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-500" />
                    <span>{item.inspectorName}</span>
                  </td>
                  <td className="p-4">{getStatusIndicator(item.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {item.photoUrl ? (
                        <div 
                          onClick={() => setSelectedPhoto(item.photoUrl || null)}
                          className="relative w-10 h-10 rounded-lg border border-slate-300 overflow-hidden cursor-pointer hover:border-slate-500 hover:scale-105 transition-all shadow-3xs"
                          title="ดูรูปตรวจสอบ"
                        >
                          <img 
                            src={item.photoUrl} 
                            alt="Attachment" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono">-</span>
                      )}

                      {item.rectificationPhotoUrl && (
                        <div 
                          onClick={() => setSelectedPhoto(item.rectificationPhotoUrl || null)}
                          className="relative w-10 h-10 rounded-lg border border-emerald-700 overflow-hidden cursor-pointer hover:border-emerald-500 hover:scale-105 transition-all shadow-3xs"
                          title="ดูรูปการแก้ไข"
                        >
                          <img 
                            src={item.rectificationPhotoUrl} 
                            alt="Rectification" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-0 right-0 bg-emerald-600 text-white p-0.5 rounded-bl-md">
                            <CheckCircle className="h-2 w-2" />
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 max-w-xs">
                    <div className="flex items-center gap-2">
                      <span className="truncate block flex-1" title={item.remarks}>{item.remarks || '-'}</span>
                      {onAddRectificationPhoto && item.status === 'Fail' && !item.rectificationPhotoUrl && (
                        <label className="p-1 text-emerald-700 hover:bg-emerald-50 border border-emerald-800 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5 cursor-pointer">
                          <ImagePlus className="h-3 w-3" /> เพิ่มรูปแก้ไข
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="bg-white hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  onAddRectificationPhoto(item.id, item.category, reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
                      {item.category === 'license' && (
                        <button 
                          onClick={() => setSelectedLicenseRecord(item.raw)}
                          className="p-1 text-indigo-700 hover:bg-indigo-50 border border-indigo-800 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5"
                        >
                          <Eye className="h-3 w-3" /> ใบอนุญาต
                        </button>
                      )}
                      {item.category === 'medical' && (
                        <button 
                          onClick={() => setSelectedMedicalRecord(item.raw)}
                          className="p-1 text-emerald-700 hover:bg-emerald-50 border border-emerald-800 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5"
                        >
                          <Eye className="h-3 w-3" /> ดูเวชภัณฑ์
                        </button>
                      )}
                      {onDeleteRecord && (
                        <button 
                          onClick={() => onDeleteRecord(item.id, item.category as any)}
                          className="p-1 text-rose-500 hover:bg-rose-50/40 border border-rose-200/50 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5 cursor-pointer"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="h-3 w-3" /> ลบ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. MODALS FOR DRILL-DOWN DETAILS */}
      
      {/* 4.1 Simple Lightbox Zoom Portal */}
      {selectedPhoto && createPortal(
        <div 
          className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative bg-white p-2 rounded-2xl border-2 border-slate-900 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-white/90 text-slate-950 p-2 rounded-full cursor-pointer hover:bg-slate-100 border border-slate-300 transition-colors z-10 font-bold"
              title="Close"
            >
              ✕
            </button>
            <div className="flex-1 bg-white flex items-center justify-center overflow-hidden rounded-xl border border-slate-300">
              <img 
                src={selectedPhoto} 
                alt="Audit Zoom" 
                className="max-w-full max-h-[75vh] object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 4.2 License Detailed Card View Popover */}
      {selectedLicenseRecord && createPortal(
        <div 
          className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedLicenseRecord(null)}
        >
          <div 
            className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col font-sans text-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white text-slate-950 p-4 flex justify-between items-center border-b-2 border-slate-300">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-black text-sm text-slate-950">เจาะลึกใบอนุญาตเรือ & นายท้าย - {selectedLicenseRecord.boatName}</h3>
              </div>
              <button 
                onClick={() => setSelectedLicenseRecord(null)} 
                className="text-slate-500 hover:text-slate-950 font-black text-xs cursor-pointer"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-300">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-black block">วันที่บันทึกประวัติ</span>
                  <span className="font-black text-slate-950">{selectedLicenseRecord.inspectionDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-black block">นายเรือหรือผู้ตรวจสอบ</span>
                  <span className="font-black text-slate-950">{selectedLicenseRecord.inspectorName}</span>
                </div>
              </div>

              {/* Grid 3 licenses status */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-950 text-xs border-l-2 border-l-blue-600 pl-2">สถานะใบสำคัญประจำตัวเรือและคนประจำเรือ:</h4>
                
                {/* 1. Vessel */}
                <div className="p-3 bg-white border border-slate-300 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-950">1. ใบอนุญาตใช้เรือ</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      selectedLicenseRecord.vesselLicenseStatus === 'Normal' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                    }`}>
                      {selectedLicenseRecord.vesselLicenseStatus === 'Normal' ? 'ปกติ' : 'หมดอายุ/บกพร่อง'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-bold">เลขที่ใบอนุญาต: {selectedLicenseRecord.vesselLicenseNo || 'ไม่มีข้อมูล'}</p>
                  <p className="text-[11px] text-slate-600 font-bold">วันหมดอายุใบอนุญาต: {selectedLicenseRecord.vesselLicenseExpiry}</p>
                </div>

                {/* 2. Helmsman */}
                <div className="p-3 bg-white border border-slate-300 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-950">2. ใบประกาศนียบัตรนายท้าย</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      selectedLicenseRecord.helmsmanLicenseStatus === 'Normal' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                    }`}>
                      {selectedLicenseRecord.helmsmanLicenseStatus === 'Normal' ? 'ปกติ' : 'หมดอายุ/บกพร่อง'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-bold">ชื่อผู้ทำการในเรือ (กัปตัน): {selectedLicenseRecord.helmsmanName}</p>
                  <p className="text-[11px] text-slate-600 font-bold">เลขที่ใบนายท้าย: {selectedLicenseRecord.helmsmanLicenseNo}</p>
                  <p className="text-[11px] text-slate-600 font-bold">วันหมดอายุประกาศนียบัตร: {selectedLicenseRecord.helmsmanLicenseExpiry}</p>
                </div>

                {/* 3. Engineer */}
                <div className="p-3 bg-white border border-slate-300 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-950">3. ประกาศนียบัตรคนใช้เครื่องจักรอันทรงพลัง</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      selectedLicenseRecord.engineerLicenseStatus === 'Normal' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                    }`}>
                      {selectedLicenseRecord.engineerLicenseStatus === 'Normal' ? 'ปกติ' : 'หมดอายุ/บกพร่อง'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-bold">ชื่อผู้ทำการในเรือ (วิศวกร): {selectedLicenseRecord.engineerName}</p>
                  <p className="text-[11px] text-slate-600 font-bold">เลขที่ใบช่างเครื่อง: {selectedLicenseRecord.engineerLicenseNo}</p>
                  <p className="text-[11px] text-slate-600 font-bold">วันหมดอายุช่างเครื่อง: {selectedLicenseRecord.engineerLicenseExpiry}</p>
                </div>
              </div>

              {selectedLicenseRecord.remarks && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-slate-700 leading-relaxed text-[11px] font-bold">
                  <strong className="block text-amber-900">หมายเหตุผู้ตรวจทาน:</strong>
                  {selectedLicenseRecord.remarks}
                </div>
              )}
            </div>

            <div className="bg-white p-3 text-right border-t border-slate-300">
              <button 
                onClick={() => setSelectedLicenseRecord(null)}
                className="bg-indigo-600 text-white font-black text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-700"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 4.3 Medical Detailed Card View Popover */}
      {selectedMedicalRecord && createPortal(
        <div 
          className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedMedicalRecord(null)}
        >
          <div 
            className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col font-sans text-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white text-slate-950 p-4 flex justify-between items-center border-b-2 border-slate-300">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-emerald-600" />
                <h3 className="font-black text-sm text-slate-950">รายละเอียดผลตรวจตู้ยาปฐมพยาบาล - {selectedMedicalRecord.targetName}</h3>
              </div>
              <button 
                onClick={() => setSelectedMedicalRecord(null)} 
                className="text-slate-500 hover:text-slate-950 font-black text-xs cursor-pointer"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-300">
                <div>
                  <span className="text-slate-500 text-[10px] block font-black uppercase">ประเภทตู้ยาเวชภัณฑ์</span>
                  <span className="font-black text-slate-950 bg-white border border-slate-300 px-2 py-0.5 rounded inline-block mt-0.5">
                    {selectedMedicalRecord.stationType === 'boat' ? '🏥 ตู้ยาประจำบนเรือท่องเที่ยว' : '🏢 ตู้ยาประจำท่าเรือหลัก'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-black uppercase">ผู้เข้าตรวจสอบเวชภัณฑ์</span>
                  <span className="font-black text-slate-950">{selectedMedicalRecord.inspectorName}</span>
                </div>
              </div>

              {/* Items Table inside medicine kit */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-950">สรุปข้อมูลยาและอุปกรณ์เวชภัณฑ์:</h4>
                <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-white text-slate-700 font-black border-b border-slate-300">
                        <th className="p-2">ชื่อยา/เวชภัณฑ์</th>
                        <th className="p-2 text-center">สถานะสต็อก</th>
                        <th className="p-2">อายุเวชภัณฑ์</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[
                        { label: 'ยาพาราเซตามอล (Paracetamol)', status: selectedMedicalRecord.paracetamolStatus, expiry: selectedMedicalRecord.paracetamolExpiry },
                        { label: 'ยาแก้เมารถและยาแก้แพ้', status: selectedMedicalRecord.motionSicknessStatus, expiry: selectedMedicalRecord.motionSicknessExpiry },
                        { label: 'แอมโมเนียสูดดมสำลีชุบ', status: selectedMedicalRecord.ammoniaStatus, expiry: selectedMedicalRecord.ammoniaExpiry },
                        { label: 'ยาธาตุน้ำแดงขับลมบรรเทาปวดท้อง', status: selectedMedicalRecord.antacidStatus, expiry: selectedMedicalRecord.antacidExpiry },
                        { label: 'น้ำเบตาดีนรักษาแผลสด', status: selectedMedicalRecord.betadineStatus, expiry: selectedMedicalRecord.betadineExpiry },
                        { label: 'น้ำเกลือทำความสะอาดแผลพรีเมียม', status: selectedMedicalRecord.salineStatus, expiry: selectedMedicalRecord.salineExpiry },
                        { label: 'ผ้าก๊อซยืดพันแผลเนื้อนุ่ม', status: selectedMedicalRecord.gauzeStatus, expiry: selectedMedicalRecord.gauzeExpiry },
                        { label: 'พลาสเตอร์ปิดแผลกันน้ำอย่างดี', status: selectedMedicalRecord.bandagesStatus, expiry: selectedMedicalRecord.bandagesExpiry },
                        { label: 'ไมโครพอร์เทปยึดแผลสด', status: selectedMedicalRecord.surgicalTapeStatus, expiry: selectedMedicalRecord.surgicalTapeExpiry },
                        { label: 'สำลีก้อนกลมปลอดเชื้อ', status: selectedMedicalRecord.cottonBallsStatus, expiry: selectedMedicalRecord.cottonBallsExpiry },
                        { label: 'สภาพกล่องบรรจุตู้ยาแห้งสนิทและปิดมิดชิด', status: selectedMedicalRecord.containerStatus, expiry: '-' },
                      ].map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-950">{med.label}</td>
                          <td className="p-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-black ${
                              med.status === 'Normal' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : med.status === 'LowStock' 
                                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {med.status === 'Normal' ? 'พร้อมใช้งาน' : med.status === 'LowStock' ? 'เหลือน้อย' : med.status === 'Expired' ? 'หมดอายุ' : 'ขาดแคลน'}
                            </span>
                          </td>
                          <td className="p-2 font-mono text-slate-600 font-bold">{med.expiry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedMedicalRecord.remarks && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-slate-700 leading-relaxed text-[11px] font-bold">
                  <strong className="block text-amber-900 font-black">หมายเหตุผลการตรวจเพิ่มเติม:</strong>
                  {selectedMedicalRecord.remarks}
                </div>
              )}
            </div>

            <div className="bg-white p-3 text-right border-t border-slate-300">
              <button 
                onClick={() => setSelectedMedicalRecord(null)}
                className="bg-indigo-600 text-white font-black text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
