import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
  TrendingUp,
  Ship
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

export const MAINTENANCE_SYSTEMS: { [key: string]: { label: string; parts: string[] } } = {
  'เครื่องยนต์หลัก': {
    label: 'เครื่องยนต์หลัก (Main Engines)',
    parts: [
      'ไส้กรองน้ำมันเครื่อง (Engine Oil Filter)',
      'ไส้กรองน้ำมันเชื้อเพลิง (Fuel Filter)',
      'ปั๊มน้ำหล่อเย็น / ใบพัดปั๊มน้ำ (Cooling Water Pump / Impeller)',
      'สายพานหน้าเครื่อง (Engine Belt)',
      'ฝาสูบ / ประเก็นฝาสูบ (Cylinder Head / Gasket)',
      'หัวฉีดน้ำมันเชื้อเพลิง (Fuel Injector)',
      'เทอร์โบชาร์จเจอร์ (Turbocharger)',
      'ท่อไอเสีย / ท่อพักไอเสีย (Exhaust Pipe / Silencer)',
      'อื่นๆ ในระบบเครื่องยนต์หลัก (Others)'
    ]
  },
  'เครื่องกำเนิดไฟฟ้า': {
    label: 'เครื่องกำเนิดไฟฟ้า (Marine Generators)',
    parts: [
      'ไส้กรองโซล่า (Diesel Filter)',
      'ไส้กรองอากาศ (Air Filter)',
      'ไดชาร์จปั่นไฟ (Alternator)',
      'AVR (Automatic Voltage Regulator)',
      'หม้อน้ำ / ฝาหม้อน้ำ (Radiator / Radiator Cap)',
      'อื่นๆ ในระบบเครื่องกำเนิดไฟฟ้า (Others)'
    ]
  },
  'ระบบส่งกำลังและเพลาใบจักร': {
    label: 'ระบบส่งกำลังและเพลาใบจักร (Propulsion & Shafting)',
    parts: [
      'เกียร์เรือ / แผ่นคลัตช์ (Marine Gearbox / Clutch Plate)',
      'เพลาใบจักร (Propeller Shaft)',
      'ใบจักรเรือ (Propeller)',
      'ยางกันน้ำ / ซีลเพลาท้าย (Stern Gland / Shaft Seal)',
      'บูชเพลาใบจักร (Shaft Bushing)',
      'อื่นๆ ในระบบส่งกำลัง (Others)'
    ]
  },
  'ระบบหางเสือและไฮดรอลิกบังคับเลี้ยว': {
    label: 'ระบบหางเสือและไฮดรอลิกบังคับเลี้ยว (Steering & Hydraulic Rudder)',
    parts: [
      'กระบอกสูบไฮดรอลิกหางเสือ (Hydraulic Cylinder)',
      'ปั๊มพวงมาลัยไฮดรอลิก (Steering Pump)',
      'สายน้ำมันไฮดรอลิก (Hydraulic Hoses)',
      'แผ่นหางเสือ (Rudder Blade)',
      'น้ำมันไฮดรอลิก (Hydraulic Oil)',
      'อื่นๆ ในระบบหางเสือ (Others)'
    ]
  },
  'เครื่องปรับอากาศ': {
    label: 'เครื่องปรับอากาศ (Cabin Air Conditioner)',
    parts: [
      'คอมเพรสเซอร์แอร์ (A/C Compressor)',
      'แผงคอยล์ร้อน (Condenser)',
      'แผงคอยล์เย็น (Evaporator)',
      'พัดลมโบเวอร์ (Blower Fan)',
      'น้ำยาแอร์ (Refrigerant)',
      'ฟิลเตอร์กรองฝุ่น (Air Filter Screen)',
      'อื่นๆ ในระบบเครื่องปรับอากาศ (Others)'
    ]
  },
  'ไดชาร์จ / ไดสตาร์ท': {
    label: 'ไดชาร์จ / ไดสตาร์ท (Alternator & Starter Motor)',
    parts: [
      'ไดสตาร์ทเครื่องยนต์หลัก (Starter Motor)',
      'ไดชาร์จแบตเตอรี่ (Alternator)',
      'ถ่านไดชาร์จ / รีเลย์สตาร์ท (Carbon Brushes / Starter Relay)',
      'สายไฟ / ขั้วต่อ (Wiring / Connectors)',
      'อื่นๆ ในระบบไดชาร์จ / ไดสตาร์ท (Others)'
    ]
  },
  'ยอยและแท่นเครื่อง': {
    label: 'ยอยและแท่นเครื่อง (Coupling & Engine Mounts)',
    parts: [
      'ยางแท่นเครื่อง (Engine Mount Rubber)',
      'ยอยส่งกำลัง (Coupling Joint)',
      'น็อตแท่นเครื่อง (Mounting Bolts)',
      'อื่นๆ ในระบบแท่นเครื่อง (Others)'
    ]
  },
  'ตัวเรือคาตามารัน / กราบเรือ': {
    label: 'ตัวเรือคาตามารัน / กราบเรือ (Catamaran Hull & Side Painting)',
    parts: [
      'ผิวไฟเบอร์กลาส / โครงสร้างตัวเรือ (Fiberglass / Hull Structure)',
      'สีพ่นตัวเรือ / กันเพรียง (Hull Paint / Anti-fouling)',
      'แผ่นกันกระแทก / ยางกราบเรือ (Fender / Side Rub Rail)',
      'บันไดขึ้นลงเรือ (Boarding Ladder)',
      'อื่นๆ ในส่วนตัวเรือ (Others)'
    ]
  },
  'ระบบสุขาภิบาล / ปั๊มน้ำ / ห้องน้ำ': {
    label: 'ระบบสุขาภิบาล / ปั๊มน้ำ / ห้องน้ำ (Sanitary & Water Pump)',
    parts: [
      'โถสุขภัณฑ์ (Marine Toilet)',
      'ปั๊มน้ำจืด (Fresh Water Pump)',
      'ถังเกรอะ / ถังบำบัด (Holding Tank / Septic System)',
      'ก๊อกน้ำ / ฝักบัว / ท่อน้ำ (Faucets / Shower / Pipes)',
      'อื่นๆ ในระบบสุขาภิบาล (Others)'
    ]
  },
  'ระบบปั๊มน้ำท้องเรือ & อลาร์มน้ำท่วม': {
    label: 'ระบบปั๊มน้ำท้องเรือ & อลาร์มน้ำท่วม (Bilge Pumps & Flood Alarm)',
    parts: [
      'ปั๊มไดโว่ / ปั๊มน้ำท้องเรือ (Bilge Pump)',
      'สวิตช์ลูกลอยอัตโนมัติ (Float Switch)',
      'เซ็นเซอร์แจ้งเตือนน้ำท่วม (Flood Alarm Sensor)',
      'ท่อระบายน้ำท้องเรือ (Bilge Discharge Hose)',
      'อื่นๆ ในระบบปั๊มน้ำท้องเรือ (Others)'
    ]
  },
  'ระบบไฟฟ้ากำลัง / แบตเตอรี่': {
    label: 'ระบบไฟฟ้ากำลัง / แบตเตอรี่ (Electrical Power & Battery Banks)',
    parts: [
      'แบตเตอรี่ (Batteries)',
      'ตู้ควบคุมไฟฟ้า / เบรกเกอร์ (Control Panel / Breakers)',
      'สายไฟหลัก / ขั้วแบตเตอรี่ (Main Cables / Battery Terminals)',
      'สวิตช์ตัดตอนแบตเตอรี่ (Battery Isolation Switch)',
      'หลอดไฟ / โคมไฟทางเดิน (Lighting / Navigation Lights)',
      'อื่นๆ ในระบบไฟฟ้า (Others)'
    ]
  },
  'ระบบนำร่อง / เรดาร์ / GPS': {
    label: 'ระบบนำร่อง / เรดาร์ / GPS (Navigation, Radar & Marine GPS)',
    parts: [
      'หน้าจอ GPS Map / ซาวเดอร์ (GPS Chartplotter / Fishfinder)',
      'เสาอากาศเรดาร์ (Radar Antenna)',
      'วิทยุสื่อสาร VHF (VHF Radio)',
      'เข็มทิศเดินเรือ (Marine Compass)',
      'อื่นๆ ในระบบนำร่อง (Others)'
    ]
  },
  'อุปกรณ์ความปลอดภัย / ชูชีพ / ถังดับเพลิง': {
    label: 'อุปกรณ์ความปลอดภัย / ชูชีพ / ถังดับเพลิง (Safety Equipment & Fire Extinguisher)',
    parts: [
      'เสื้อชูชีพ / ทุ่นช่วยชีวิต (Life Jackets / Ring Buoys)',
      'ถังดับเพลิงเคมีสูตรน้ำ / CO2 (Fire Extinguishers)',
      'อลาร์มตรวจจับควัน / ความร้อน (Smoke / Heat Detectors)',
      'ขวานและค้อนเซฟตี้ (Safety Axe / Hammer)',
      'กล่องปฐมพยาบาล (First Aid Kit)',
      'อื่นๆ ในระบบความปลอดภัย (Others)'
    ]
  },
  'โครงสร้างหลังคา / ดาดฟ้าเรือ / ราวกันตก': {
    label: 'โครงสร้างหลังคา / ดาดฟ้าเรือ / ราวกันตก (Roof Canopy, Deck & Handrails)',
    parts: [
      'โครงสร้างหลังคาผ้าใบ / หลังคาแข็ง (Canopy Structure / Canvas)',
      'พื้นดาดฟ้ากันลื่น / ปูหญ้าเทียม (Non-slip Deck / Artificial Grass)',
      'ราวกันตกสแตนเลส (Stainless Steel Handrails)',
      'ประตูกลั้นผู้โดยสาร (Passenger Safety Gates)',
      'อื่นๆ ในโครงสร้างหลังคา (Others)'
    ]
  },
  'ระบบเครื่องเสียงและกระจายเสียงประชาสัมพันธ์': {
    label: 'ระบบเครื่องเสียงและกระจายเสียงประชาสัมพันธ์ (PA & Passenger Sound System)',
    parts: [
      'เครื่องขยายเสียง / แอมพลิฟายเออร์ (Amplifier)',
      'ลำโพงติดเพดาน / ลำโพงกันน้ำ (Ceiling / Waterproof Speakers)',
      'ไมโครโฟนสาย / ไร้สาย (Microphones)',
      'สายสัญญาณเสียง (Audio Cables)',
      'อื่นๆ ในระบบเครื่องเสียง (Others)'
    ]
  },
  'ระบบสมอเรือ / กว้านสมอ': {
    label: 'ระบบสมอเรือ / กว้านสมอ (Anchor & Windlass System)',
    parts: [
      'สมอเรือ (Anchor)',
      'โซ่สมอเรือ / เชือกสมอ (Anchor Chain / Rope)',
      'มอเตอร์กว้านสมอ (Windlass Motor)',
      'ลูกรอกนำร่องโซ่ (Bow Roller)',
      'รีโมทควบคุมกว้านสมอ (Windlass Remote Control)',
      'อื่นๆ ในระบบสมอเรือ (Others)'
    ]
  },
  'ทั่วไป (ตรวจเช็ค)': {
    label: 'ทั่วไป (ตรวจเช็ค) / General Inspection',
    parts: [
      'ตรวจเช็คตามรอบปกติ (Routine Check)',
      'ตรวจทำความสะอาด (Cleaning & Detailing)',
      'ตรวจขันน็อต/จุดเชื่อมต่อ (Tightening Connections)',
      'อื่นๆ (Others)'
    ]
  },
  'อื่นๆ': {
    label: 'อื่นๆ (Others)',
    parts: [
      'ชิ้นส่วนอื่นๆ ที่ระบุในรายละเอียด (Others specified in details)'
    ]
  }
};

