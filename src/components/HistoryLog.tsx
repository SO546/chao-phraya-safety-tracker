import React, { useState } from 'react';
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
  ChevronDown
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
}

export default function HistoryLog({ 
  extinguisherHistory = [], 
  lifeJacketHistory = [], 
  licenseHistory = [], 
  medicalHistory = [],
  onClearHistory,
  onDeleteRecord
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[10.5px] font-extrabold rounded-md">
            <Flame className="h-3 w-3" /> ถังดับเพลิง
          </span>
        );
      case 'lifejacket':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 text-[10.5px] font-extrabold rounded-md">
            <LifeBuoy className="h-3 w-3" /> เสื้อชูชีพ
          </span>
        );
      case 'license':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-750 border border-blue-200 text-[10.5px] font-extrabold rounded-md">
            <FileText className="h-3 w-3" /> ใบอนุญาตเรือ
          </span>
        );
      case 'medical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-extrabold rounded-md">
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
        <span className="inline-flex items-center gap-1.5 px-2 bg-green-50 text-green-700 border border-green-200 text-[11px] font-extrabold rounded-md py-0.5">
          <CheckCircle className="h-3 w-3" /> ผ่านเกณฑ์
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 bg-red-50 text-red-700 border border-red-200 text-[11px] font-extrabold rounded-md py-0.5 animate-pulse">
        <AlertCircle className="h-3 w-3" /> ไม่ผ่านเกณฑ์
      </span>
    );
  };

  const handleClearConfirm = () => {
    let confirmMsg = 'คุณต้องการที่จะล้างประวัติการตรวจสอบทั้งหมดออกจากระบบบราวเซอร์ หรือไม่?';
    if (categoryFilter !== 'all') {
      const catTh = categoryFilter === 'extinguisher' ? 'ถังดับเพลิง' : categoryFilter === 'lifejacket' ? 'เสื้อชูชีพ' : categoryFilter === 'license' ? 'ใบอนุญาตเรือ' : 'ตู้ยาเวชภัณฑ์';
      confirmMsg = `คุณต้องการที่จะล้างประวัติเฉพาะหมวดหมู่ [${catTh}] ออกจากบราวเซอร์ หรือไม่?`;
    }
    const isConfirmed = window.confirm(confirmMsg);
    if (isConfirmed) {
      onClearHistory(categoryFilter);
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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            <Calendar className="h-6 w-6 text-blue-600 animate-pulse" />
            ศูนย์ประวัติบันทึกความปลอดภัยแบบรวมศูนย์ (Integrated Safety Inspection Logs)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            เก็บบันทึกข้อมูลตรวจสอบและสถานะย้อนหลังอย่างเป็นทางการ สำหรับถังดับเพลิง เสื้อชูชีพ ใบรับรองเรือ และตู้ยา สำหรับเรือท่องเที่ยว 7 ลำ และท่าเทียบเรือ 11 ท่า
          </p>
        </div>

        {allUnifiedRecords.length > 0 && (
          <button
            onClick={handleClearConfirm}
            className="text-red-600 border-2 border-red-150 hover:bg-red-50 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all self-start md:self-center shrink-0"
            title="ล้างประวัติเครื่อง"
          >
            <Trash2 className="h-4 w-4" />
            <span>ล้างประวัติ ({categoryFilter === 'all' ? 'ทั้งหมด' : 'เฉพาะหมวด'})</span>
          </button>
        )}
      </div>

      {/* 1. Category Switch Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {[
          { id: 'all', label: '📁 ประวัติทั้งหมด', count: allUnifiedRecords.length, color: 'border-slate-800 bg-slate-900 text-white' },
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
                  ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Advanced Multi-Filter Options Panel */}
      <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-2xl text-xs space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 mr-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="font-extrabold text-slate-700">ตัวกรองระบบ:</span>
          </div>

          {/* Boat Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">เรือ/เป้าหมาย:</span>
            <select
              value={boatFilter}
              onChange={(e) => setBoatFilter(e.target.value)}
              className="bg-white text-slate-700 border border-slate-200 rounded-lg py-1.5 px-2.5 font-bold focus:outline-none focus:border-blue-500 cursor-pointer shadow-3xs"
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
            <span className="text-slate-500 font-bold">ผลตรวจ:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white text-slate-700 border border-slate-200 rounded-lg py-1.5 px-2.5 font-bold focus:outline-none focus:border-blue-500 cursor-pointer shadow-3xs"
            >
              <option value="all">ทุกสถานะ (All)</option>
              <option value="Pass">ผ่านเกณฑ์ (Pass)</option>
              <option value="Fail">ไม่ผ่านเกณฑ์ (Fail)</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">ปี พ.ศ.:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-white text-slate-700 border border-slate-200 rounded-lg py-1.5 px-2.5 font-bold focus:outline-none focus:border-blue-500 cursor-pointer shadow-3xs"
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
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-white text-slate-700 border border-slate-200 rounded-lg py-1.5 px-2.5 font-bold focus:outline-none focus:border-blue-500 cursor-pointer shadow-3xs"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/60 pt-3 text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>มุมมองการแสดงผล:</span>
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-3xs">
              <button
                onClick={() => setGroupedByMonthView(true)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  groupedByMonthView
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                จัดกลุ่มรายเดือน
              </button>
              <button
                onClick={() => setGroupedByMonthView(false)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  !groupedByMonthView
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                แสดงตารางเต็ม
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span>พบข้อมูลประวัติตามตัวกรอง:</span>
            <span className="font-extrabold font-mono text-slate-800 bg-white border border-slate-200 rounded px-2.5 py-0.5">
              {filteredHistory.length} รายการ
            </span>
          </div>
        </div>
      </div>

      {/* 3. History Logs Rendering */}
      {filteredHistory.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 rounded-2xl flex flex-col items-center justify-center space-y-3 border border-dashed border-slate-200">
          <Calendar className="h-10 w-10 text-slate-300" />
          <div className="text-sm font-bold text-slate-700">ไม่พบประวัติการตรวจสอบย่อยในเงื่อนไขปัจจุบัน</div>
          <div className="text-xs text-slate-400 max-w-sm px-6">
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
              <div key={ymKey} className="bg-slate-50/20 rounded-2xl border border-slate-200 p-4 space-y-4">
                
                {/* Month block banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-3xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-800">
                      {getMonthLabelThai(ymKey)}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
                    <span className="text-slate-500">
                      รวมตรวจสอบในงวดนี้: <span className="text-slate-900 font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">{records.length} รายการ</span>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-green-700 bg-green-50 border border-green-150 px-2 py-0.5 rounded-md">
                      ผ่าน: {passCount}
                    </span>
                    {failCount > 0 && (
                      <span className="text-red-700 bg-red-50 border border-red-150 px-2 py-0.5 rounded-md animate-pulse">
                        บกพร่อง: {failCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid layout for cards / small tables for responsiveness */}
                <div className="overflow-x-auto rounded-xl border border-slate-150 bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 font-extrabold border-b border-slate-150">
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
                    <tbody className="divide-y divide-slate-100">
                      {records.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-blue-600">{item.id.substring(0, 10)}</td>
                          <td className="p-3">{getCategoryBadge(item.category)}</td>
                          <td className="p-3 font-extrabold text-slate-800">{item.boatOrTargetName}</td>
                          <td className="p-3 font-medium text-slate-600 truncate max-w-xs" title={item.locationOrDetail}>
                            {item.locationOrDetail}
                          </td>
                          <td className="p-3 font-mono text-slate-500 font-bold">{item.inspectionDate}</td>
                          <td className="p-3 font-medium text-slate-700 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span>{item.inspectorName}</span>
                          </td>
                          <td className="p-3">{getStatusIndicator(item.status)}</td>
                          <td className="p-3">
                            {item.photoUrl ? (
                              <div 
                                onClick={() => setSelectedPhoto(item.photoUrl || null)}
                                className="relative w-10 h-10 rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 hover:scale-105 transition-all shadow-3xs"
                              >
                                <img 
                                  src={item.photoUrl} 
                                  alt="Attachment" 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono">-</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-500 max-w-xs">
                            <div className="flex items-center gap-2">
                              <span className="truncate block flex-1" title={item.remarks}>{item.remarks || '-'}</span>
                              {item.category === 'license' && (
                                <button 
                                  onClick={() => setSelectedLicenseRecord(item.raw)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5"
                                >
                                  <Eye className="h-3 w-3" /> ใบอนุญาต
                                </button>
                              )}
                              {item.category === 'medical' && (
                                <button 
                                  onClick={() => setSelectedMedicalRecord(item.raw)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5"
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
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-3xs bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-600">{item.id.substring(0, 10)}</td>
                  <td className="p-4">{getCategoryBadge(item.category)}</td>
                  <td className="p-4 font-extrabold text-slate-800">{item.boatOrTargetName}</td>
                  <td className="p-4 text-slate-650 font-medium" title={item.locationOrDetail}>
                    {item.locationOrDetail}
                  </td>
                  <td className="p-4 font-mono text-slate-550 font-bold">{item.inspectionDate}</td>
                  <td className="p-4 font-medium text-slate-700 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{item.inspectorName}</span>
                  </td>
                  <td className="p-4">{getStatusIndicator(item.status)}</td>
                  <td className="p-4">
                    {item.photoUrl ? (
                      <div 
                        onClick={() => setSelectedPhoto(item.photoUrl || null)}
                        className="relative w-10 h-10 rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 hover:scale-105 transition-all shadow-3xs"
                      >
                        <img 
                          src={item.photoUrl} 
                          alt="Attachment" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <span className="text-slate-400 font-mono">-</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 max-w-xs">
                    <div className="flex items-center gap-2">
                      <span className="truncate block flex-1" title={item.remarks}>{item.remarks || '-'}</span>
                      {item.category === 'license' && (
                        <button 
                          onClick={() => setSelectedLicenseRecord(item.raw)}
                          className="p-1 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5"
                        >
                          <Eye className="h-3 w-3" /> ใบอนุญาต
                        </button>
                      )}
                      {item.category === 'medical' && (
                        <button 
                          onClick={() => setSelectedMedicalRecord(item.raw)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5"
                        >
                          <Eye className="h-3 w-3" /> ดูเวชภัณฑ์
                        </button>
                      )}
                      {onDeleteRecord && (
                        <button 
                          onClick={() => onDeleteRecord(item.id, item.category as any)}
                          className="p-1 text-red-600 hover:bg-red-50 border border-red-200 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5 cursor-pointer"
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
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative bg-white p-2 rounded-2xl border border-slate-900 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-slate-900/80 text-white p-2 rounded-full cursor-pointer hover:bg-slate-950 transition-colors z-10 font-bold"
              title="Close"
            >
              ✕
            </button>
            <div className="flex-1 bg-slate-950 flex items-center justify-center overflow-hidden rounded-xl">
              <img 
                src={selectedPhoto} 
                alt="Audit Zoom" 
                className="max-w-full max-h-[75vh] object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4.2 License Detailed Card View Popover */}
      {selectedLicenseRecord && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedLicenseRecord(null)}
        >
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <h3 className="font-extrabold text-sm">เจาะลึกใบอนุญาตเรือ & นายท้าย - {selectedLicenseRecord.boatName}</h3>
              </div>
              <button 
                onClick={() => setSelectedLicenseRecord(null)} 
                className="text-slate-400 hover:text-white font-extrabold text-xs cursor-pointer"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">วันที่บันทึกประวัติ</span>
                  <span className="font-bold text-slate-800">{selectedLicenseRecord.inspectionDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">นายเรือหรือผู้ตรวจสอบ</span>
                  <span className="font-bold text-slate-800">{selectedLicenseRecord.inspectorName}</span>
                </div>
              </div>

              {/* Grid 3 licenses status */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs border-l-2 border-l-blue-600 pl-2">สถานะใบสำคัญประจำตัวเรือและคนประจำเรือ:</h4>
                
                {/* 1. Vessel */}
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">1. ใบอนุญาตใช้เรือ</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedLicenseRecord.vesselLicenseStatus === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'
                    }`}>
                      {selectedLicenseRecord.vesselLicenseStatus === 'Normal' ? 'ปกติ' : 'หมดอายุ/บกพร่อง'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">เลขที่ใบอนุญาต: {selectedLicenseRecord.vesselLicenseNo || 'ไม่มีข้อมูล'}</p>
                  <p className="text-[11px] text-slate-500">วันหมดอายุใบอนุญาต: {selectedLicenseRecord.vesselLicenseExpiry}</p>
                </div>

                {/* 2. Helmsman */}
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">2. ใบประกาศนียบัตรนายท้าย</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedLicenseRecord.helmsmanLicenseStatus === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'
                    }`}>
                      {selectedLicenseRecord.helmsmanLicenseStatus === 'Normal' ? 'ปกติ' : 'หมดอายุ/บกพร่อง'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">ชื่อผู้ทำการในเรือ (กัปตัน): {selectedLicenseRecord.helmsmanName}</p>
                  <p className="text-[11px] text-slate-500">เลขที่ใบนายท้าย: {selectedLicenseRecord.helmsmanLicenseNo}</p>
                  <p className="text-[11px] text-slate-500">วันหมดอายุประกาศนียบัตร: {selectedLicenseRecord.helmsmanLicenseExpiry}</p>
                </div>

                {/* 3. Engineer */}
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">3. ประกาศนียบัตรคนใช้เครื่องจักรอันทรงพลัง</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedLicenseRecord.engineerLicenseStatus === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'
                    }`}>
                      {selectedLicenseRecord.engineerLicenseStatus === 'Normal' ? 'ปกติ' : 'หมดอายุ/บกพร่อง'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">ชื่อผู้ทำการในเรือ (วิศวกร): {selectedLicenseRecord.engineerName}</p>
                  <p className="text-[11px] text-slate-500">เลขที่ใบช่างเครื่อง: {selectedLicenseRecord.engineerLicenseNo}</p>
                  <p className="text-[11px] text-slate-500">วันหมดอายุช่างเครื่อง: {selectedLicenseRecord.engineerLicenseExpiry}</p>
                </div>
              </div>

              {selectedLicenseRecord.remarks && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-slate-700 leading-relaxed text-[11px]">
                  <strong className="block text-slate-800">หมายเหตุผู้ตรวจทาน:</strong>
                  {selectedLicenseRecord.remarks}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-3 text-right border-t border-slate-100">
              <button 
                onClick={() => setSelectedLicenseRecord(null)}
                className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.3 Medical Detailed Card View Popover */}
      {selectedMedicalRecord && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedMedicalRecord(null)}
        >
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm">รายละเอียดผลตรวจตู้ยาปฐมพยาบาล - {selectedMedicalRecord.targetName}</h3>
              </div>
              <button 
                onClick={() => setSelectedMedicalRecord(null)} 
                className="text-slate-400 hover:text-white font-extrabold text-xs cursor-pointer"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block">ประเภทตู้ยาเวชภัณฑ์</span>
                  <span className="font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded inline-block mt-0.5">
                    {selectedMedicalRecord.stationType === 'boat' ? '🏥 ตู้ยาประจำบนเรือท่องเที่ยว' : '🏢 ตู้ยาประจำท่าเรือหลัก'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">ผู้เข้าตรวจสอบเวชภัณฑ์</span>
                  <span className="font-bold text-slate-800">{selectedMedicalRecord.inspectorName}</span>
                </div>
              </div>

              {/* Items Table inside medicine kit */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">สรุปข้อมูลยาและอุปกรณ์เวชภัณฑ์:</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <th className="p-2">ชื่อยา/เวชภัณฑ์</th>
                        <th className="p-2 text-center">สถานะสต็อก</th>
                        <th className="p-2">อายุเวชภัณฑ์</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
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
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 font-medium text-slate-700">{med.label}</td>
                          <td className="p-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                              med.status === 'Normal' 
                                ? 'bg-green-100 text-green-700' 
                                : med.status === 'LowStock' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {med.status === 'Normal' ? 'พร้อมใช้งาน' : med.status === 'LowStock' ? 'เหลือน้อย' : med.status === 'Expired' ? 'หมดอายุ' : 'ขาดแคลน'}
                            </span>
                          </td>
                          <td className="p-2 font-mono text-slate-500">{med.expiry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedMedicalRecord.remarks && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-slate-700 leading-relaxed text-[11px]">
                  <strong className="block text-slate-800 font-bold">หมายเหตุผลการตรวจเพิ่มเติม:</strong>
                  {selectedMedicalRecord.remarks}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-3 text-right border-t border-slate-100">
              <button 
                onClick={() => setSelectedMedicalRecord(null)}
                className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
