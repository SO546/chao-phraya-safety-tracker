import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Wrench, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X, 
  Calendar, 
  User, 
  Image as ImageIcon,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  Eye,
  Info,
  BarChart as BarChartIcon,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { MaintenanceRecord, MaintenanceStatus, Boat } from '../types';
import { BOATS } from '../lib/initialData';
import ImageUpload from './ImageUpload';

interface MaintenanceSectionProps {
  records: MaintenanceRecord[];
  onSaveRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  onDeleteRecord?: (id: string) => void;
  onUpdateMaintenanceStatus: (id: string, newStatus: MaintenanceStatus) => void;
  isSyncing?: boolean;
}

export default function MaintenanceSection({
  records,
  onSaveRecord,
  onDeleteRecord,
  onUpdateMaintenanceStatus,
  isSyncing = false,
}: MaintenanceSectionProps) {
  // Modal States
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedRecordForView, setSelectedRecordForView] = useState<MaintenanceRecord | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [activeDetailPhotoIdx, setActiveDetailPhotoIdx] = useState<number>(0);
  const [showDashboard, setShowDashboard] = useState(true);
  const [selectedDashboardMonth, setSelectedDashboardMonth] = useState('2026-06');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'bar' | 'line'>('bar');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBoat, setFilterBoat] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form Fields State
  const [dateReported, setDateReported] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [timeReported, setTimeReported] = useState(() => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  });
  const [boatId, setBoatId] = useState('boat-1');
  const [type, setType] = useState('ตรวจสอบเรือ');
  const [partRepaired, setPartRepaired] = useState('เครื่องปรับอากาศ');
  const [details, setDetails] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('อู่เรือ');
  const [status, setStatus] = useState<MaintenanceStatus>('ดำเนินการแล้ว');

  // Photo uploading temp state
  const [tempPhoto, setTempPhoto] = useState<string | undefined>(undefined);

  // Filtered Records
  const filteredRecords = records.filter((r) => {
    const matchSearch = 
      r.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.actionTaken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.responsiblePerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.partRepaired && r.partRepaired.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchBoat = filterBoat === 'all' || r.boatId === filterBoat;
    const matchType = filterType === 'all' || r.type === filterType;
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;

    return matchSearch && matchBoat && matchType && matchStatus;
  });

  // --- Dynamic Dashboard Aggregations ---
  const monthlyStats = React.useMemo(() => {
    const thaiMonths: { [key: string]: string } = {
      '01': 'ม.ค.', '02': 'ก.พ.', '03': 'มี.ค.', '04': 'เม.ย.',
      '05': 'พ.ค.', '06': 'มิ.ย.', '07': 'ก.ค.', '08': 'ส.ค.',
      '09': 'ก.ย.', '10': 'ต.ค.', '11': 'พ.ย.', '12': 'ธ.ค.'
    };

    const stats: {
      [monthKey: string]: {
        monthName: string;
        year: string;
        totalRepairs: number;
        partsBreakdown: { [part: string]: number };
      }
    } = {};

    records.forEach((rec) => {
      if (!rec.dateReported) return;
      const parts = rec.dateReported.split('-');
      if (parts.length < 2) return;
      const year = parts[0];
      const monthNum = parts[1];
      const monthKey = `${year}-${monthNum}`; // e.g. "2026-05"
      const thaiMonth = thaiMonths[monthNum] || monthNum;
      
      const part = rec.partRepaired || 'ทั่วไป (ตรวจเช็ค)';

      if (!stats[monthKey]) {
        stats[monthKey] = {
          monthName: thaiMonth,
          year: (parseInt(year) + 543).toString().substring(2), // e.g. "69"
          totalRepairs: 0,
          partsBreakdown: {}
        };
      }

      stats[monthKey].totalRepairs += 1;
      stats[monthKey].partsBreakdown[part] = (stats[monthKey].partsBreakdown[part] || 0) + 1;
    });

    // Sort monthKeys chronologically
    return Object.keys(stats)
      .sort()
      .map((key) => ({
        key,
        ...stats[key]
      }));
  }, [records]);

  const dailyTrendData = React.useMemo(() => {
    if (!selectedDashboardMonth) return [];
    const parts = selectedDashboardMonth.split('-');
    if (parts.length < 2) return [];
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateString = `${selectedDashboardMonth}-${String(day).padStart(2, '0')}`;
      const dayRecords = records.filter(r => r.dateReported === dateString);
      const inspections = dayRecords.filter(r => r.type === 'ตรวจสอบเรือ').length;
      const repairs = dayRecords.filter(r => r.type === 'ส่งซ่อม').length;
      return { 
        name: day.toString(),
        inspections,
        repairs,
        total: inspections + repairs,
        fullDate: dateString,
        dayNum: day
      };
    });
  }, [records, selectedDashboardMonth]);

  const partAggregates = React.useMemo(() => {
    const aggregates: { [part: string]: number } = {};
    records.forEach((rec) => {
      const part = rec.partRepaired || 'ทั่วไป (ตรวจเช็ค)';
      aggregates[part] = (aggregates[part] || 0) + 1;
    });
    return Object.keys(aggregates)
      .map((name) => ({ name, count: aggregates[name] }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  // Insights computation
  const totalLifetimeRepairs = records.length;
  
  const topFailurePart = React.useMemo(() => {
    if (partAggregates.length === 0) return { name: '-', count: 0 };
    return partAggregates[0];
  }, [partAggregates]);

  const peakMonth = React.useMemo(() => {
    if (monthlyStats.length === 0) return { name: '-', count: 0 };
    let maxMonth = monthlyStats[0];
    monthlyStats.forEach((m) => {
      if (m.totalRepairs > maxMonth.totalRepairs) {
        maxMonth = m;
      }
    });
    return {
      name: `${maxMonth.monthName} ${maxMonth.year}`,
      count: maxMonth.totalRepairs
    };
  }, [monthlyStats]);

  // Auto-set the latest month as default on load
  React.useEffect(() => {
    if (monthlyStats && monthlyStats.length > 0) {
      const exists = monthlyStats.some(m => m.key === selectedDashboardMonth);
      if (!exists) {
        setSelectedDashboardMonth(monthlyStats[monthlyStats.length - 1].key);
      }
    }
  }, [monthlyStats]);

  // Calendar calculations for selected month
  const calendarDays = React.useMemo(() => {
    if (!selectedDashboardMonth) return [];
    const parts = selectedDashboardMonth.split('-');
    if (parts.length < 2) return [];
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]); // 1-indexed

    // Number of days in this month
    const totalDays = new Date(year, month, 0).getDate();
    // First day of week index (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

    const daysList = [];

    // Empty slots before day 1
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysList.push({
        isEmpty: true,
        dayNum: 0,
        dateString: '',
        records: []
      });
    }

    // Days 1 to totalDays
    for (let day = 1; day <= totalDays; day++) {
      const dayStr = String(day).padStart(2, '0');
      const monthStr = String(month).padStart(2, '0');
      const dateString = `${year}-${monthStr}-${dayStr}`;

      // Find all records on this specific day
      const dayRecords = records.filter(r => r.dateReported === dateString);

      daysList.push({
        isEmpty: false,
        dayNum: day,
        dateString,
        records: dayRecords
      });
    }

    return daysList;
  }, [selectedDashboardMonth, records]);

  // Find records for the currently selected day (if any)
  const selectedDayRecords = React.useMemo(() => {
    if (selectedCalendarDay === null) return [];
    const parts = selectedDashboardMonth.split('-');
    if (parts.length < 2) return [];
    const year = parts[0];
    const month = parts[1];
    const dayStr = String(selectedCalendarDay).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    return records.filter(r => r.dateReported === dateString);
  }, [selectedCalendarDay, selectedDashboardMonth, records]);

  const handleAddPhoto = () => {
    if (tempPhoto) {
      setSelectedPhotos([...selectedPhotos, tempPhoto]);
      setTempPhoto(undefined); // reset
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedBoat = BOATS.find((b) => b.id === boatId);
    if (!selectedBoat) return;

    onSaveRecord({
      dateReported,
      timeReported,
      boatId,
      boatName: selectedBoat.name,
      type,
      details: details || '-',
      actionTaken: actionTaken || '-',
      responsiblePerson: responsiblePerson || 'อู่เรือ',
      status,
      photos: selectedPhotos,
      partRepaired,
    });

    // Reset Form
    setIsOpenForm(false);
    setSelectedPhotos([]);
    setDetails('');
    setActionTaken('');
    setResponsiblePerson('อู่เรือ');
    setStatus('ดำเนินการแล้ว');
    setPartRepaired('เครื่องปรับอากาศ');
  };

  const getStatusBadge = (st: MaintenanceStatus, recordId: string) => {
    const cycleStatus = (currentStatus: MaintenanceStatus): MaintenanceStatus => {
      const statuses: MaintenanceStatus[] = ['ดำเนินการแล้ว', 'กำลังดำเนินการ', 'รอคิว', 'ยกเลิก'];
      const currentIndex = statuses.indexOf(currentStatus);
      return statuses[(currentIndex + 1) % statuses.length];
    };

    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-xs cursor-pointer hover:opacity-80 transition-opacity";

    switch (st) {
      case 'ดำเนินการแล้ว':
        return (
          <button onClick={() => onUpdateMaintenanceStatus(recordId, cycleStatus(st))} className={`${baseClasses} bg-green-600 text-white`}>
            <CheckCircle className="h-3 w-3" />
            ดำเนินการแล้ว
          </button>
        );
      case 'กำลังดำเนินการ':
        return (
          <button onClick={() => onUpdateMaintenanceStatus(recordId, cycleStatus(st))} className={`${baseClasses} bg-blue-600 text-white animate-pulse`}>
            <Clock className="h-3 w-3" />
            กำลังดำเนินการ
          </button>
        );
      case 'รอคิว':
        return (
          <button onClick={() => onUpdateMaintenanceStatus(recordId, cycleStatus(st))} className={`${baseClasses} bg-amber-500 text-white`}>
            <AlertCircle className="h-3 w-3" />
            รอคิว
          </button>
        );
      case 'ยกเลิก':
        return (
          <button onClick={() => onUpdateMaintenanceStatus(recordId, cycleStatus(st))} className={`${baseClasses} bg-slate-500 text-white`}>
            <X className="h-3 w-3" />
            ยกเลิก
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title card */}
      <div className="bg-gradient-to-r from-amber-650 to-amber-700 p-6 rounded-sm text-white shadow-md border-b-2 border-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded border border-white/25">
            <Wrench className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">🔧 ระบบบันทึกประวัติการซ่อมบำรุงเรือท่องเที่ยว</h2>
            <p className="text-xs text-amber-100 font-medium tracking-wide mt-0.5 uppercase">
              Chao Phraya Boat Maintenance & Repair Log Registry
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpenForm(true)}
            className="px-4 py-2.5 bg-slate-950 text-white font-extrabold text-xs tracking-wider uppercase rounded-sm border border-slate-900 shadow hover:bg-slate-900 cursor-pointer transition-all flex items-center gap-2 select-none shrink-0"
          >
            <Plus className="h-4 w-4" />
            บันทึกการซ่อมบำรุงใหม่
          </button>
        </div>
      </div>

      {/* DASHBOARD SUMMARY PANEL CARD */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowDashboard(!showDashboard)}
          className="w-full bg-slate-50 hover:bg-slate-100/80 p-4.5 border-b border-slate-200 flex items-center justify-between transition-colors select-none text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-500/10 text-amber-700 rounded-sm">
              <Wrench className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">📊 แดชบอร์ดสรุปสถิติการแจ้งซ่อมอุปกรณ์แยกตามเดือน</h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5 tracking-wider">
                Equipment Repairs Statistics & Analytics Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {showDashboard ? '🙈 ซ่อนแดชบอร์ด (Hide)' : '👀 แสดงแดชบอร์ด (Show)'}
            </span>
          </div>
        </button>

        {showDashboard && (
          <>
            {/* Top Row: Overall Aggregations / Charts */}
            <div className="p-6 bg-slate-50/50 border-b border-slate-200 divide-y divide-slate-200 lg:divide-y-0 lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
              
              {/* Column 1: Daily Grid Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                    📅 เลือกวันเจาะลึกการซ่อม
                  </span>
                  <div className="flex bg-slate-100 p-0.5 rounded-sm">
                    <span className="text-[10px] font-bold px-2 py-0.5 text-slate-600">
                      {monthlyStats.find(m => m.key === selectedDashboardMonth)?.monthName} {monthlyStats.find(m => m.key === selectedDashboardMonth)?.year}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-sm border border-slate-200 shadow-3xs space-y-4 h-[500px] flex flex-col">
                   <div className="grid grid-cols-7 gap-1">
                      {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((d, i) => (
                        <div key={i} className={`text-[8px] font-bold text-center uppercase py-0.5 rounded-2xs ${i === 0 ? 'bg-red-50 text-red-500' : i === 6 ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'}`}>{d}</div>
                      ))}
                      {calendarDays.map((day, idx) => {
                        if (day.isEmpty) return <div key={idx} className="aspect-square bg-slate-50/20 rounded-xs"></div>;
                        const hasRepairs = day.records.length > 0;
                        const isSelected = selectedCalendarDay === day.dayNum;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => hasRepairs && setSelectedCalendarDay(isSelected ? null : day.dayNum)}
                            className={`aspect-square rounded-xs flex items-center justify-center text-[10px] font-bold transition-all border ${
                              hasRepairs 
                                ? isSelected ? 'bg-amber-600 border-amber-800 text-white shadow-sm' : 'bg-amber-50 border-amber-200 text-amber-900 cursor-pointer hover:bg-amber-100'
                                : 'bg-white border-slate-100 text-slate-300'
                            }`}
                          >
                            {day.dayNum}
                          </button>
                        );
                      })}
                   </div>

                   {/* Day Details (Inside the column) */}
                   <div className="border-t border-slate-100 pt-3 flex-1 flex flex-col min-h-0">
                      <div className="flex items-center justify-between mb-2 shrink-0">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-tighter">รายละเอียดประจำวัน</span>
                        {selectedCalendarDay && (
                          <button type="button" onClick={() => setSelectedCalendarDay(null)} className="text-[8px] font-bold text-red-600 hover:underline">ล้าง</button>
                        )}
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1 min-h-0">
                         {selectedCalendarDay ? (
                           selectedDayRecords.length > 0 ? (
                             selectedDayRecords.map((r, ri) => (
                               <div 
                                 key={ri} 
                                 onClick={() => setSelectedRecordForView(r)}
                                 className="p-2 bg-slate-50 hover:bg-white rounded-xs border border-slate-200 hover:border-amber-400 text-[10px] cursor-pointer transition-all group"
                               >
                                  <div className="font-bold text-slate-900 flex items-center justify-between">
                                    <span className="truncate">🚢 {r.boatName}</span>
                                    <span className="text-[8px] text-slate-400 group-hover:text-amber-600"><Eye className="h-2.5 w-2.5" /></span>
                                  </div>
                                  <div className="text-slate-600 line-clamp-1">{r.details}</div>
                               </div>
                             ))
                           ) : <div className="text-[9px] text-center text-slate-400 py-4 italic">ไม่มีงานซ่อมในวันที่เลือก</div>
                         ) : (
                           <div className="text-[9px] text-center text-slate-400 py-6 italic leading-relaxed">
                             คลิกเลือกวันที่ <span className="text-amber-600 font-bold">สีส้ม</span> ด้านบน<br/>เพื่อดูรายละเอียดงานซ่อมรายวัน
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              </div>

              {/* Column 2: Equipment Breakdown */}
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                  ⚙️ สถิติการซ่อมแยกตามชิ้นส่วน/อุปกรณ์
                </span>
                <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-3xs h-[500px] overflow-y-auto space-y-2.5 custom-scrollbar">
                  {partAggregates.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] text-slate-400 font-bold">
                      ไม่มีข้อมูลประเภทชิ้นส่วนที่เสีย
                    </div>
                  ) : (
                    partAggregates.map((item, idx) => {
                      const total = records.length || 1;
                      const pct = (item.count / total) * 100;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-[10.5px] font-bold">
                            <span className="text-slate-800 truncate pr-2" title={item.name}>🛠️ {item.name}</span>
                            <span className="text-slate-600 font-mono text-[10px] bg-slate-100 border border-slate-200 px-1.5 rounded shrink-0">
                              {item.count} ครั้ง ({Math.round(pct)}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${pct}%` }} 
                              className={`h-full rounded-full transition-all duration-500 ${
                                idx === 0 
                                  ? 'bg-amber-600' 
                                  : idx === 1
                                  ? 'bg-blue-650'
                                  : idx === 2
                                  ? 'bg-emerald-600'
                                  : 'bg-slate-500'
                              }`}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Column 3: Quick Key Metrics Insights */}
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                  💡 ข้อมูลสรุปเชิงลึกประจำหมวดเรือ (Quick Insights)
                </span>
                <div className="grid grid-cols-1 gap-3 h-[500px]">
                  {/* KPI 1 */}
                  <div className="bg-white p-3 rounded-sm border border-slate-200 flex items-center gap-3.5 shadow-3xs">
                    <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded border border-amber-500/15">
                      <Wrench className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">ประวัติซ่อมสะสมทั้งหมด</span>
                      <span className="text-base font-black text-slate-900 font-mono tracking-tight">
                        {totalLifetimeRepairs} รายการ
                      </span>
                    </div>
                  </div>
                  {/* KPI 2 */}
                  <div className="bg-white p-3 rounded-sm border border-slate-200 flex items-center gap-3.5 shadow-3xs">
                    <div className="p-2.5 bg-red-500/10 text-red-700 rounded border border-red-500/15">
                      <AlertTriangle className="h-4.5 w-4.5" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">อุปกรณ์ที่ส่งซ่อมบ่อยที่สุด</span>
                      <span className="text-xs font-extrabold text-slate-900 block truncate" title={topFailurePart.name}>
                        {topFailurePart.name} ({topFailurePart.count} ครั้ง)
                      </span>
                    </div>
                  </div>
                  {/* KPI 3 */}
                  <div className="bg-white p-3 rounded-sm border border-slate-200 flex items-center gap-3.5 shadow-3xs">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-700 rounded border border-emerald-500/15">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">ช่วงเดือนที่ซ่อมบำรุงสูงสุด</span>
                      <span className="text-xs font-extrabold text-slate-900 block">
                        {peakMonth.name} ({peakMonth.count} รายการ)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row: Daily Trend Chart Drilldown */}
            <div className="border-t border-slate-200 bg-white p-6 mt-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-amber-500/15 text-amber-700 rounded border border-amber-500/10">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                      📈 สถิติแนวโน้มการซ่อมบำรุงรายวัน
                      <span className="text-[10px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded-full font-mono">
                        DAILY TREND
                      </span>
                    </h4>
                    <p className="text-[10.5px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                      Equipment Repairs Daily Trend Statistics & Visualization
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Chart Tabs */}
                  <div className="flex bg-slate-200 p-0.5 rounded-sm">
                    <button
                      onClick={() => setActiveChartTab('bar')}
                      className={`px-3 py-1 text-[10px] font-bold rounded-xs transition-all flex items-center gap-1.5 ${
                        activeChartTab === 'bar' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <BarChartIcon className="h-3 w-3" />
                      กราฟแท่ง
                    </button>
                    <button
                      onClick={() => setActiveChartTab('line')}
                      className={`px-3 py-1 text-[10px] font-bold rounded-xs transition-all flex items-center gap-1.5 ${
                        activeChartTab === 'line' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      กราฟเส้น
                    </button>
                  </div>

                  {/* Month Tabs */}
                  <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-0.5 rounded-sm border border-slate-200">
                    {monthlyStats.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setSelectedDashboardMonth(item.key);
                          setSelectedCalendarDay(null);
                        }}
                        className={`px-2.5 py-1 text-[10px] font-extrabold rounded-xs cursor-pointer transition-all ${
                          selectedDashboardMonth === item.key
                            ? 'bg-slate-950 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {item.monthName} {item.year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart Stage */}
              <div className="bg-slate-50/30 p-4 rounded-sm border border-slate-200 shadow-3xs h-[380px] relative">
                {dailyTrendData.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <Clock className="h-10 w-10 opacity-20" />
                    <span className="text-xs font-bold uppercase tracking-widest">ไม่มีข้อมูลประวัติซ่อมบำรุงในเดือนนี้</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {activeChartTab === 'bar' ? (
                        <BarChart 
                        data={dailyTrendData} 
                        margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                        onClick={(data: any) => {
                          if (data && data.activePayload) {
                            setSelectedCalendarDay(data.activePayload[0].payload.dayNum);
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                          label={{ value: 'วันที่ (Day)', position: 'insideBottom', offset: -5, fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(217, 119, 6, 0.05)' }}
                          contentStyle={{ fontSize: '11px', borderRadius: '6px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          labelFormatter={(label) => `วันที่ ${label}`}
                        />
                        <Legend />
                        <Bar 
                          dataKey="inspections" 
                          stackId="a"
                          fill="#10b981" 
                          radius={[0, 0, 0, 0]}
                          name="การตรวจสอบ"
                        />
                        <Bar 
                          dataKey="repairs" 
                          stackId="a"
                          fill="#d97706" 
                          radius={[4, 4, 0, 0]}
                          name="การซ่อม"
                        />
                      </BarChart>
                    ) : (
                      <LineChart 
                        data={dailyTrendData} 
                        margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                        onClick={(data: any) => {
                          if (data && data.activePayload) {
                            setSelectedCalendarDay(data.activePayload[0].payload.dayNum);
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          contentStyle={{ fontSize: '11px', borderRadius: '6px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          labelFormatter={(label) => `วันที่ ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="inspections" 
                          stroke="#10b981" 
                          strokeWidth={4} 
                          dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                          name="การตรวจสอบ"
                          className="cursor-pointer"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="repairs" 
                          stroke="#d97706" 
                          strokeWidth={4} 
                          dot={{ r: 5, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                          name="การซ่อม"
                          className="cursor-pointer"
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
              
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    <span>เลือกเจาะลึกวันในปฏิทินด้านบน</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                    <span>วันทั่วไปที่มีการแจ้งซ่อม</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-400">
                  MONTHLY SNAPSHOT: {records.filter(r => r.dateReported && r.dateReported.startsWith(selectedDashboardMonth)).length} TOTAL REPAIRS
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Advanced Filter Bar Card */}
      <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Filter className="h-4 w-4 text-amber-600" />
            ตัวกรองข้อมูลประวัติการซ่อมทำ (Filters)
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            พบ {filteredRecords.length} รายการ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหา (รายละเอียด, ผู้ดำเนินการ, ...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs font-medium focus:bg-white focus:outline-hidden focus:border-amber-600 transition-colors"
            />
          </div>

          {/* Filter by Boat */}
          <select
            value={filterBoat}
            onChange={(e) => setFilterBoat(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs font-medium focus:bg-white focus:outline-hidden focus:border-amber-600 transition-colors"
          >
            <option value="all">🚢 เลือกเรือทั้งหมด (All Boats)</option>
            {BOATS.map((boat) => (
              <option key={boat.id} value={boat.id}>
                เรือ {boat.name}
              </option>
            ))}
          </select>

          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs font-medium focus:bg-white focus:outline-hidden focus:border-amber-600 transition-colors"
          >
            <option value="all">🔧 เลือกประเภททั้งหมด (All Types)</option>
            <option value="ตรวจสอบเรือ">ตรวจสอบเรือ (Inspection)</option>
            <option value="ส่งซ่อม">ส่งซ่อม (Repair)</option>
            <option value="อื่นๆ">อื่นๆ (Others)</option>
          </select>

          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs font-medium focus:bg-white focus:outline-hidden focus:border-amber-600 transition-colors"
          >
            <option value="all">📌 เลือกสถานะทั้งหมด (All Status)</option>
            <option value="ดำเนินการแล้ว">ดำเนินการแล้ว (Completed)</option>
            <option value="กำลังดำเนินการ">กำลังดำเนินการ (In Progress)</option>
            <option value="รอคิว">รอคิว (Queued)</option>
            <option value="ยกเลิก">ยกเลิก (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Main List Table */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] uppercase font-mono tracking-wider font-extrabold select-none">
                <th className="py-3 px-4 border-b border-slate-800 w-[110px]">วันที่ / เวลาแจ้ง</th>
                <th className="py-3 px-4 border-b border-slate-800 w-[90px]">ชื่อเรือ</th>
                <th className="py-3 px-4 border-b border-slate-800 w-[110px]">ประเภทการซ่อม</th>
                <th className="py-3 px-4 border-b border-slate-800 w-[130px]">ชิ้นส่วน / อุปกรณ์</th>
                <th className="py-3 px-4 border-b border-slate-800">รายละเอียด/สิ่งที่พบ</th>
                <th className="py-3 px-4 border-b border-slate-800">ผลการดำเนินการ</th>
                <th className="py-3 px-4 border-b border-slate-800 w-[120px]">ผู้รับผิดชอบ</th>
                <th className="py-3 px-4 border-b border-slate-800 w-[120px] text-center">สถานะ</th>
                <th className="py-3 px-4 border-b border-slate-800 w-[180px]">รูปภาพประกอบ</th>
                <th className="py-3 px-4 border-b border-slate-800 w-[140px] text-center">เครื่องมือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Wrench className="h-10 w-10 text-slate-300" />
                      <p>ไม่พบรายการซ่อมทำตามตัวกรองปัจจุบัน</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 px-4">
                      <div className="font-bold flex items-center gap-1.5 text-slate-900">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {r.dateReported}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 font-mono mt-1">
                        ⌚ {r.timeReported} น.
                      </div>
                    </td>
                    <td className="py-4.5 px-4">
                      <span className="px-2 py-0.5 text-[11px] font-extrabold bg-slate-100 border border-slate-200 text-slate-800 rounded-sm">
                        {r.boatName}
                      </span>
                    </td>
                    <td className="py-4.5 px-4">
                      <span className={`px-2 py-0.5 text-[10px] rounded-sm font-extrabold tracking-wide ${
                        r.type === 'ตรวจสอบเรือ' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : r.type === 'ส่งซ่อม'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="py-4.5 px-4">
                      <span className="px-2.5 py-1 text-[10.5px] rounded-sm font-bold bg-slate-900 text-amber-400 border border-slate-950 block text-center truncate max-w-[130px]" title={r.partRepaired || 'ทั่วไป (ตรวจเช็ค)'}>
                        ⚙️ {r.partRepaired || 'ทั่วไป (ตรวจเช็ค)'}
                      </span>
                    </td>
                    <td className="py-4.5 px-4 font-semibold text-slate-900 max-w-[200px] break-words whitespace-pre-line leading-relaxed">
                      {r.details || '-'}
                    </td>
                    <td className="py-4.5 px-4 font-normal text-slate-700 max-w-[260px] break-words whitespace-pre-line leading-relaxed line-clamp-3">
                      {r.actionTaken || '-'}
                    </td>
                    <td className="py-4.5 px-4 font-semibold text-slate-600">
                      🏢 {r.responsiblePerson}
                    </td>
                    <td className="py-4.5 px-4 text-center">
                      {getStatusBadge(r.status, r.id)}
                    </td>
                    <td className="py-4.5 px-4">
                      {r.photos && r.photos.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          {/* Main large thumbnail */}
                          <div className="relative w-16 h-12 rounded border border-slate-300 shadow-xs overflow-hidden shrink-0 group hover:scale-105 hover:border-amber-500 transition-all cursor-pointer"
                               onClick={() => {
                                 setActiveDetailPhotoIdx(0);
                                 setSelectedRecordForView(r);
                               }}>
                            <img
                              src={r.photos[0]}
                              alt="Maintenance thumbnail"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {r.photos.length > 1 && (
                              <div className="absolute right-0.5 bottom-0.5 bg-slate-950/75 text-white font-mono text-[9px] px-1 rounded-xs font-bold">
                                +{r.photos.length - 1}
                              </div>
                            )}
                          </div>
                          
                          {/* Mini side grids for extra photos */}
                          {r.photos.length > 1 && (
                            <div className="hidden sm:flex flex-col gap-0.5">
                              {r.photos.slice(1, 3).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt="extra thumbnail"
                                  className="w-6 h-5 object-cover rounded border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono italic">ไม่มีรูปภาพ</span>
                      )}
                    </td>
                    <td className="py-4.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setActiveDetailPhotoIdx(0);
                            setSelectedRecordForView(r);
                          }}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-500 hover:text-white border border-amber-200 text-amber-700 text-[10px] font-bold rounded-sm flex items-center gap-1 cursor-pointer transition-all shadow-2xs select-none"
                          title="เปิดดูข้อมูลแบบละเอียด"
                        >
                          <Eye className="h-3 w-3" />
                          เปิดดู
                        </button>
                        
                        {onDeleteRecord && (
                          <button
                            onClick={() => {
                              if (confirm('คุณต้องการลบบันทึกประวัตินี้อย่างถาวรหรือไม่?')) {
                                onDeleteRecord(r.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-sm transition-colors cursor-pointer"
                            title="ลบบันทึก"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED MAINTENANCE VIEW MODAL */}
      {selectedRecordForView && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-sm border-2 border-slate-950 w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-scale-up">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-4.5 border-b border-slate-950 flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <Wrench className="h-5 w-5 text-amber-500" />
                <span className="font-extrabold text-sm uppercase tracking-wider">
                  🔍 รายละเอียดประวัติการซ่อมบำรุง ({selectedRecordForView.id})
                </span>
              </div>
              <button
                onClick={() => setSelectedRecordForView(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-sm hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-slate-800">
              
              {/* Main 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Left Column: Data Fields */}
                <div className="space-y-4">
                  
                  {/* Status & Boat */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-150">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ชื่อเรือด่วน</span>
                      <span className="text-sm font-extrabold text-slate-900">🚢 เรือ {selectedRecordForView.boatName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">สถานะซ่อมทำ</span>
                      {getStatusBadge(selectedRecordForView.status, selectedRecordForView.id)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">📅 วันที่แจ้งซ่อม</span>
                      <span className="text-xs font-bold text-slate-800">{selectedRecordForView.dateReported}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">⌚ เวลาแจ้งซ่อม</span>
                      <span className="text-xs font-bold text-slate-800">{selectedRecordForView.timeReported} น.</span>
                    </div>
                  </div>

                   <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">🔧 ประเภทการซ่อมบำรุง</span>
                      <span className="inline-block mt-1 px-3 py-0.5 text-xs font-bold bg-amber-550 text-white rounded-sm">
                        {selectedRecordForView.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">⚙️ ชิ้นส่วน / อุปกรณ์ที่ซ่อม</span>
                      <span className="inline-block mt-1 px-3 py-0.5 text-xs font-bold bg-slate-900 text-amber-400 rounded-sm">
                        {selectedRecordForView.partRepaired || 'ทั่วไป (ตรวจเช็ค)'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">👤 ผู้รับผิดชอบดูแล / ช่างผู้ซ่อม</span>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm mt-1 inline-block">
                      🏢 {selectedRecordForView.responsiblePerson}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-amber-650 uppercase tracking-wider block mb-1">📝 อาการชำรุดที่พบ / ปัญหาที่แจ้ง</span>
                    <p className="text-xs text-slate-700 font-semibold bg-red-50/40 p-3 rounded border border-red-100 whitespace-pre-line leading-relaxed">
                      {selectedRecordForView.details || '-'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-green-650 uppercase tracking-wider block mb-1">🛠️ ผลการซ่อมบำรุง / ความคืบหน้าการทำงาน</span>
                    <p className="text-xs text-slate-800 font-bold bg-green-50/40 p-3 rounded border border-green-150 whitespace-pre-line leading-relaxed">
                      {selectedRecordForView.actionTaken || '-'}
                    </p>
                  </div>

                </div>

                {/* Right Column: Visual Photos Gallery */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    📸 รูปภาพแนบการปฏิบัติงาน ({selectedRecordForView.photos?.length || 0} รูป)
                  </span>

                  {selectedRecordForView.photos && selectedRecordForView.photos.length > 0 ? (
                    <div className="space-y-3">
                      {/* Interactive Album Stage */}
                      <div className="relative aspect-video rounded-sm border border-slate-300 overflow-hidden bg-slate-900 group shadow-sm">
                        <img
                          src={selectedRecordForView.photos[activeDetailPhotoIdx]}
                          alt="Selected log photograph"
                          className="w-full h-full object-contain mx-auto"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setActivePhoto(selectedRecordForView.photos[activeDetailPhotoIdx])}
                          className="absolute right-2 bottom-2 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 text-white font-mono text-[9px] font-bold px-2 py-1 rounded-sm select-none cursor-pointer"
                        >
                          🔍 ขยายเต็มจอ
                        </button>
                      </div>

                      {/* Thumbnail Selectors Grid */}
                      {selectedRecordForView.photos.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {selectedRecordForView.photos.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveDetailPhotoIdx(idx)}
                              className={`aspect-square rounded overflow-hidden border-2 cursor-pointer transition-all ${
                                activeDetailPhotoIdx === idx 
                                  ? 'border-amber-500 ring-2 ring-amber-500/25 scale-102' 
                                  : 'border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              <img
                                src={img}
                                alt="Gallery thumbnail"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-12 border-2 border-dashed border-slate-200 rounded-sm text-center text-slate-400">
                      <ImageIcon className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold">ไม่มีรูปถ่ายแนบประกอบบันทึกนี้</p>
                    </div>
                  )}

                </div>

              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-end select-none">
                <button
                  type="button"
                  onClick={() => setSelectedRecordForView(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-sm border border-slate-950 cursor-pointer shadow-sm transition-all"
                >
                  ปิดหน้าต่าง (Close)
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* NEW MAINTENANCE FORM DIALOG MODAL */}
      {isOpenForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-sm border-2 border-slate-950 w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-scale-up">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-4.5 border-b border-slate-950 flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <Wrench className="h-5 w-5 text-amber-500" />
                <span className="font-extrabold text-sm uppercase tracking-wider">
                  เพิ่มบันทึกการซ่อมบำรุง / รายงานซ่อมเรือด่วน
                </span>
              </div>
              <button
                onClick={() => setIsOpenForm(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-sm hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date Reported */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    📅 วันที่แจ้งซ่อม (Date Reported)
                  </label>
                  <input
                    type="date"
                    required
                    value={dateReported}
                    onChange={(e) => setDateReported(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs font-semibold focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20"
                  />
                </div>

                {/* Time Reported */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    ⌚ เวลาที่แจ้ง (Time)
                  </label>
                  <input
                    type="time"
                    required
                    value={timeReported}
                    onChange={(e) => setTimeReported(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs font-semibold focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Boat Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    🚢 เลือกเรือชำรุด (Vessel)
                  </label>
                  <select
                    value={boatId}
                    onChange={(e) => setBoatId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs font-bold focus:outline-hidden focus:border-amber-600"
                  >
                    {BOATS.map((boat) => (
                      <option key={boat.id} value={boat.id}>
                        เรือ {boat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Maintenance Type */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    🔧 ประเภทงาน (Type)
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs font-bold focus:outline-hidden focus:border-amber-600"
                  >
                    <option value="ตรวจสอบเรือ">ตรวจสอบเรือ (Inspection)</option>
                    <option value="ส่งซ่อม">ส่งซ่อม (Repair)</option>
                    <option value="อื่นๆ">อื่นๆ (Others)</option>
                  </select>
                </div>

                {/* Maintenance Status */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    📌 สถานะดำเนินการ (Status)
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs font-bold focus:outline-hidden focus:border-amber-600"
                  >
                    <option value="ดำเนินการแล้ว">ดำเนินการแล้ว (Completed)</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ (In Progress)</option>
                    <option value="รอคิว">รอคิว (Queued)</option>
                    <option value="ยกเลิก">ยกเลิก (Cancelled)</option>
                  </select>
                </div>
              </div>

              {/* Equipment Part Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  ⚙️ ชิ้นส่วน / อุปกรณ์ที่ซ่อม (Equipment Part)
                </label>
                <select
                  value={partRepaired}
                  onChange={(e) => setPartRepaired(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs font-bold focus:outline-hidden focus:border-amber-600"
                >
                  <option value="เครื่องยนต์หลัก">เครื่องยนต์หลัก (Main Engines)</option>
                  <option value="เครื่องกำเนิดไฟฟ้า">เครื่องกำเนิดไฟฟ้า (Marine Generators)</option>
                  <option value="ระบบส่งกำลังและเพลาใบจักร">ระบบส่งกำลังและเพลาใบจักร (Propulsion & Shafting)</option>
                  <option value="ระบบหางเสือและไฮดรอลิกบังคับเลี้ยว">ระบบหางเสือและไฮดรอลิกบังคับเลี้ยว (Steering & Hydraulic Rudder)</option>
                  <option value="เครื่องปรับอากาศ">เครื่องปรับอากาศ (Cabin Air Conditioner)</option>
                  <option value="ไดชาร์จ / ไดสตาร์ท">ไดชาร์จ / ไดสตาร์ท (Alternator & Starter Motor)</option>
                  <option value="ยอยและแท่นเครื่อง">ยอยและแท่นเครื่อง (Coupling & Engine Mounts)</option>
                  <option value="ตัวเรือคาตามารัน / กราบเรือ">ตัวเรือคาตามารัน / กราบเรือ (Catamaran Hull & Side Painting)</option>
                  <option value="ระบบสุขาภิบาล / ปั๊มน้ำ / ห้องน้ำ">ระบบสุขาภิบาล / ปั๊มน้ำ / ห้องน้ำ (Sanitary & Water Pump)</option>
                  <option value="ระบบปั๊มน้ำท้องเรือ & อลาร์มน้ำท่วม">ระบบปั๊มน้ำท้องเรือ & อลาร์มน้ำท่วม (Bilge Pumps & Flood Alarm)</option>
                  <option value="ระบบไฟฟ้ากำลัง / แบตเตอรี่">ระบบไฟฟ้ากำลัง / แบตเตอรี่ (Electrical Power & Battery Banks)</option>
                  <option value="ระบบนำร่อง / เรดาร์ / GPS">ระบบนำร่อง / เรดาร์ / GPS (Navigation, Radar & Marine GPS)</option>
                  <option value="อุปกรณ์ความปลอดภัย / ชูชีพ / ถังดับเพลิง">อุปกรณ์ความปลอดภัย / ชูชีพ / ถังดับเพลิง (Safety Equipment & Fire Extinguisher)</option>
                  <option value="โครงสร้างหลังคา / ดาดฟ้าเรือ / ราวกันตก">โครงสร้างหลังคา / ดาดฟ้าเรือ / ราวกันตก (Roof Canopy, Deck & Handrails)</option>
                  <option value="ระบบเครื่องเสียงและกระจายเสียงประชาสัมพันธ์">ระบบเครื่องเสียงและกระจายเสียงประชาสัมพันธ์ (PA & Passenger Sound System)</option>
                  <option value="ระบบสมอเรือ / กว้านสมอ">ระบบสมอเรือ / กว้านสมอ (Anchor & Windlass System)</option>
                  <option value="ทั่วไป (ตรวจเช็ค)">ทั่วไป (ตรวจเช็ค) / General Inspection</option>
                  <option value="อื่นๆ">อื่นๆ (Others)</option>
                </select>
              </div>

              {/* Details / Findings */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  📝 รายละเอียดอาการชำรุด / สิ่งที่พบ (Details / Findings)
                </label>
                <textarea
                  placeholder="เช่น ยอยข้างขวาเรือชำรุด, น้ำรั่วเข้าห้องนายท้าย, แอร์เสีย"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs font-medium focus:outline-hidden focus:border-amber-600 whitespace-pre-line leading-relaxed"
                ></textarea>
              </div>

              {/* Action Taken / Progress */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  🛠️ การดำเนินการแก้ไข / ผลการซ่อมบำรุง (Action Taken)
                </label>
                <textarea
                  placeholder="เช่น ดำเนินการรื้อซ่อมเปลี่ยนลูกปืนใหม่, ช่างตัวเรืออุดรอยรั่วเสร็จสิ้นแล้ว"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs font-medium focus:outline-hidden focus:border-amber-600 whitespace-pre-line leading-relaxed"
                ></textarea>
              </div>

              {/* Responsible Person */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  👤 ผู้รับผิดชอบดำเนินการ (Responsible Person)
                </label>
                <input
                  type="text"
                  placeholder="เช่น อู่เรือ, ช่างแอร์, ช่างกล, ผู้ช่วยช่าง..."
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs font-semibold focus:outline-hidden focus:border-amber-600"
                />
              </div>

              {/* Image upload section (Album style) */}
              <div className="border-t border-slate-150 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <ImageIcon className="h-4 w-4 text-amber-500" />
                    อัลบั้มรูปถ่ายประกอบการซ่อมทำ (Photos Attachment)
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    อัปโหลดรูปภาพได้สูงสุด {selectedPhotos.length} รูป
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <ImageUpload 
                      label="เพิ่มรูปถ่ายลงในอัลบั้ม"
                      onImageSelected={(base64) => setTempPhoto(base64)}
                      existingImage={undefined}
                    />
                    {tempPhoto && (
                      <button
                        type="button"
                        onClick={handleAddPhoto}
                        className="mt-2.5 w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-sm border border-amber-700 cursor-pointer transition-colors"
                      >
                        ➕ ดึงรูปนี้เข้าอัลบั้มหลัก
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">รูปที่เตรียมแนบกับประวัติ:</span>
                    {selectedPhotos.length === 0 ? (
                      <div className="p-6 border border-dashed border-slate-200 rounded-sm text-center text-slate-400 text-[11px]">
                        ยังไม่มีรูปภาพในอัลบั้ม
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedPhotos.map((img, idx) => (
                          <div key={idx} className="relative aspect-square border border-slate-200 rounded overflow-hidden group">
                            <img
                              src={img}
                              alt={`attachment-${idx}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-0.5 right-0.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-[8px] cursor-pointer"
                              title="ลบรูปนี้"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-200 pt-5 flex items-center justify-end gap-3 select-none">
                <button
                  type="button"
                  onClick={() => setIsOpenForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-sm cursor-pointer border border-slate-300 transition-all"
                >
                  ยกเลิก (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 text-white hover:bg-slate-900 text-xs font-bold rounded-sm cursor-pointer border border-slate-900 shadow-sm transition-all"
                >
                  💾 บันทึกประวัติ (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX FOR PREVIEWING ATTACHMENTS */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 cursor-pointer animate-fade-in"
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-3 right-3 p-1.5 bg-slate-950/80 hover:bg-slate-950 text-white rounded-full border border-slate-800 hover:scale-105 transition-all"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <img
              src={activePhoto}
              alt="Maintenance Record Zoomed"
              className="max-w-full max-h-[80vh] object-contain mx-auto"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-950/80 text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Chao Phraya Boat Photo Album
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