interface MaintenanceSectionProps {
  records: MaintenanceRecord[];
  onSaveRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  onDeleteRecord?: (id: string) => void;
  onUpdateMaintenanceStatus: (id: string, newStatus: MaintenanceStatus) => void;
  onUpdateRecord?: (id: string, updates: Partial<MaintenanceRecord>) => void;
  isSyncing?: boolean;
  showOnly?: 'dashboard' | 'records';
}

export default function MaintenanceSection({
  records,
  onSaveRecord,
  onDeleteRecord,
  onUpdateMaintenanceStatus,
  onUpdateRecord,
  isSyncing = false,
  showOnly,
}: MaintenanceSectionProps) {
  // Modal States
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedRecordForView, setSelectedRecordForView] = useState<MaintenanceRecord | null>(null);
  const [selectedPartForView, setSelectedPartForView] = useState<string | null>(null);
  const [selectedBoatForView, setSelectedBoatForView] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [activeDetailPhotoIdx, setActiveDetailPhotoIdx] = useState<number>(0);
  const [showDashboard, setShowDashboard] = useState(showOnly === 'dashboard' ? true : true);
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
  const [systemRepaired, setSystemRepaired] = useState('เครื่องปรับอากาศ');
  const [sparePartRepaired, setSparePartRepaired] = useState('คอมเพรสเซอร์แอร์ (A/C Compressor)');
  const [details, setDetails] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('อู่เรือ');
  const [status, setStatus] = useState<MaintenanceStatus>('ดำเนินการแล้ว');
  const [cost, setCost] = useState<string>('');

  const handleSystemChange = (system: string) => {
    setSystemRepaired(system);
    const parts = MAINTENANCE_SYSTEMS[system]?.parts || [];
    setSparePartRepaired(parts[0] || '');
  };

  // Photo uploading temp state
  const [tempPhoto, setTempPhoto] = useState<string | undefined>(undefined);
  const [isAddingPhotoToRecord, setIsAddingPhotoToRecord] = useState(false);
  const [newPhotoForRecord, setNewPhotoForRecord] = useState<string | undefined>(undefined);

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
    
    if (selectedDashboardMonth === 'all') {
      return monthlyStats.map(m => {
        const monthRecords = records.filter(r => r.dateReported && r.dateReported.startsWith(m.key));
        const dataPoint: any = {
          name: m.monthName,
          fullDate: m.key,
          dayNum: -1,
        };
        
        BOATS.forEach(boat => {
           const boatRecords = monthRecords.filter(r => r.boatId === boat.id);
           dataPoint[`${boat.name}_inspections`] = boatRecords.filter(r => r.type === 'ตรวจสอบเรือ').length;
           dataPoint[`${boat.name}_repairs`] = boatRecords.filter(r => r.type === 'ส่งซ่อม').length;
        });
        
        return dataPoint;
      });
    }

    const parts = selectedDashboardMonth.split('-');
    if (parts.length < 2) return [];
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateString = `${selectedDashboardMonth}-${String(day).padStart(2, '0')}`;
      const dayRecords = records.filter(r => r.dateReported === dateString);
      
      const dataPoint: any = { 
        name: day.toString(),
        fullDate: dateString,
        dayNum: day
      };

      BOATS.forEach(boat => {
         const boatRecords = dayRecords.filter(r => r.boatId === boat.id);
         dataPoint[`${boat.name}_inspections`] = boatRecords.filter(r => r.type === 'ตรวจสอบเรือ').length;
         dataPoint[`${boat.name}_repairs`] = boatRecords.filter(r => r.type === 'ส่งซ่อม').length;
      });
      
      return dataPoint;
    });
  }, [records, selectedDashboardMonth]);

  const dashboardRecords = React.useMemo(() => {
    if (!selectedDashboardMonth) return [];
    if (selectedDashboardMonth === 'all') return records;
    return records.filter(r => r.dateReported && r.dateReported.startsWith(selectedDashboardMonth));
  }, [records, selectedDashboardMonth]);

  const partAggregates = React.useMemo(() => {
    const aggregates: { [system: string]: number } = {};
    dashboardRecords.forEach((rec) => {
      const fullPart = rec.partRepaired || 'ทั่วไป (ตรวจเช็ค)';
      const system = fullPart.includes(' -> ') ? fullPart.split(' -> ')[0].trim() : fullPart.trim();
      aggregates[system] = (aggregates[system] || 0) + 1;
    });
    return Object.keys(aggregates)
      .map((name) => ({ name, count: aggregates[name] }))
      .sort((a, b) => b.count - a.count);
  }, [dashboardRecords]);

  const boatAggregates = React.useMemo(() => {
    const aggregates: { [boat: string]: number } = {};
    dashboardRecords.forEach((rec) => {
      const rawName = rec.boatName || 'ไม่ระบุ';
      const boat = rawName.replace(/\s+/g, '').toUpperCase();
      aggregates[boat] = (aggregates[boat] || 0) + 1;
    });
    
    return ['CTB1', 'CTB2', 'CTB3', 'R1', 'R2', 'R3', 'R4'].map(name => ({
      name,
      count: aggregates[name] || 0
    }));
  }, [dashboardRecords]);

  const boatMaintenanceStats = React.useMemo(() => {
    const boatsList = [
      { id: 'boat-1', name: 'CTB 1', displayName: 'Chao Phraya Tourist Boat 1 (CTB 1)' },
      { id: 'boat-2', name: 'CTB 2', displayName: 'Chao Phraya Tourist Boat 2 (CTB 2)' },
      { id: 'boat-3', name: 'CTB 3', displayName: 'Chao Phraya Tourist Boat 3 (CTB 3)' },
      { id: 'boat-4', name: 'R1', displayName: 'Riva Express 1 (R1)' },
      { id: 'boat-5', name: 'R2', displayName: 'Riva Express 2 (R2)' },
      { id: 'boat-6', name: 'R3', displayName: 'Riva Express 3 (R3)' },
      { id: 'boat-7', name: 'R4', displayName: 'Riva Express 4 (R4)' },
    ];

    return boatsList.map(b => {
      const boatRecords = dashboardRecords.filter(r => {
        const rName = (r.boatName || '').replace(/\s+/g, '').toUpperCase();
        const bName = b.name.replace(/\s+/g, '').toUpperCase();
        return rName === bName || r.boatId === b.id;
      });

      const totalCount = boatRecords.length;
      const inspections = boatRecords.filter(r => r.type === 'ตรวจสอบเรือ').length;
      const repairs = boatRecords.filter(r => r.type === 'ส่งซ่อม').length;
      const others = totalCount - inspections - repairs;

      const completed = boatRecords.filter(r => r.status === 'ดำเนินการแล้ว').length;
      const inProgress = boatRecords.filter(r => r.status === 'กำลังดำเนินการ').length;
      const queued = boatRecords.filter(r => r.status === 'รอคิว').length;
      const cancelled = boatRecords.filter(r => r.status === 'ยกเลิก').length;

      const totalCost = boatRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

      return {
        id: b.id,
        name: b.name,
        displayName: b.displayName,
        totalCount,
        inspections,
        repairs,
        others,
        completed,
        pending: inProgress + queued,
        cancelled,
        totalCost
      };
    });
  }, [dashboardRecords]);

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

  // Executive Status stats
  const statusStats = React.useMemo(() => {
    let resolved = 0;
    let inProgress = 0;
    let pending = 0;
    let cancelled = 0;
    dashboardRecords.forEach((r) => {
      if (r.status === 'ดำเนินการแล้ว') {
        resolved++;
      } else if (r.status === 'กำลังดำเนินการ') {
        inProgress++;
      } else if (r.status === 'รอคิว') {
        pending++;
      } else if (r.status === 'ยกเลิก') {
        cancelled++;
      }
    });
    const total = dashboardRecords.length || 1;
    const resolveRate = Math.round((resolved / total) * 100);
    return { resolved, inProgress, pending, cancelled, resolveRate };
  }, [dashboardRecords]);

  // Auto-set the latest month as default on load
  React.useEffect(() => {
    if (monthlyStats && monthlyStats.length > 0 && selectedDashboardMonth !== 'all') {
      const exists = monthlyStats.some(m => m.key === selectedDashboardMonth);
      if (!exists) {
        setSelectedDashboardMonth(monthlyStats[monthlyStats.length - 1].key);
      }
    }
  }, [monthlyStats, selectedDashboardMonth]);

  // Calendar calculations for selected month
  const calendarDays = React.useMemo(() => {
    if (!selectedDashboardMonth || selectedDashboardMonth === 'all') return [];
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
    if (selectedCalendarDay === null || selectedDashboardMonth === 'all') return [];
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

  const handleAddPhotoToRecord = () => {
    if (selectedRecordForView && newPhotoForRecord && onUpdateRecord) {
      const updatedPhotos = [...(selectedRecordForView.photos || []), newPhotoForRecord];
      onUpdateRecord(selectedRecordForView.id, { photos: updatedPhotos });
      
      // Update local modal state to show the new photo immediately
      setSelectedRecordForView({
        ...selectedRecordForView,
        photos: updatedPhotos
      });
      
      setNewPhotoForRecord(undefined);
      setIsAddingPhotoToRecord(false);
      setActiveDetailPhotoIdx(updatedPhotos.length - 1);
    }
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
      partRepaired: `${systemRepaired} -> ${sparePartRepaired}`,
      cost: cost ? parseFloat(cost) : 0,
    });

    // Reset Form
    setIsOpenForm(false);
    setSelectedPhotos([]);
    setDetails('');
    setActionTaken('');
    setResponsiblePerson('อู่เรือ');
    setStatus('ดำเนินการแล้ว');
    setSystemRepaired('เครื่องปรับอากาศ');
    setSparePartRepaired('คอมเพรสเซอร์แอร์ (A/C Compressor)');
    setCost('');
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
          <button onClick={() => onUpdateMaintenanceStatus(recordId, cycleStatus(st))} className={`${baseClasses} bg-amber-500 text-slate-950`}>
            <AlertCircle className="h-3 w-3" />
            รอคิว
          </button>
        );
      case 'ยกเลิก':
        return (
          <button onClick={() => onUpdateMaintenanceStatus(recordId, cycleStatus(st))} className={`${baseClasses} bg-slate-500 text-slate-950`}>
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
      {showOnly !== 'dashboard' && (
        <div className="bg-white p-6 rounded-2xl text-slate-950 shadow-2xl border border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 backdrop-blur-md rounded-xl border border-amber-500/20">
              <Wrench className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 drop-shadow-md">🔧 ระบบบันทึกประวัติการซ่อมบำรุงเรือท่องเที่ยว</h2>
              <p className="text-xs text-slate-500 font-black tracking-wider mt-1 uppercase font-mono">
                Chao Phraya Boat Maintenance & Repair Log Registry
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpenForm(true)}
              className="px-6 py-3 bg-amber-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl border border-amber-500 shadow-lg shadow-amber-200/20 hover:bg-amber-700 cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-2 select-none shrink-0"
            >
              <Plus className="h-4 w-4 stroke-[3px]" />
              บันทึกการซ่อมบำรุงใหม่
            </button>
          </div>
        </div>
      )}

      {showOnly !== 'records' && (
        <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm overflow-hidden transition-all duration-300">
        <button
          onClick={() => setShowDashboard(!showDashboard)}
          className="w-full bg-white hover:bg-white p-5 border-b border-slate-300 flex items-center justify-between transition-colors select-none text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <Wrench className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm md:text-base text-slate-950 tracking-tight">📊 แดชบอร์ดสรุปสถิติการแจ้งซ่อมอุปกรณ์แยกตามเดือน</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase mt-0.5 tracking-wider font-mono">
                Equipment Repairs Statistics & Analytics Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-black text-amber-500 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full transition-all">
              {showDashboard ? '🙈 ซ่อนแดชบอร์ด (Hide)' : '👀 แสดงแดชบอร์ด (Show)'}
            </span>
          </div>
        </button>

      {showDashboard && (
        <>
          {/* Top Row: Overall Aggregations / Charts */}
          <div className="p-6 bg-white border-b border-slate-300 space-y-6">
            
            {/* Month Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white p-2 rounded-xl border border-slate-300 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setSelectedDashboardMonth('all');
                  setSelectedCalendarDay(null);
                }}
                className={`px-4 py-2 text-xs font-black rounded-lg cursor-pointer transition-all ${
                  selectedDashboardMonth === 'all'
                    ? 'bg-amber-600 text-slate-950 shadow-md scale-105'
                    : 'text-slate-500 hover:bg-white hover:text-slate-950'
                }`}
              >
                ทั้งหมด (All)
              </button>
              {monthlyStats.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setSelectedDashboardMonth(item.key);
                    setSelectedCalendarDay(null);
                  }}
                  className={`px-4 py-2 text-xs font-black rounded-lg cursor-pointer transition-all ${
                    selectedDashboardMonth === item.key
                      ? 'bg-amber-600 text-slate-950 shadow-md scale-105'
                      : 'text-slate-500 hover:bg-white hover:text-slate-950'
                  }`}
                >
                  {item.monthName} {item.year}
                </button>
              ))}
            </div>

            {/* Boat Breakdown */}
            <div className="space-y-3 max-w-4xl mx-auto w-full pt-2">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block text-center mb-4">
                🚢 สถิติการแจ้งซ่อมแยกตามเรือ (คลิกเพื่อดูรายละเอียด)
              </span>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {boatAggregates.map((boat, idx) => (
                  <div
                    key={idx}
                    onClick={() => boat.count > 0 && setSelectedBoatForView(boat.name)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      boat.count > 0 
                        ? 'bg-white border-slate-300 hover:border-amber-500 hover:shadow-lg cursor-pointer group' 
                        : 'bg-white border-slate-300 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <Ship className={`h-6 w-6 mb-2 ${boat.count > 0 ? 'text-amber-500 group-hover:scale-110 transition-transform' : 'text-slate-700'}`} />
                    <span className="text-xs font-black text-slate-700">{boat.name}</span>
                    {boat.count > 0 ? (
                      <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-slate-950">
                        {boat.count}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-600 font-bold mt-1">ไม่มีซ่อม</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Side-by-Side Statistics Tables */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start max-w-7xl mx-auto w-full pt-6 border-t border-slate-200">
              
              {/* Vessel Maintenance Summary Table */}
              <div className="space-y-3 w-full">
                <div className="flex flex-col items-center xl:items-start text-center xl:text-left">
                  <span className="text-[12px] font-black text-slate-800 uppercase tracking-wider block">
                    📋 ตารางสรุปสถิติจำนวนครั้งที่เรือแต่ละลำถูกแจ้งซ่อมบำรุง
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 font-mono">
                    Vessel Maintenance Frequency & Status Comparison Table
                  </span>
                </div>

                <div className="overflow-x-auto bg-white rounded-xl border border-slate-300 shadow-xs mt-4">
                  <table className="min-w-full divide-y divide-slate-300 text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-800 font-extrabold uppercase text-[10.5px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4 text-center">ลำดับ</th>
                        <th className="py-3 px-4">ชื่อเรือ</th>
                        <th className="py-3 px-3 text-center bg-amber-500/5 text-amber-950 font-black">ความถี่แจ้งซ่อม</th>
                        <th className="py-3 px-3 text-center text-emerald-700 font-bold">ตรวจเช็ค</th>
                        <th className="py-3 px-3 text-center text-orange-700 font-bold">ส่งซ่อม</th>
                        <th className="py-3 px-3 text-center text-green-700 font-bold">เสร็จสิ้น</th>
                        <th className="py-3 px-3 text-center text-blue-700 font-bold">กำลังทำ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {boatMaintenanceStats.map((stat, idx) => {
                        return (
                          <tr key={stat.id} className="hover:bg-slate-50 transition-colors font-semibold">
                            <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => stat.totalCount > 0 && setSelectedBoatForView(stat.name)}
                                className={`flex items-center gap-2 text-left font-black text-slate-900 ${
                                  stat.totalCount > 0 ? 'hover:text-amber-600 underline cursor-pointer' : 'opacity-60 cursor-not-allowed'
                                }`}
                                disabled={stat.totalCount === 0}
                              >
                                <Ship className={`h-4 w-4 ${stat.totalCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                                {stat.displayName}
                              </button>
                            </td>
                            <td className="py-3 px-3 text-center font-black bg-amber-500/5 text-slate-900 text-xs font-mono">{stat.totalCount} ครั้ง</td>
                            <td className="py-3 px-3 text-center font-mono text-slate-600">{stat.inspections}</td>
                            <td className="py-3 px-3 text-center font-mono text-slate-600">{stat.repairs}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                                {stat.completed}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {stat.pending > 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 animate-pulse">
                                  {stat.pending}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-100 font-black text-[11px] text-slate-950 border-t-2 border-slate-300">
                      <tr>
                        <td className="py-3 px-4 text-center">-</td>
                        <td className="py-3 px-4 uppercase text-left tracking-wide">ยอดรวมทุกลำ (Grand Total)</td>
                        <td className="py-3 px-3 text-center font-mono font-black text-xs text-slate-950 bg-amber-500/5">
                          {boatMaintenanceStats.reduce((sum, s) => sum + s.totalCount, 0)} ครั้ง
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700">
                          {boatMaintenanceStats.reduce((sum, s) => sum + s.inspections, 0)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700">
                          {boatMaintenanceStats.reduce((sum, s) => sum + s.repairs, 0)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-green-800">
                          {boatMaintenanceStats.reduce((sum, s) => sum + s.completed, 0)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-blue-800">
                          {boatMaintenanceStats.reduce((sum, s) => sum + s.pending, 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Column 2: Equipment Breakdown */}
              <div className="space-y-3 w-full">
                <div className="flex flex-col items-center xl:items-start text-center xl:text-left">
                  <span className="text-[12px] font-black text-slate-800 uppercase tracking-wider block">
                    ⚙️ สถิติการซ่อมแยกตามชิ้นส่วน/อุปกรณ์
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 font-mono">
                    Equipment Repair Breakdown & Frequency Statistics
                  </span>
                </div>
                
                <div className="bg-white p-4.5 rounded-2xl border border-slate-300 shadow-3xs h-[412px] overflow-y-auto space-y-2.5 custom-scrollbar mt-4">
                  {partAggregates.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] text-slate-600 font-bold">
                      ไม่มีข้อมูลประเภทชิ้นส่วนที่เสีย
                    </div>
                  ) : (
                    partAggregates.map((item, idx) => {
                      const total = dashboardRecords.length || 1;
                      const pct = (item.count / total) * 100;
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedPartForView(item.name)}
                          className="space-y-1 bg-white p-2 rounded-xl border border-slate-300 hover:border-slate-300 hover:bg-white transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between text-[10.5px] font-bold">
                            <span className="text-slate-700 truncate pr-2 group-hover:text-amber-500 transition-colors" title={item.name}>🛠️ {item.name}</span>
                            <span className="text-slate-500 font-mono text-[10px] bg-white border border-slate-300 px-1.5 py-0.5 rounded-lg shrink-0 group-hover:bg-amber-50 group-hover:border-amber-200 group-hover:text-amber-500 transition-colors">
                              {item.count} ครั้ง ({Math.round(pct)}%)
                            </span>
                          </div>
                          <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${pct}%` }} 
                              className={`h-full rounded-full transition-all duration-500 ${
                                idx === 0 
                                  ? 'bg-amber-500' 
                                  : idx === 1
                                  ? 'bg-indigo-500'
                                  : idx === 2
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-600'
                              }`}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            </div>

            {/* Bottom Row: Daily Trend Chart Drilldown */}
            <div className="border-t border-slate-300 bg-white p-6 mt-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-amber-500/15 text-amber-500 rounded border border-amber-500/10">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-black text-sm text-slate-950 tracking-tight flex items-center gap-2">
                      📈 สถิติแนวโน้มการซ่อมบำรุงรายวัน
                      <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                        DAILY TREND
                      </span>
                    </h4>
                    <p className="text-[10.5px] text-slate-500 font-black uppercase tracking-wider mt-0.5">
                      Equipment Repairs Daily Trend Statistics & Visualization
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Chart Tabs */}
                  <div className="flex bg-white p-0.5 rounded-sm border border-slate-300 shadow-sm">
                    <button
                      onClick={() => setActiveChartTab('bar')}
                      className={`px-3 py-1 text-[10px] font-bold rounded-xs transition-all flex items-center gap-1.5 ${
                        activeChartTab === 'bar' ? 'bg-white text-slate-950 shadow-3xs' : 'text-slate-500 hover:text-slate-500'
                      }`}
                    >
                      <BarChartIcon className="h-3 w-3" />
                      กราฟแท่ง
                    </button>
                    <button
                      onClick={() => setActiveChartTab('line')}
                      className={`px-3 py-1 text-[10px] font-bold rounded-xs transition-all flex items-center gap-1.5 ${
                        activeChartTab === 'line' ? 'bg-white text-slate-950 shadow-3xs' : 'text-slate-500 hover:text-slate-500'
                      }`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      กราฟเส้น
                    </button>
                  </div>
                </div>
              </div>

              {/* Scorecard */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-white p-3 rounded-sm border border-slate-300 shadow-3xs flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">รวมซ่อมบำรุง</span>
                  <span className="text-xl font-black text-amber-600">{dashboardRecords.length}</span>
                </div>
                <div className="bg-white p-3 rounded-sm border border-slate-300 shadow-3xs flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">การตรวจสอบ</span>
                  <span className="text-xl font-black text-emerald-600">{dashboardRecords.filter(r => r.type === 'ตรวจสอบเรือ').length}</span>
                </div>
                <div className="bg-white p-3 rounded-sm border border-slate-300 shadow-3xs flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">ส่งซ่อม</span>
                  <span className="text-xl font-black text-orange-600">{dashboardRecords.filter(r => r.type === 'ส่งซ่อม').length}</span>
                </div>
                <div className="bg-white p-3 rounded-sm border border-slate-300 shadow-3xs flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">กำลังดำเนินการ</span>
                  <span className="text-xl font-black text-blue-600">{dashboardRecords.filter(r => r.status === 'กำลังดำเนินการ').length}</span>
                </div>
              </div>

              {/* Chart Stage */}
              <div className="bg-white p-4 rounded-sm border border-slate-300 shadow-3xs h-[300px] relative">
                {dailyTrendData.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-3">
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
                            const payload = data.activePayload[0].payload;
                            if (selectedDashboardMonth === 'all') {
                              setSelectedDashboardMonth(payload.fullDate);
                              setSelectedCalendarDay(null);
                            } else {
                              setSelectedCalendarDay(payload.dayNum);
                            }
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                          label={{ value: selectedDashboardMonth === 'all' ? 'เดือน (Month)' : 'วันที่ (Day)', position: 'insideBottom', offset: -5, fontSize: 10, fontWeight: 800, fill: '#475569' }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }}
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #1e293b', fontSize: '11px', borderRadius: '6px' }}
                          labelFormatter={(label) => selectedDashboardMonth === 'all' ? `เดือน ${label}` : `วันที่ ${label}`}
                          formatter={(value, name, props) => {
                            if (value === 0) return null;
                            const dataKey = props.dataKey as string;
                            const boatName = dataKey.split('_')[0];
                            const type = dataKey.includes('inspections') ? 'การตรวจสอบ' : 'การซ่อม';
                            return [value, `${boatName} ${type}`];
                          }}
                        />
                        <Legend />
                        {BOATS.map((boat, index) => (
                         <Bar 
                           key={`${boat.name}_inspections`}
                           dataKey={`${boat.name}_inspections`}
                           stackId="a"
                           fill="#10b981"
                           name="การตรวจสอบ"
                           legendType={index === 0 ? 'rect' : 'none'}
                         />
                       ))}
                       {BOATS.map((boat, index) => (
                         <Bar 
                           key={`${boat.name}_repairs`}
                           dataKey={`${boat.name}_repairs`}
                           stackId="a"
                           fill="#d97706"
                           name="การซ่อม"
                           legendType={index === 0 ? 'rect' : 'none'}
                         />
                       ))}
                      </BarChart>
                    ) : (
                      <LineChart 
                        data={dailyTrendData} 
                        margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                        onClick={(data: any) => {
                          if (data && data.activePayload) {
                            const payload = data.activePayload[0].payload;
                            if (selectedDashboardMonth === 'all') {
                              setSelectedDashboardMonth(payload.fullDate);
                              setSelectedCalendarDay(null);
                            } else {
                              setSelectedCalendarDay(payload.dayNum);
                            }
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
                          labelFormatter={(label) => selectedDashboardMonth === 'all' ? `เดือน ${label}` : `วันที่ ${label}`}
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
                    <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                    <span>วันทั่วไปที่มีการแจ้งซ่อม</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-500">
                  MONTHLY SNAPSHOT: {records.filter(r => r.dateReported && r.dateReported.startsWith(selectedDashboardMonth)).length} TOTAL REPAIRS
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      )}

      {/* Advanced Filter Bar Card */}
      {showOnly !== 'dashboard' && (
        <>
          <div className="bg-white p-5 rounded-sm border border-slate-300 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-300 pb-3">
          <span className="text-xs font-bold text-slate-950 flex items-center gap-2">
            <Filter className="h-4 w-4 text-amber-600" />
            ตัวกรองข้อมูลประวัติการซ่อมทำ (Filters)
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-full">
            พบ {filteredRecords.length} รายการ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input type="text"
              placeholder="ค้นหา (รายละเอียด, ผู้ดำเนินการ, ...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-sm text-xs font-medium focus:bg-white focus:outline-hidden focus:border-amber-600 transition-colors"
            />
          </div>

          {/* Filter by Boat */}
          <select value={filterBoat}
            onChange={(e) => setFilterBoat(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs font-medium focus:bg-white focus:outline-hidden focus:border-amber-600 transition-colors"
          >
            <option value="all">🚢 เลือกเรือทั้งหมด (All Boats)</option>
            {BOATS.map((boat) => (
              <option key={boat.id} value={boat.id}>
                เรือ {boat.name}
              </option>
            ))}
          </select>

          {/* Filter by Type */}
          <select value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-amber-600 transition-colors"
          >
            <option value="all">🔧 เลือกประเภททั้งหมด (All Types)</option>
            <option value="ตรวจสอบเรือ">ตรวจสอบเรือ (Inspection)</option>
            <option value="ส่งซ่อม">ส่งซ่อม (Repair)</option>
            <option value="อื่นๆ">อื่นๆ (Others)</option>
          </select>

          {/* Filter by Status */}
          <select value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-amber-600 transition-colors"
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
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white text-slate-500 text-[10px] uppercase font-black tracking-widest select-none">
                <th className="py-4 px-4 border-b border-slate-300 w-[110px]">วันที่ / เวลาแจ้ง</th>
                <th className="py-4 px-4 border-b border-slate-300 w-[90px]">ชื่อเรือ</th>
                <th className="py-4 px-4 border-b border-slate-300 w-[110px]">ประเภทการซ่อม</th>
                <th className="py-4 px-4 border-b border-slate-300 w-[130px]">ชิ้นส่วน / อุปกรณ์</th>
                <th className="py-4 px-4 border-b border-slate-300">รายละเอียด/สิ่งที่พบ</th>
                <th className="py-4 px-4 border-b border-slate-300">ผลการดำเนินการ</th>
                <th className="py-4 px-4 border-b border-slate-300 w-[120px]">ผู้รับผิดชอบ</th>
                <th className="py-4 px-4 border-b border-slate-300 w-[120px] text-center">สถานะ</th>
                <th className="py-4 px-4 border-b border-slate-300 w-[180px]">รูปภาพประกอบ</th>
                <th className="py-4 px-4 border-b border-slate-300 w-[140px] text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs font-medium text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-500 bg-slate-100/50">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Wrench className="h-10 w-10 text-slate-700" />
                      <p className="font-extrabold uppercase tracking-widest text-[10px]">ไม่พบรายการซ่อมทำตามตัวกรองปัจจุบัน</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-100/40 transition-colors group">
                    <td className="py-4.5 px-4">
                      <div className="font-black flex items-center gap-1.5 text-slate-950">
                        <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        {r.dateReported}
                      </div>
                      <div className="text-[10px] font-black text-slate-500 font-mono mt-1 uppercase">
                        ⌚ {r.timeReported} น.
                      </div>
                    </td>
                    <td className="py-4.5 px-4">
                      <span className="px-2 py-0.5 text-[11px] font-black bg-white border border-slate-300 text-slate-500 rounded-lg uppercase">
                        {r.boatName}
                      </span>
                    </td>
                    <td className="py-4.5 px-4">
                      <span className={`px-2 py-0.5 text-[10px] rounded-lg font-black tracking-wide uppercase ${
                        r.type === 'ตรวจสอบเรือ' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : r.type === 'ส่งซ่อม'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-white text-slate-500 border border-slate-300'
                      }`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="py-4.5 px-4">
                      <span className="px-2.5 py-1 text-[10.5px] rounded-lg font-black bg-white text-amber-500 border border-slate-300 block text-center truncate max-w-[130px]" title={r.partRepaired || 'ทั่วไป (ตรวจเช็ค)'}>
                        ⚙️ {r.partRepaired || 'ทั่วไป'}
                      </span>
                    </td>
                    <td className="py-4.5 px-4 font-bold text-slate-500 max-w-[200px] break-words whitespace-pre-line leading-relaxed">
                      {r.details || '-'}
                    </td>
                    <td className="py-4.5 px-4 font-normal text-slate-500 max-w-[260px] break-words whitespace-pre-line leading-relaxed line-clamp-3 italic">
                      {r.actionTaken || '-'}
                    </td>
                    <td className="py-4.5 px-4 font-black text-slate-500">
                      👤 {r.responsiblePerson}
                    </td>
                    <td className="py-4.5 px-4 text-center">
                      {getStatusBadge(r.status, r.id)}
                    </td>
                    <td className="py-4.5 px-4">
                      {r.photos && r.photos.length > 0 ? (
                        <div className="flex items-center gap-2">
                          {/* Main large thumbnail */}
                          <div className="relative w-16 h-12 rounded-xl border border-slate-300 shadow-lg overflow-hidden shrink-0 group hover:scale-105 hover:border-amber-500 transition-all cursor-pointer bg-white"
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
                              <div className="absolute right-1 bottom-1 bg-white text-slate-950 font-mono text-[9px] px-1.5 py-0.5 rounded-lg font-black border border-slate-300">
                                +{r.photos.length - 1}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-700 font-black uppercase tracking-widest italic">NO PHOTOS</span>
                      )}
                    </td>
                    <td className="py-4.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setActiveDetailPhotoIdx(0);
                            setSelectedRecordForView(r);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-950 text-[10px] font-black rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-slate-300 shadow-sm"
                          title="เปิดดูข้อมูลแบบละเอียด"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          ดูข้อมูล
                        </button>
                        
                        {onDeleteRecord && (
                          deleteConfirmId === r.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  onDeleteRecord(r.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg cursor-pointer shadow-lg shadow-rose-200/20 transition-all"
                              >
                                ยืนยัน
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1.5 bg-slate-200 hover:bg-slate-600 text-slate-500 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(r.id)}
                              className="p-2 hover:bg-rose-500/10 text-slate-700 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                              title="ลบบันทึก"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )
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
        </>
      )}

      {/* DETAILED MAINTENANCE VIEW MODAL */}
      {selectedRecordForView && createPortal(
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border-2 border-slate-900 w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-scale-up">
            
            {/* Header */}
            <div className="bg-white text-slate-950 p-5 border-b-2 border-slate-300 flex items-center justify-between select-none">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-amber-600" />
                <span className="font-extrabold text-sm uppercase tracking-wider text-slate-950">
                  🔍 รายละเอียดประวัติการซ่อมบำรุง ({selectedRecordForView.id})
                </span>
              </div>
              <button
                onClick={() => setSelectedRecordForView(null)}
                className="p-2 text-slate-500 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-slate-950">
              
              {/* Main 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Left Column: Data Fields */}
                <div className="space-y-5">
                  
                  {/* Status & Boat */}
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ชื่อเรือด่วน</span>
                      <span className="text-sm font-extrabold text-slate-950">🚢 เรือ {selectedRecordForView.boatName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">สถานะซ่อมทำ</span>
                      {getStatusBadge(selectedRecordForView.status, selectedRecordForView.id)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-slate-300">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">📅 วันที่แจ้งซ่อม</span>
                      <span className="text-xs font-bold text-slate-950">{selectedRecordForView.dateReported}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-300">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">⌚ เวลาแจ้งซ่อม</span>
                      <span className="text-xs font-bold text-slate-950">{selectedRecordForView.timeReported} น.</span>
                    </div>
                  </div>

                   <div className="space-y-4">
                    <div className="bg-white p-3 rounded-xl border border-slate-300">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">🔧 ประเภทการซ่อมบำรุง</span>
                      <span className="inline-block mt-1 px-3 py-1 text-xs font-bold bg-amber-100 text-amber-850 border border-amber-250 rounded-lg">
                        {selectedRecordForView.type}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-300">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">⚙️ ชิ้นส่วน / อุปกรณ์ที่ซ่อม</span>
                      <span className="inline-block mt-1 px-3 py-1 text-xs font-bold bg-white text-slate-950 border border-slate-300 rounded-lg">
                        {selectedRecordForView.partRepaired || 'ทั่วไป (ตรวจเช็ค)'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-300">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">👤 ผู้รับผิดชอบดูแล / ช่างผู้ซ่อม</span>
                    <span className="text-xs font-bold text-slate-950 mt-1 inline-block">
                      🏢 {selectedRecordForView.responsiblePerson}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-2">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">📝 อาการชำรุดที่พบ / ปัญหาที่แจ้ง</span>
                    <p className="text-xs text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                      {selectedRecordForView.details || '-'}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">🛠️ ผลการซ่อมบำรุง / ความคืบหน้าการทำงาน</span>
                    <p className="text-xs text-slate-950 font-bold whitespace-pre-line leading-relaxed">
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
                    <div className="space-y-4">
                      {/* Interactive Album Stage */}
                      <div className="relative aspect-video rounded-2xl border border-slate-300 overflow-hidden bg-white group shadow-2xl">
                        <img
                          src={selectedRecordForView.photos[activeDetailPhotoIdx]}
                          alt="Selected log photograph"
                          className="w-full h-full object-contain mx-auto"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setActivePhoto(selectedRecordForView.photos[activeDetailPhotoIdx])}
                          className="absolute right-3 bottom-3 bg-white/95 hover:bg-slate-100 border border-slate-300 text-slate-950 font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg select-none cursor-pointer transition-all hover:scale-105"
                        >
                          🔍 ขยายเต็มจอ
                        </button>
                      </div>

                      {/* Thumbnail Selectors Grid */}
                      <div className="grid grid-cols-4 gap-3">
                        {selectedRecordForView.photos.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveDetailPhotoIdx(idx)}
                            className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              activeDetailPhotoIdx === idx 
                                ? 'border-amber-500 ring-4 ring-amber-500/10 scale-105 shadow-lg' 
                                : 'border-slate-300 hover:border-slate-400'
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
                        
                        {/* Inline Add Photo Button in Thumbnails */}
                        <button
                          onClick={() => setIsAddingPhotoToRecord(true)}
                          className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-500/5 flex items-center justify-center text-slate-500 hover:text-amber-500 transition-all cursor-pointer"
                        >
                          <Plus className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-16 border-2 border-dashed border-slate-300 rounded-2xl text-center text-slate-500 bg-white">
                        <ImageIcon className="h-12 w-12 mx-auto text-slate-700 mb-3" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">ไม่มีรูปถ่ายแนบประกอบบันทึกนี้</p>
                      </div>
                      <button
                        onClick={() => setIsAddingPhotoToRecord(true)}
                        className="w-full py-3 bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        เพิ่มรูปภาพประกอบ (Add Photo)
                      </button>
                    </div>
                  )}

                  {/* Inline Photo Uploading for existing record */}
                  {isAddingPhotoToRecord && (
                    <div className="p-5 bg-white border border-slate-300 rounded-2xl space-y-4 animate-fade-in shadow-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">📤 อัปโหลดรูปภาพใหม่</span>
                        <button onClick={() => setIsAddingPhotoToRecord(false)} className="text-slate-500 hover:text-slate-950 transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-300">
                        <ImageUpload 
                          label="เลือกรูปภาพ" 
                          onImageSelected={(img) => setNewPhotoForRecord(img)} 
                        />
                      </div>
                      {newPhotoForRecord && (
                        <div className="flex gap-3">
                          <button
                            onClick={handleAddPhotoToRecord}
                            className="flex-1 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-all cursor-pointer shadow-lg shadow-amber-200/20"
                          >
                            ตกลง (Confirm)
                          </button>
                          <button
                            onClick={() => setNewPhotoForRecord(undefined)}
                            className="px-4 py-2.5 bg-white text-slate-500 border border-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                          >
                            ล้าง
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>

              {/* Footer */}
              <div className="border-t border-slate-300 pt-6 flex items-center justify-end select-none">
                <button
                  type="button"
                  onClick={() => setSelectedRecordForView(null)}
                  className="px-6 py-3 bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer shadow-md transition-all hover:scale-105"
                >
                  ปิดหน้าต่าง (Close)
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* NEW MAINTENANCE FORM DIALOG MODAL */}
      {isOpenForm && createPortal(
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <style>{`
            #maintenance-form-modal {
              background-color: #ffffff !important;
              border-color: #0f172a !important;
              color: #0f172a !important;
            }
            #maintenance-form-modal .bg-white,
            #maintenance-form-modal .bg-white {
              background-color: #f8fafc !important;
              border-color: #cbd5e1 !important;
              color: #0f172a !important;
            }
            #maintenance-form-modal input,
            #maintenance-form-modal select,
            #maintenance-form-modal textarea {
              background-color: #ffffff !important;
              color: #0f172a !important;
              border-color: #cbd5e1 !important;
            }
            #maintenance-form-modal select option {
              background-color: #ffffff !important;
              color: #0f172a !important;
            }
            #maintenance-form-modal .text-slate-950,
            #maintenance-form-modal .text-slate-700 {
              color: #0f172a !important;
            }
            #maintenance-form-modal .text-slate-950 {
              color: #0f172a !important;
            }
            #maintenance-form-modal .border-slate-300 {
              border-color: #cbd5e1 !important;
            }
            #maintenance-form-modal .px-6.py-5.bg-white,
            #maintenance-form-modal .px-5.py-5.bg-white,
            #maintenance-form-modal .bg-white.text-slate-950 {
              background-color: #f8fafc !important;
              border-bottom: 2px solid #cbd5e1 !important;
              border-top: 1px solid #cbd5e1 !important;
            }
          `}</style>
          <div 
            className="bg-white rounded-2xl border-2 border-slate-900 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-4 animate-scale-up"
            id="maintenance-form-modal"
          >
            
            {/* Header */}
            <div className="bg-white text-slate-950 p-5 border-b border-slate-300 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-amber-500" />
                <span className="font-extrabold text-sm uppercase tracking-wider text-slate-950">
                  เพิ่มบันทึกการซ่อมบำรุง / รายงานซ่อมเรือด่วน
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenForm(false)}
                className="p-2 text-slate-500 hover:text-slate-950 rounded-xl hover:bg-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden text-slate-700">
              
              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Date Reported */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      📅 วันที่แจ้งซ่อม (Date Reported)
                    </label>
                    <input type="date"
                      required
                      value={dateReported}
                      onChange={(e) => setDateReported(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-950 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Time Reported */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      ⌚ เวลาที่แจ้ง (Time)
                    </label>
                    <input type="time"
                      required
                      value={timeReported}
                      onChange={(e) => setTimeReported(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-950 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Boat Selection */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      🚢 เลือกเรือชำรุด (Vessel)
                    </label>
                    <select value={boatId}
                      onChange={(e) => setBoatId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-hidden focus:border-amber-600"
                    >
                      {BOATS.map((boat) => (
                        <option key={boat.id} value={boat.id}>
                          เรือ {boat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Maintenance Type */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      🔧 ประเภทงาน (Type)
                    </label>
                    <select value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-hidden focus:border-amber-600"
                    >
                      <option value="ตรวจสอบเรือ">ตรวจสอบเรือ (Inspection)</option>
                      <option value="ส่งซ่อม">ส่งซ่อม (Repair)</option>
                      <option value="อื่นๆ">อื่นๆ (Others)</option>
                    </select>
                  </div>

                  {/* Maintenance Status */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      📌 สถานะดำเนินการ (Status)
                    </label>
                    <select value={status}
                      onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-hidden focus:border-amber-600"
                    >
                      <option value="ดำเนินการแล้ว">ดำเนินการแล้ว (Completed)</option>
                      <option value="กำลังดำเนินการ">กำลังดำเนินการ (In Progress)</option>
                      <option value="รอคิว">รอคิว (Queued)</option>
                      <option value="ยกเลิก">ยกเลิก (Cancelled)</option>
                    </select>
                  </div>
                </div>

                {/* ระบบและอุปกรณ์ที่ซ่อม & ชิ้นส่วนที่ชำรุดแบบเป็นสองระดับ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      ⚙️ ระบบและอุปกรณ์ที่ซ่อม (System / Equipment)
                    </label>
                    <select value={systemRepaired}
                      onChange={(e) => handleSystemChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-hidden focus:border-amber-600"
                    >
                      {Object.keys(MAINTENANCE_SYSTEMS).map((sysKey) => (
                        <option key={sysKey} value={sysKey}>
                          {MAINTENANCE_SYSTEMS[sysKey].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      🔧 ชิ้นส่วนอะไหล่ที่เสียหาย (Damaged Part / Spare Part)
                    </label>
                    <select value={sparePartRepaired}
                      onChange={(e) => setSparePartRepaired(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-hidden focus:border-amber-600"
                    >
                      {(MAINTENANCE_SYSTEMS[systemRepaired]?.parts || []).map((part) => (
                        <option key={part} value={part}>
                          {part}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Details / Findings */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    📝 รายละเอียดอาการชำรุด / สิ่งที่พบ (Details / Findings)
                  </label>
                  <textarea placeholder="เช่น ยอยข้างขวาเรือชำรุด, น้ำรั่วเข้าห้องนายท้าย, แอร์เสีย"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-amber-600 whitespace-pre-line leading-relaxed"
                  ></textarea>
                </div>

                {/* Action Taken / Progress */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    🛠️ การดำเนินการแก้ไข / ผลการซ่อมบำรุง (Action Taken)
                  </label>
                  <textarea placeholder="เช่น ดำเนินการรื้อซ่อมเปลี่ยนลูกปืนใหม่, ช่างตัวเรืออุดรอยรั่วเสร็จสิ้นแล้ว"
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-amber-600 whitespace-pre-line leading-relaxed"
                  ></textarea>
                </div>

                {/* Responsible Person */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    👤 ผู้รับผิดชอบดำเนินการ (Responsible Person)
                  </label>
                  <input type="text"
                    placeholder="เช่น อู่เรือ, ช่างแอร์, ช่างกล, ผู้ช่วยช่าง..."
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-950 focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                {/* Cost */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    💰 ค่าใช้จ่ายซ่อมบำรุงโดยประมาณ (Estimated Cost - THB)
                  </label>
                  <input type="number"
                    min="0"
                    placeholder="เช่น 5000 (ใส่ 0 หรือเว้นว่างได้หากไม่มีค่าใช้จ่าย)"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-950 focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                {/* Image upload section (Album style) */}
                <div className="border-t border-slate-300 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-amber-500" />
                      อัลบั้มรูปถ่ายประกอบการซ่อมทำ (Photos Attachment)
                    </span>
                    <span className="text-[10px] font-bold text-slate-600">
                      รูปในอัลบั้ม: {selectedPhotos.length} รูป
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                    <div className="bg-white p-4 rounded-xl border border-slate-300">
                      <ImageUpload 
                        label="เพิ่มรูปถ่ายลงในอัลบั้ม"
                        onImageSelected={(base64) => setTempPhoto(base64)}
                        existingImage={undefined}
                      />
                      {tempPhoto && (
                        <button
                          type="button"
                          onClick={handleAddPhoto}
                          className="mt-3 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-xl border border-amber-700 cursor-pointer transition-all shadow-lg shadow-amber-200/20"
                        >
                          ➕ ดึงรูปนี้เข้าอัลบั้มหลัก
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-600 uppercase block">รูปที่เตรียมแนบกับประวัติ:</span>
                      {selectedPhotos.length === 0 ? (
                        <div className="p-10 border-2 border-dashed border-slate-300 rounded-xl text-center text-slate-600 text-[11px] bg-white">
                          ยังไม่มีรูปภาพในอัลบั้ม
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {selectedPhotos.map((img, idx) => (
                            <div key={idx} className="relative aspect-square border-2 border-slate-300 rounded-xl overflow-hidden group hover:border-amber-500 transition-colors">
                              <img
                                src={img}
                                alt={`attachment-${idx}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                className="absolute top-1 right-1 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-110"
                                title="ลบรูปนี้"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="border-t border-slate-300 p-5 bg-slate-50 flex items-center justify-end gap-3 select-none shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpenForm(false)}
                  className="px-6 py-2.5 bg-white hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-xl cursor-pointer border border-slate-300 transition-all"
                >
                  ยกเลิก (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold rounded-xl cursor-pointer border border-amber-700 shadow-lg shadow-amber-200/20 transition-all hover:scale-105 active:scale-95"
                >
                  💾 บันทึกประวัติ (Save)
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* PART REPAIR HISTORY MODAL */}
      {selectedPartForView && createPortal(
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border-2 border-slate-900 w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-scale-up">
            
            {/* Header */}
            <div className="bg-white text-slate-950 p-4.5 border-b-2 border-slate-300 flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <Wrench className="h-5 w-5 text-amber-500" />
                <span className="font-extrabold text-sm uppercase tracking-wider text-slate-950">
                  ประวัติการซ่อม: {selectedPartForView}
                </span>
              </div>
              <button
                onClick={() => setSelectedPartForView(null)}
                className="p-1.5 text-slate-500 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3 custom-scrollbar">
              {(() => {
                const relatedRecords = dashboardRecords.filter(r => {
                  const fullPart = r.partRepaired || 'ทั่วไป (ตรวจเช็ค)';
                  const system = fullPart.includes(' -> ') ? fullPart.split(' -> ')[0].trim() : fullPart.trim();
                  return system === selectedPartForView;
                });
                
                const sparePartGroups: { [spare: string]: typeof dashboardRecords } = {};
                relatedRecords.forEach(r => {
                  const fullPart = r.partRepaired || 'ทั่วไป (ตรวจเช็ค)';
                  const spare = fullPart.includes(' -> ') ? fullPart.split(' -> ')[1].trim() : fullPart.trim();
                  if (!sparePartGroups[spare]) sparePartGroups[spare] = [];
                  sparePartGroups[spare].push(r);
                });
                
                const sortedSpares = Object.keys(sparePartGroups).sort((a, b) => sparePartGroups[b].length - sparePartGroups[a].length);
                
                return sortedSpares.map(spare => (
                  <div key={spare} className="space-y-2 mb-4">
                    <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-1 flex justify-between items-center text-[13px]">
                      <span className="flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5 text-slate-400" /> {spare}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{sparePartGroups[spare].length} ครั้ง</span>
                    </h4>
                    <div className="space-y-2 pl-1">
                      {sparePartGroups[spare].map((record, idx) => (
                        <div key={idx} className="flex items-start justify-between p-3 border border-slate-200 rounded-sm hover:bg-slate-50 hover:border-amber-400 transition-colors cursor-pointer" onClick={() => {
                          setSelectedPartForView(null);
                          setSelectedRecordForView(record);
                        }}>
                          <div className="space-y-1">
                            <span className="text-sm font-extrabold text-slate-950 block">🚢 เรือ {record.boatName}</span>
                            <span className="text-xs text-slate-600 block line-clamp-1">{record.details || 'ไม่มีรายละเอียดเพิ่มเติม'}</span>
                            <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-300 px-2 py-0.5 rounded-full inline-block mt-1">
                              📅 {record.dateReported} {record.timeReported ? `เวลา ${record.timeReported} น.` : ''}
                            </span>
                          </div>
                          <div className="shrink-0 ml-4 flex flex-col items-end">
                            {getStatusBadge(record.status, record.id)}
                            {record.photos && record.photos.length > 0 && (
                              <span className="text-[9px] font-bold text-slate-500 mt-2 flex items-center gap-1"><ImageIcon className="h-3 w-3" /> {record.photos.length} รูป</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
            
            <div className="border-t border-slate-300 p-4 flex items-center justify-end bg-white">
              <button
                onClick={() => setSelectedPartForView(null)}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold rounded-sm border border-slate-950 cursor-pointer shadow-sm transition-all"
              >
                ปิดหน้าต่าง (Close)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* BOAT REPAIR HISTORY MODAL */}
      {selectedBoatForView && createPortal(
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <style>{`
            #boat-history-modal {
              background-color: #ffffff !important;
              border-color: #0f172a !important;
              color: #0f172a !important;
            }
            #boat-history-modal .bg-white,
            #boat-history-modal .bg-white {
              background-color: #f8fafc !important;
              border-color: #cbd5e1 !important;
              color: #0f172a !important;
            }
            #boat-history-modal .text-slate-950,
            #boat-history-modal .text-slate-700 {
              color: #0f172a !important;
            }
            #boat-history-modal .text-slate-950 {
              color: #0f172a !important;
            }
            #boat-history-modal .border-slate-300 {
              border-color: #cbd5e1 !important;
            }
            #boat-history-modal .bg-white.text-slate-950 {
              background-color: #f8fafc !important;
              border-bottom: 2px solid #cbd5e1 !important;
            }
          `}</style>
          <div 
            className="bg-white rounded-2xl border-2 border-slate-900 w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-scale-up"
            id="boat-history-modal"
          >
            
            {/* Header */}
            <div className="bg-white text-slate-950 p-5 border-b border-slate-300 flex items-center justify-between select-none">
              <div className="flex items-center gap-3">
                <Ship className="h-5 w-5 text-sky-400" />
                <span className="font-extrabold text-sm uppercase tracking-wider text-slate-950">
                  ประวัติการซ่อม: เรือ {selectedBoatForView}
                </span>
              </div>
              <button
                onClick={() => setSelectedBoatForView(null)}
                className="p-2 text-slate-500 hover:text-slate-950 rounded-xl hover:bg-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 custom-scrollbar bg-slate-100/50">
              {dashboardRecords.filter(r => (r.boatName || '').replace(/\s+/g, '').toUpperCase() === selectedBoatForView).map((record, idx) => (
                <div key={idx} className="flex items-start justify-between p-4 bg-white border border-slate-300 rounded-xl hover:border-sky-500/50 transition-all cursor-pointer group shadow-sm" onClick={() => {
                  setSelectedBoatForView(null);
                  setSelectedRecordForView(record);
                }}>
                  <div className="space-y-2">
                    <span className="text-sm font-extrabold text-slate-950 block group-hover:text-sky-400 transition-colors">🛠️ {record.partRepaired || 'ทั่วไป (ตรวจเช็ค)'}</span>
                    <span className="text-xs text-slate-500 block line-clamp-1">{record.details || 'ไม่มีรายละเอียดเพิ่มเติม'}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-300 px-3 py-1 rounded-lg inline-block mt-1 uppercase tracking-tight">
                      📅 {record.dateReported} {record.timeReported ? `• ${record.timeReported} น.` : ''}
                    </span>
                  </div>
                  <div className="shrink-0 ml-4 flex flex-col items-end gap-2">
                    {getStatusBadge(record.status, record.id)}
                    {record.photos && record.photos.length > 0 && (
                      <span className="text-[9px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-300 flex items-center gap-1.5"><ImageIcon className="h-3 w-3" /> {record.photos.length} รูป</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-300 p-5 flex items-center justify-end bg-white">
              <button
                onClick={() => setSelectedBoatForView(null)}
                className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer shadow-lg transition-all hover:scale-105"
              >
                ปิดหน้าต่าง (Close)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* LIGHTBOX FOR PREVIEWING ATTACHMENTS */}
      {activePhoto && createPortal(
        <div 
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 z-50 cursor-pointer animate-fade-in"
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white border-2 border-slate-900 p-2 shadow-2xl">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-slate-100 text-slate-950 rounded-full border border-slate-300 hover:scale-105 transition-all font-bold"
            >
              ✕
            </button>
            <div className="bg-white flex items-center justify-center overflow-hidden rounded-xl border border-slate-300">
              <img
                src={activePhoto}
                alt="Maintenance Record Zoomed"
                className="max-w-full max-h-[80vh] object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
