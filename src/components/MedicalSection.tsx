import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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

interface DefectStation {
  stationId: string;
  targetName: string;
  stationType: 'boat' | 'pier';
  location: string;
  status: MedicalItemStatus;
  expiry?: string;
  rawStation: MedicalKitStation;
}

interface MedicalItemCardProps {
  key?: string;
  item: any;
  totalCount: number;
  handleOpenInspect: (station: MedicalKitStation) => void;
}

function MedicalItemCard({ item, totalCount, handleOpenInspect }: MedicalItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const issuePercent = item.totalIssues > 0 && (totalCount - item.neverInspected) > 0
    ? Math.round((item.totalIssues / (totalCount - item.neverInspected)) * 100)
    : 0;

  return (
    <div className="bg-white p-3 rounded border border-slate-300 shadow-xl flex flex-col justify-between space-y-2.5 group hover:border-teal-500/50 transition-all">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-lg shrink-0">{item.icon}</span>
          <span className="font-bold text-xs text-slate-950 truncate" title={item.label}>
            {item.label.split(' (')[0]}
          </span>
        </div>
        {item.totalIssues > 0 ? (
          <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded-full font-mono animate-pulse">
            ชำรุด {item.totalIssues}
          </span>
        ) : (
          <span className="text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full">
            พร้อมใช้
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] font-black text-slate-500">
          <span>อัตราปัญหา: {issuePercent}%</span>
          <span>ชำรุด/ขาด/หมดอายุ</span>
        </div>
        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden flex border border-slate-300">
          <div 
            style={{ width: `${100 - issuePercent}%` }} 
            className="bg-emerald-500 h-full" 
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
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 border-t border-slate-300 text-[10px] text-slate-500 font-mono">
        <div className="flex justify-between">
          <span>ปกติ:</span>
          <span className="font-bold text-emerald-700">{item.normal}</span>
        </div>
        <div className="flex justify-between">
          <span>หมดอายุ:</span>
          <span className="font-bold text-rose-700">{item.expired}</span>
        </div>
        <div className="flex justify-between">
          <span>พร่อง:</span>
          <span className="font-bold text-amber-700">{item.lowStock}</span>
        </div>
        <div className="flex justify-between">
          <span>ขาด/ชำรุด:</span>
          <span className="font-bold text-orange-700">{item.missing + item.damaged}</span>
        </div>
      </div>

      {/* Defect Locations list */}
      <div className="border-t border-slate-300 pt-2 bg-white p-2 text-left rounded-b -mx-3 -mb-3 space-y-1.5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-wider hover:text-teal-700 cursor-pointer text-left select-none outline-hidden"
        >
          <span className="flex items-center gap-1">
            📍 ตำแหน่งที่พบจุดบกพร่อง ({item.defectStations?.length || 0} แห่ง):
          </span>
          <span className="text-slate-500 font-mono text-[8.5px] bg-white px-1 py-0.2 rounded-sm border border-slate-300">
            {isExpanded ? '▲ หุบ' : '▼ แสดง'}
          </span>
        </button>
        
        {isExpanded && (
          <div className="mt-1 space-y-1 animate-fadeIn">
            {item.defectStations && item.defectStations.length > 0 ? (
              <div className="space-y-1 max-h-[110px] overflow-y-auto scrollbar-thin pr-0.5">
                {item.defectStations.map((defect, dIdx) => {
                  let statusText = '';
                  let badgeColor = '';
                  if (defect.status === 'Expired') {
                    statusText = 'หมดอายุ';
                    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
                  } else if (defect.status === 'LowStock') {
                    statusText = 'ยาพร่อง';
                    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
                  } else if (defect.status === 'Missing') {
                    statusText = 'ขาดแคลน';
                    badgeColor = 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100';
                  } else if (defect.status === 'Damaged') {
                    statusText = 'ชำรุด';
                    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
                  }

                  return (
                    <div 
                      key={dIdx} 
                      className="flex items-center justify-between text-[10px] bg-white p-1 rounded border border-slate-300 hover:border-teal-500 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[8px] font-bold px-1 rounded-xs flex-shrink-0 border ${
                          defect.stationType === 'boat' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200'
                        }`}>
                          {defect.stationId}
                        </span>
                        <span className="font-extrabold text-slate-700 truncate" title={defect.targetName}>
                          {defect.targetName}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleOpenInspect(defect.rawStation)}
                        className={`px-1 py-0.2 rounded-xs border text-[8px] font-extrabold cursor-pointer transition-all shrink-0 ${badgeColor}`}
                        title="คลิกเพื่อลงบันทึกการตรวจเช็คแก้ไขด่วน"
                      >
                        {statusText} 🔧
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1 py-0.5">
                <span>✅ ครบถ้วนพร้อมใช้ทุกจุดติดตั้ง</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MedicalSectionProps {
  stations: MedicalKitStation[];
  onSaveInspection: (record: Omit<MedicalInspectionRecord, 'id'>) => void;
  onDeleteInspection: (id: string) => void;
  history: MedicalInspectionRecord[];
  initialStationId?: string | null;
  onClearInitialStationId?: () => void;
  activeSubTab?: 'dashboard' | 'forms';
  onActiveSubTabChange?: (tab: 'dashboard' | 'forms') => void;
  defaultStationTypeFilter?: 'all' | 'boat' | 'pier';
}

export default function MedicalSection({
  stations,
  onSaveInspection,
  onDeleteInspection,
  history,
  initialStationId,
  onClearInitialStationId,
  activeSubTab,
  onActiveSubTabChange,
  defaultStationTypeFilter,
}: MedicalSectionProps) {
  const [stationTypeFilter, setStationTypeFilter] = useState<'all' | 'boat' | 'pier'>(defaultStationTypeFilter || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pass' | 'Fail' | 'NeverInspected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [medYearFilter, setMedYearFilter] = useState('all');
  const [medMonthFilter, setMedMonthFilter] = useState('all');
  const [medGroupedView, setMedGroupedView] = useState(true);
  const [showMedDashboard, setShowMedDashboard] = useState(true);
  
  const [internalActiveSubTab, setInternalActiveSubTab] = useState<'dashboard' | 'forms'>('dashboard');
  const medicalActiveSubTab = activeSubTab !== undefined ? activeSubTab : internalActiveSubTab;
  const setMedicalActiveSubTab = onActiveSubTabChange !== undefined ? onActiveSubTabChange : setInternalActiveSubTab;
  
  // Sync filter when defaultStationTypeFilter prop changes
  React.useEffect(() => {
    if (defaultStationTypeFilter) {
      setStationTypeFilter(defaultStationTypeFilter);
    }
  }, [defaultStationTypeFilter]);

  // Inspection Modal States
  const [inspectingStation, setInspectingStation] = useState<MedicalKitStation | null>(null);
  const [inspectorName, setInspectorName] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState<string | null>(null);

  // Effect to handle auto-opening modal when navigated with a station ID
  React.useEffect(() => {
    if (initialStationId) {
      const targetStation = stations.find(s => s.id === initialStationId);
      if (targetStation) {
        handleOpenInspect(targetStation);
        setMedicalActiveSubTab('forms');
      }
      if (onClearInitialStationId) {
        onClearInitialStationId();
      }
    }
  }, [initialStationId, stations]);
  
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
      case 'Normal': return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-black';
      case 'LowStock': return 'bg-amber-50 text-amber-700 border-amber-200 font-black';
      case 'Expired': return 'bg-rose-50 text-rose-700 border-rose-200 font-black';
      case 'Missing': return 'bg-orange-50 text-orange-700 border-orange-200 font-black';
      case 'Damaged': return 'bg-rose-50 text-rose-700 border-rose-200 font-black';
      default: return 'bg-white text-slate-500 border-slate-300 font-black';
    }
  };

  // Filter stations by type filter first, so dashboard metrics and stats match the tab
  const stationsOfCurrentType = React.useMemo(() => {
    if (stationTypeFilter === 'all') return stations;
    return stations.filter(s => s.stationType === stationTypeFilter);
  }, [stations, stationTypeFilter]);

  // Filtered stations logic
  const filteredStations = stationsOfCurrentType.filter((st) => {
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
  const totalCount = stationsOfCurrentType.length;
  const boatCount = stationsOfCurrentType.filter((s) => s.stationType === 'boat').length;
  const pierCount = stationsOfCurrentType.filter((s) => s.stationType === 'pier').length;
  const passCount = stationsOfCurrentType.filter((s) => s.overallStatus === 'Pass').length;
  const failCount = stationsOfCurrentType.filter((s) => s.overallStatus === 'Fail').length;
  const pendingCount = stationsOfCurrentType.filter((s) => s.overallStatus === 'NeverInspected').length;

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
    const defectStations: Array<{
      stationId: string;
      targetName: string;
      stationType: 'boat' | 'pier';
      location: string;
      status: MedicalItemStatus;
      expiry?: string;
      rawStation: MedicalKitStation;
    }> = [];

    stationsOfCurrentType.forEach(s => {
      const status = s[item.keyStatus as keyof MedicalKitStation] as MedicalItemStatus | undefined;
      if (s.overallStatus === 'NeverInspected') {
        neverInspected++;
      } else if (status === 'Normal') {
        normal++;
      } else {
        if (status === 'Expired') {
          expired++;
        } else if (status === 'LowStock') {
          lowStock++;
        } else if (status === 'Missing') {
          missing++;
        } else if (status === 'Damaged') {
          damaged++;
        } else {
          normal++;
          return;
        }

        const expiry = item.keyExpiry ? (s[item.keyExpiry as keyof MedicalKitStation] as string || '') : undefined;
        defectStations.push({
          stationId: s.id,
          targetName: s.targetName,
          stationType: s.stationType,
          location: s.location,
          status: status || 'Damaged',
          expiry,
          rawStation: s
        });
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
      totalIssues,
      defectStations
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
  stationsOfCurrentType.forEach(s => {
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

  const normalStations = stationsOfCurrentType.filter(s => s.overallStatus === 'Pass');
  const pendingStations = stationsOfCurrentType.filter(s => s.overallStatus === 'NeverInspected');

  return (
    <div className="space-y-6 animate-fade-in" id="medical-inspection-module">
      
      {/* Title & Banner - only show if not controlled externally */}
      {activeSubTab === undefined && (
        <div className="bg-gradient-to-r from-teal-800 to-cyan-900 text-white rounded p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm">MED-HEALTH</span>
              <span className="text-teal-300 font-mono text-xs">Chao Phraya Tourist Boat Co., Ltd.</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-sans mt-1.5 tracking-tight">
              งานตรวจสอบยาเวชภัณฑ์และอุปกรณ์ปฐมพยาบาล (Marine Medical Kits Audit)
            </h2>
            <p className="text-xs text-slate-700 max-w-xl mt-1 leading-normal">
              ระบบประสานงานบันทึกผลประจำตู้ยาปฐมพยาบาลสำหรับเรือล่องแก่งท่องเที่ยวจำนวน 7 ลำ และส่วนท่าเทียบเรือประสานงาน 11 ท่า รวมเป็น 18 จุดยุทธศาสตร์
            </p>
          </div>
          <div className="flex items-center gap-2 py-1 px-3 bg-teal-50 rounded border border-teal-200 font-mono text-[11px] text-teal-200">
            <Calendar className="h-4 w-4" />
            <span>วันที่อ้างอิงล่าสุด: {new Date().toLocaleDateString('th-TH')}</span>
          </div>
        </div>
      )}

      {/* Tab Selector - only show if not controlled externally */}
      {activeSubTab === undefined && (
        <div className="flex border border-slate-300 bg-white rounded-xl p-1 shadow-3xs mb-4">
          <button
            onClick={() => setMedicalActiveSubTab('dashboard')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all cursor-pointer select-none ${
              medicalActiveSubTab === 'dashboard'
                ? 'bg-teal-600 text-white font-extrabold shadow-sm'
                : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100 font-semibold'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-base">📊</span>
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-extrabold leading-tight">แดชบอร์ดสรุปสถิติและวิเคราะห์ผล</span>
                <span className="block text-[9px] font-medium font-mono opacity-80 uppercase leading-none mt-0.5">Dashboard & Insights</span>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setMedicalActiveSubTab('forms')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all cursor-pointer select-none ${
              medicalActiveSubTab === 'forms'
                ? 'bg-teal-600 text-white font-extrabold shadow-sm'
                : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100 font-semibold'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-base">📋</span>
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-extrabold leading-tight">บันทึกการตรวจเช็ครายจุดติดตั้ง</span>
                <span className="block text-[9px] font-medium font-mono opacity-80 uppercase leading-none mt-0.5">Inspection & Audit Forms</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {medicalActiveSubTab === 'dashboard' ? (
        <div className="space-y-6 animate-fade-in">
          {/* Metrics Summary Panels */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded border border-slate-300 border-l-4 border-l-teal-600 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-sm hidden sm:block border border-teal-200">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider leading-none mb-1">จุดติดตั้งทั้งหมด</span>
            <span className="text-xl font-bold font-mono text-slate-950">{totalCount} จุด</span>
            <span className="text-[9px] text-slate-500 block">เรือ 7 ลำ / ท่าเรือ 11 ท่า</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded border border-slate-300 border-l-4 border-l-emerald-600 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-sm hidden sm:block border border-emerald-200">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider leading-none mb-1">ผ่านเกณฑ์สมบูรณ์</span>
            <span className="text-xl font-bold font-mono text-emerald-700">{passCount} จุด</span>
            <span className="text-[9px] text-slate-500 block">ยาครบ เวชภัณฑ์พร้อมใช้งาน</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded border border-slate-300 border-l-4 border-l-rose-600 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-rose-50 text-rose-700 rounded-sm hidden sm:block border border-rose-200">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider leading-none mb-1">พบค้างปรับปรุง (Defects)</span>
            <span className="text-xl font-bold font-mono text-rose-700">{failCount} จุด</span>
            <span className="text-[9px] text-slate-500 block">ยาพร่อง/หมดอายุ หรือของชำรุด</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded border border-slate-300 border-l-4 border-l-amber-500 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-sm hidden sm:block border border-amber-200">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider leading-none mb-1">รอตรวจเช็คในรอบเดือน</span>
            <span className="text-xl font-bold font-mono text-amber-500">{pendingCount} จุด</span>
            <span className="text-[9px] text-slate-500 block">ยังไม่ได้ทำการตรวจสอบ</span>
          </div>
        </div>
      </div>

      {/* Collapsible Dashboard Toggle Button */}
      <button
        onClick={() => setShowMedDashboard(!showMedDashboard)}
        className="w-full bg-white hover:bg-slate-100 border border-slate-300 p-4 rounded flex items-center justify-between text-left transition-all shadow-xl cursor-pointer focus:outline-none group"
      >
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-teal-50 text-teal-700 rounded border border-teal-200 group-hover:border-teal-500/50">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-extrabold text-sm text-slate-950 tracking-tight flex items-center gap-2">
              📊 แดชบอร์ดสรุปผลการตรวจสอบยาเวชภัณฑ์และอุปกรณ์ปฐมพยาบาล (Interactive Dashboard)
              <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold border border-teal-200">
                วิเคราะห์เชิงรุก
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5 tracking-wider">
              วิเคราะห์ความเสี่ยงรายเวชภัณฑ์, แสดงรายงานจุดติดตั้งที่ปกติสมบูรณ์ และจุดบกพร่องที่ต้องเร่งแก้ไข
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
            {showMedDashboard ? '🙈 ซ่อนแดชบอร์ด (Hide)' : '👀 แสดงแดชบอร์ด (Show)'}
          </span>
        </div>
      </button>

      {/* Interactive Medical Dashboard Body */}
      {showMedDashboard && (
        <div className="bg-white border border-slate-300 rounded-2xl p-5 space-y-5 animate-fade-in shadow-sm transition-all duration-300">
          {/* Dashboard Tabs Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 pb-3">
            <div className="flex flex-wrap gap-1.5 p-0.5 bg-white rounded-lg border border-slate-300">
              <button
                onClick={() => setActiveDashTab('stats')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  activeDashTab === 'stats'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                📈 วิเคราะห์สถานะเวชภัณฑ์ (Supply Health)
              </button>
              <button
                onClick={() => setActiveDashTab('defects')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeDashTab === 'defects'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                🚨 รายงานจุดที่พบปัญหาต้องแก้ไข
                <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-mono font-bold ${
                  activeDashTab === 'defects' ? 'bg-rose-50 text-slate-950 border border-rose-200' : 'bg-rose-50 text-rose-500 border border-rose-200'
                }`}>
                  {defectDetails.length}
                </span>
              </button>
              <button
                onClick={() => setActiveDashTab('normal')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeDashTab === 'normal'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                ✅ รายงานจุดที่ปกติสมบูรณ์
                <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-mono font-bold ${
                  activeDashTab === 'normal' ? 'bg-emerald-50 text-slate-950 border border-emerald-200' : 'bg-emerald-50 text-emerald-500 border border-emerald-200'
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
              <div className="bg-white p-3.5 rounded border border-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-950">🔎 บทวิเคราะห์ภาพรวมการตรวจยาเวชภัณฑ์ของเรือท่องเที่ยวและท่าเทียบเรือ</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    จากการตรวจสอบจุดบริการยาและกล่องปฐมพยาบาลทั้งหมด {totalCount} จุด มีจุดที่มีเวชภัณฑ์ครบถ้วนสมบูรณ์พร้อมใช้งานจำนวน <span className="text-emerald-700 font-bold">{passCount} จุด ({((passCount / totalCount) * 100).toFixed(0)}%)</span>, 
                    พบข้อบกพร่อง/ค้างปรับปรุง <span className="text-rose-700 font-bold">{failCount} จุด ({((failCount / totalCount) * 100).toFixed(0)}%)</span>, 
                    และยังรอการตรวจสอบในรอบนี้อีก <span className="text-amber-700 font-bold">{pendingCount} จุด ({((pendingCount / totalCount) * 100).toFixed(0)}%)</span>
                  </p>
                </div>
                
                {/* Key stat card inside info */}
                <div className="bg-white p-2.5 rounded border border-slate-300 flex items-center gap-3 w-full md:w-auto shrink-0 shadow-inner">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">รายการที่มีปัญหาบ่อยที่สุด</span>
                    <span className="text-xs font-bold text-slate-950">
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
                {itemStats.map((item) => (
                  <MedicalItemCard
                    key={item.key}
                    item={item}
                    totalCount={totalCount}
                    handleOpenInspect={handleOpenInspect}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Defect Report (จุดที่พบปัญหาต้องแก้ไข) */}
          {activeDashTab === 'defects' && (
            <div className="space-y-4">
              {/* Toggle View Mode for Defects */}
              <div className="flex items-center justify-between bg-white p-3 border border-slate-300 rounded shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">รูปแบบการดูจุดบกพร่อง:</span>
                </div>
                <div className="flex gap-1 bg-white p-0.5 rounded border border-slate-300 shadow-inner">
                  <button
                    onClick={() => setMedGroupedView(true)}
                    className={`px-3 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                      medGroupedView
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-950 hover:bg-white'
                    }`}
                  >
                    📦 จัดกลุ่มตามชนิดยา (By Medicine)
                  </button>
                  <button
                    onClick={() => setMedGroupedView(false)}
                    className={`px-3 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                      !medGroupedView
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-950 hover:bg-white'
                    }`}
                  >
                    📍 แยกตามพื้นที่/สถานี (By Area/Station)
                  </button>
                </div>
              </div>

              {defectDetails.length === 0 ? (
                <div className="py-10 text-center bg-white border border-slate-300 rounded flex flex-col items-center justify-center space-y-2 shadow-inner">
                  <span className="text-3xl">🎉</span>
                  <div className="text-sm font-bold text-emerald-700">สุดยอด! ไม่พบตู้ยาที่มีเวชภัณฑ์ชำรุดหรือขาดแคลนในขณะนี้</div>
                  <p className="text-xs text-slate-500 max-w-sm">ตู้ยาและจุดติดตั้งทั้งหมดที่ผ่านการตรวจสอบมีอุปกรณ์ครบถ้วนสมบูรณ์ 100%</p>
                </div>
              ) : medGroupedView ? (
                // Grouped by Medicine View
                <div className="space-y-4">
                  {medicalItems.map(item => {
                    const defectsForItem = defectDetails.filter(d => d.itemKey === item.key);
                    if (defectsForItem.length === 0) return null;

                    return (
                      <div key={item.key} className="bg-white border border-slate-300 rounded shadow-xl overflow-hidden">
                        {/* Medicine Group Header */}
                        <div className="p-3.5 bg-rose-50/20 border-b border-rose-200/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg leading-none">{item.icon}</span>
                            <h4 className="font-extrabold text-sm text-rose-200">
                              {item.label}
                            </h4>
                          </div>
                          <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-mono font-black">
                            ขาด/ชำรุด {defectsForItem.length} จุดติดตั้ง
                          </span>
                        </div>

                        {/* List of Stations Lacking/Defective for this Medicine */}
                        <div className="divide-y divide-slate-800/50">
                          {defectsForItem.map((defect, idx) => {
                            let statusLabelText = '';
                            let statusColor = '';

                            switch (defect.issueType) {
                              case 'Expired':
                                statusLabelText = `❌ หมดอายุ (Expiry: ${defect.expiryDate || '-'})`;
                                statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
                                break;
                              case 'LowStock':
                                statusLabelText = '⚠️ ยาพร่อง/ใกล้หมด (Low Stock)';
                                statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
                                break;
                              case 'Missing':
                                statusLabelText = '🚫 สูญหาย/ไม่มีสำรอง';
                                statusColor = 'text-orange-700 bg-orange-50 border-orange-200';
                                break;
                              case 'Damaged':
                                statusLabelText = '💔 ชำรุด/เปิดซองใช้แล้ว';
                                statusColor = 'text-rose-500 bg-rose-50/40 border-rose-200';
                                break;
                              default:
                                statusLabelText = defect.issueType;
                                statusColor = 'text-slate-500 bg-white border-slate-300';
                            }

                            return (
                              <div key={idx} className="p-4 hover:bg-slate-100/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs transition-colors">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded-md border tracking-tighter ${
                                      defect.stationType === 'boat' 
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                        : 'bg-teal-50 text-teal-700 border-teal-200'
                                    }`}>
                                      {defect.stationId}
                                    </span>
                                    <span className="font-black text-slate-950 text-sm tracking-tight truncate" title={defect.targetName}>
                                      {defect.targetName}
                                    </span>
                                    <span className="text-slate-950 font-mono">|</span>
                                    <span className="text-slate-500 font-black truncate" title={defect.location}>
                                      {defect.location}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-600 font-black uppercase tracking-widest text-[9px]">สถานะตัวยา:</span>
                                    <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-black uppercase tracking-widest font-mono shadow-sm ${statusColor}`}>
                                      {statusLabelText}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleOpenInspect(defect.rawStation)}
                                  className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 px-4 py-2 rounded-lg text-[10px] font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-200/20 uppercase tracking-widest font-mono"
                                >
                                  🔧 REFILL / FIX
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Flat List View
                <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-4 bg-rose-50/20 border-b border-rose-200/50 flex items-center justify-between">
                    <h4 className="font-black text-xs text-rose-700 flex items-center gap-2 uppercase tracking-widest">
                      <AlertTriangle className="h-4 w-4 animate-pulse" />
                      รายงานเวชภัณฑ์ค้างแก้ไข ({defectDetails.length} รายการ)
                    </h4>
                    <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full font-mono font-black uppercase tracking-widest shadow-inner">
                      Action Required
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/50 max-h-[450px] overflow-y-auto custom-scrollbar">
                    {defectDetails.map((defect, idx) => {
                      let statusLabelText = '';
                      let statusColor = '';

                      switch (defect.issueType) {
                        case 'Expired':
                          statusLabelText = `❌ EXPIRED (${defect.expiryDate || '-'})`;
                          statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
                          break;
                        case 'LowStock':
                          statusLabelText = '⚠️ LOW STOCK';
                          statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
                          break;
                        case 'Missing':
                          statusLabelText = '🚫 MISSING';
                          statusColor = 'text-orange-700 bg-orange-50 border-orange-200';
                          break;
                        case 'Damaged':
                          statusLabelText = '💔 DAMAGED';
                          statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
                          break;
                        default:
                          statusLabelText = defect.issueType;
                          statusColor = 'text-slate-500 bg-white border-slate-300';
                      }

                      return (
                        <div key={idx} className="p-5 hover:bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs transition-colors">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border font-mono tracking-tighter ${
                                defect.stationType === 'boat' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200'
                              }`}>
                                {defect.stationId}
                              </span>
                              <strong className="text-slate-950 text-sm font-black tracking-tight">{defect.targetName}</strong>
                              <span className="text-slate-950 font-mono">•</span>
                              <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">{defect.location}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-600 font-black uppercase tracking-widest text-[9px]">เวชภัณฑ์:</span>
                              <span className="font-black text-slate-950 uppercase tracking-tight">{defect.itemName}</span>
                              <span className="text-slate-950">|</span>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-black font-mono shadow-sm ${statusColor}`}>
                                {statusLabelText}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenInspect(defect.rawStation)}
                            className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 px-4 py-2 rounded-lg text-[10px] font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-200/20 uppercase tracking-widest font-mono"
                          >
                            🔧 FIX NOW
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
                <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 bg-emerald-50/20 border-b border-emerald-200/50 flex items-center justify-between">
                    <h4 className="font-black text-xs text-emerald-700 flex items-center gap-2 uppercase tracking-widest">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      ผ่านเกณฑ์ปกติ ({normalStations.length} จุด)
                    </h4>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-mono font-black uppercase tracking-widest shadow-inner">
                      100% READY
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/50 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {normalStations.length === 0 ? (
                      <div className="py-16 text-center text-xs text-slate-500 font-black uppercase tracking-widest">ยังไม่พบคลังที่สมบูรณ์ 100%</div>
                    ) : (
                      normalStations.map((st) => (
                        <div key={st.id} className="p-4 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-950 text-sm tracking-tight">{st.targetName}</span>
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-mono font-black uppercase">PASS</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{st.location}</p>
                          </div>
                          <div className="text-right text-[10px] text-slate-500 font-mono font-black">
                            <span className="block text-slate-700 uppercase">LAST: {st.lastInspectedDate || '-'}</span>
                            <span className="text-[9px] block text-slate-600 uppercase tracking-tighter">BY: {st.lastInspector || '-'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Part B: Pending Points */}
                <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 bg-amber-50/20 border-b border-amber-200/50 flex items-center justify-between">
                    <h4 className="font-black text-xs text-amber-700 flex items-center gap-2 uppercase tracking-widest">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      ค้างตรวจเช็ค ({pendingStations.length} จุด)
                    </h4>
                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-mono font-black uppercase tracking-widest shadow-inner">
                      PENDING
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/50 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {pendingStations.length === 0 ? (
                      <div className="py-16 text-center text-xs text-slate-500 font-black uppercase tracking-widest">ไม่มีจุดค้างตรวจสอบในระบบ</div>
                    ) : (
                      pendingStations.map((st) => (
                        <div key={st.id} className="p-4 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors">
                          <div className="space-y-1">
                            <strong className="text-slate-950 text-sm font-black tracking-tight block">{st.targetName}</strong>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{st.location}</p>
                          </div>
                          
                          <button
                            onClick={() => handleOpenInspect(st)}
                            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-[10px] font-black cursor-pointer transition-all border border-amber-500 shadow-lg shadow-amber-200/20 uppercase tracking-widest font-mono"
                          >
                            📋 INSPECT
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

        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Workspace Area: Search, Filters & Interactive Grid */}
          <div className="bg-white border rounded-2xl border-slate-300 shadow-2xl overflow-hidden" id="medical-workspace-inner">
        {/* Navigation & Toolbar Header */}
        <div className="p-5 border-b border-slate-300 bg-white sm:flex sm:items-center sm:justify-between space-y-4 sm:space-y-0 gap-6">
          
          {/* Quick Tabs Toggle or Static Filter Label */}
          {defaultStationTypeFilter && defaultStationTypeFilter !== 'all' ? (
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl shadow-inner select-none">
              {defaultStationTypeFilter === 'boat' ? (
                <>
                  <BoatIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                    รายการตู้เวชภัณฑ์บนเรือ (BOAT KITS)
                  </span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                    รายการตู้เวชภัณฑ์บนท่าเรือ (PIER KITS)
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="flex rounded-xl p-1 bg-white border border-slate-300 shadow-inner max-w-md w-full">
              <button
                onClick={() => setStationTypeFilter('all')}
                className={`flex-1 text-[11px] font-black px-4 py-2 rounded-lg cursor-pointer transition-all uppercase tracking-widest ${
                  stationTypeFilter === 'all' 
                    ? 'bg-white text-slate-950 shadow-lg' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                ALL ({totalCount})
              </button>
              <button
                onClick={() => setStationTypeFilter('boat')}
                className={`flex-1 text-[11px] font-black px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 justify-center uppercase tracking-widest ${
                  stationTypeFilter === 'boat' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200/40' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <BoatIcon className="w-4 h-4" />
                BOATS ({boatCount})
              </button>
              <button
                onClick={() => setStationTypeFilter('pier')}
                className={`flex-1 text-[11px] font-black px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 justify-center uppercase tracking-widest ${
                  stationTypeFilter === 'pier' 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <MapPin className="w-4 h-4" />
                PIERS ({pierCount})
              </button>
            </div>
          )}

          {/* Filtering and Query Block */}
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            
            {/* Status Select Filter */}
            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs shadow-inner focus-within:border-indigo-500 transition-colors">
              <Filter className="h-4 w-4 text-slate-500" />
              <select value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-[11px] font-black text-slate-700 outline-none cursor-pointer uppercase tracking-widest"
              >
                <option value="all">กรองทุกสถานะ (ALL STATUS)</option>
                <option value="Pass">ผ่านเกณฑ์สมบูรณ์ (PASS)</option>
                <option value="Fail">พบค้างปรับปรุง (FAIL)</option>
                <option value="NeverInspected">ยังไม่ตรวจเช็ค (PENDING)</option>
              </select>
            </div>

            {/* Keyword Search Input */}
            <div className="relative text-xs w-full sm:w-64 group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none group-focus-within:text-indigo-700 transition-colors">
                <Search className="h-4 w-4" />
              </span>
              <input type="text"
                placeholder="SEARCH STATIONS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 w-full bg-white text-slate-950 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 text-[11px] font-black placeholder:text-slate-700 transition-all shadow-inner tracking-widest"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 inset-y-0 flex items-center text-slate-500 hover:text-slate-950 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stations Cards List Container */}
        <div className="p-6 bg-white">
          
          {filteredStations.length === 0 ? (
            <div className="py-20 text-center bg-white border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center space-y-4 shadow-inner">
              <AlertCircle className="h-10 w-10 text-slate-700 animate-pulse" />
              <div className="text-sm font-black text-slate-500 uppercase tracking-widest">ไม่พบจุดตรวจสอบที่ระบุ</div>
              <p className="text-xs text-slate-600 max-w-xs font-black uppercase tracking-tight">ทดลองลบคำค้นหา ย้ายสถานะตัวกรอง หรือเปลี่ยนแท็บ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {filteredStations.map((st) => {
                const isBoat = st.stationType === 'boat';
                
                return (
                  <div
                    key={st.id}
                    className="bg-white border rounded-2xl border-slate-300 transition-all hover:shadow-2xl hover:shadow-indigo-200/10 hover:border-slate-300 flex flex-col justify-between overflow-hidden group"
                    id={`med-card-${st.id}`}
                  >
                    
                    {/* Header bar colored by overall status */}
                    <div className="p-4 bg-white border-b border-slate-300 flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-md border tracking-tighter ${
                            isBoat 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                              : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}>
                            {st.id}
                          </span>
                          
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-mono">
                            {isBoat ? 'VESSEL' : 'PIER'}
                          </span>
                        </div>

                        <h3 className="font-black text-sm text-slate-950 mt-1.5 flex items-center gap-2 truncate tracking-tight">
                          {isBoat && <BoatIcon className="h-4 w-4 text-indigo-700 flex-shrink-0" />}
                          {!isBoat && <MapPin className="h-4 w-4 text-teal-700 flex-shrink-0" />}
                          <span className="truncate">{st.targetName}</span>
                        </h3>
                      </div>

                      {/* Overall Status Badge */}
                      <span className={`text-[9px] font-black rounded-lg px-2.5 py-1 border flex-shrink-0 uppercase font-mono tracking-widest shadow-sm ${
                        st.overallStatus === 'Pass'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : st.overallStatus === 'Fail'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {st.overallStatus === 'Pass' ? 'PASS' : st.overallStatus === 'Fail' ? 'FAIL' : 'PENDING'}
                      </span>
                    </div>

                    {/* Central Body Specifying Items Status Matrix */}
                    <div className="p-5 space-y-4 flex-1 bg-white">
                      <div>
                        <span className="text-[9px] block text-slate-600 font-black uppercase tracking-widest font-mono">LOCATION</span>
                        <span className="text-xs text-slate-950 font-black block truncate mt-1 tracking-tight" title={st.location}>{st.location}</span>
                      </div>

                      {/* Items status checks container */}
                      <div className="border-t border-slate-300 pt-4 space-y-3">
                        <span className="text-[9px] block text-slate-600 font-black uppercase tracking-widest font-mono">SUPPLY CHECKLIST</span>
                        
                        {st.overallStatus === 'NeverInspected' ? (
                          <div className="py-4 text-center bg-white text-slate-600 font-black rounded-xl text-[10px] font-mono border border-slate-300 uppercase tracking-widest">
                            ⚠️ Awaiting inspection
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-[9px]">
                            
                            <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-300 shadow-sm group-hover:border-indigo-200 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-950 font-black truncate uppercase tracking-tighter" title="ยาพาราเซตามอล">💊 พาราเซตามอล</span>
                                <span className={`px-1.5 rounded-md border text-[8px] leading-tight flex-shrink-0 font-black font-mono ${
                                  st.paracetamolStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {st.paracetamolStatus === 'Normal' ? 'ปกติ' : 'ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-500 font-black font-mono mt-1 uppercase">หมดอายุ: {st.paracetamolExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-300 shadow-sm group-hover:border-indigo-200 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-950 font-black truncate uppercase tracking-tighter" title="ยาแก้เมาเรือ">🤢 ยาแก้เมาเรือ</span>
                                <span className={`px-1.5 rounded-md border text-[8px] leading-tight flex-shrink-0 font-black font-mono ${
                                  st.motionSicknessStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {st.motionSicknessStatus === 'Normal' ? 'ปกติ' : 'ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-500 font-black font-mono mt-1 uppercase">หมดอายุ: {st.motionSicknessExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-300 shadow-sm group-hover:border-indigo-200 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-950 font-black truncate uppercase tracking-tighter" title="แอมโมเนียหอม">👃 แอมโมเนียหอม</span>
                                <span className={`px-1.5 rounded-md border text-[8px] leading-tight flex-shrink-0 font-black font-mono ${
                                  st.ammoniaStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {st.ammoniaStatus === 'Normal' ? 'ปกติ' : 'ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-500 font-black font-mono mt-1 uppercase">หมดอายุ: {st.ammoniaExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-300 shadow-sm group-hover:border-indigo-200 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-950 font-black truncate uppercase tracking-tighter" title="พลาสเตอร์ปิดแผล">🩹 พลาสเตอร์ปิดแผล</span>
                                <span className={`px-1.5 rounded-md border text-[8px] leading-tight flex-shrink-0 font-black font-mono ${
                                  st.bandagesStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {st.bandagesStatus === 'Normal' ? 'ปกติ' : 'ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-500 font-black font-mono mt-1 uppercase">หมดอายุ: {st.bandagesExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-300 shadow-sm group-hover:border-indigo-200 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-950 font-black truncate uppercase tracking-tighter" title="ยาลดกรด">🥛 ยาลดกรด</span>
                                <span className={`px-1.5 rounded-md border text-[8px] leading-tight flex-shrink-0 font-black font-mono ${
                                  st.antacidStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {st.antacidStatus === 'Normal' ? 'ปกติ' : 'ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-500 font-black font-mono mt-1 uppercase">หมดอายุ: {st.antacidExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-300 shadow-sm group-hover:border-indigo-200 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-950 font-black truncate uppercase tracking-tighter" title="สำลีก้าน">🎋 สำลีก้าน</span>
                                <span className={`px-1.5 rounded-md border text-[8px] leading-tight flex-shrink-0 font-black font-mono ${
                                  st.cottonBudsStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {st.cottonBudsStatus === 'Normal' ? 'ปกติ' : 'ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-500 font-black font-mono mt-1 uppercase">หมดอายุ: {st.cottonBudsExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-300 shadow-sm group-hover:border-indigo-200 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-950 font-black truncate uppercase tracking-tighter" title="ยาเบตาดีนล้างแผล">🟤 เบตาดีน</span>
                                <span className={`px-1.5 rounded-md border text-[8px] leading-tight flex-shrink-0 font-black font-mono ${
                                  st.betadineStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {st.betadineStatus === 'Normal' ? 'ปกติ' : 'ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-500 font-black font-mono mt-1 uppercase">หมดอายุ: {st.betadineExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-300 shadow-sm group-hover:border-indigo-200 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-950 font-black truncate uppercase tracking-tighter" title="น้ำเกลือล้างแผล">💧 น้ำเกลือ</span>
                                <span className={`px-1.5 rounded-md border text-[8px] leading-tight flex-shrink-0 font-black font-mono ${
                                  st.salineStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {st.salineStatus === 'Normal' ? 'ปกติ' : 'ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-500 font-black font-mono mt-1 uppercase">หมดอายุ: {st.salineExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-300 shadow-sm group-hover:border-indigo-200 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-950 font-black truncate uppercase tracking-tighter" title="ผ้าก๊อซปิดแผล">🕸️ ผ้าก๊อซ</span>
                                <span className={`px-1.5 rounded-md border text-[8px] leading-tight flex-shrink-0 font-black font-mono ${
                                  st.gauzeStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {st.gauzeStatus === 'Normal' ? 'ปกติ' : 'ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-500 font-black font-mono mt-1 uppercase">หมดอายุ: {st.gauzeExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-300 shadow-sm group-hover:border-indigo-200 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-950 font-black truncate uppercase tracking-tighter" title="เทปแต่งแผล">🎗️ เทปแต่งแผล</span>
                                <span className={`px-1.5 rounded-md border text-[8px] leading-tight flex-shrink-0 font-black font-mono ${
                                  st.surgicalTapeStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {st.surgicalTapeStatus === 'Normal' ? 'ปกติ' : 'ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-500 font-black font-mono mt-1 uppercase">หมดอายุ: {st.surgicalTapeExpiry || '-'}</span>
                            </div>

                            <div className="flex flex-col p-2 bg-white rounded-lg border border-slate-300 shadow-sm group-hover:border-indigo-200 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-950 font-black truncate uppercase tracking-tighter" title="สำลีก้อนสำหรับทาแผล,ซับเลือด">⚪ สำลีก้อน</span>
                                <span className={`px-1.5 rounded-md border text-[8px] leading-tight flex-shrink-0 font-black font-mono ${
                                  st.cottonBallsStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {st.cottonBallsStatus === 'Normal' ? 'ปกติ' : 'ชำรุด'}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-slate-500 font-black font-mono mt-1 uppercase">หมดอายุ: {st.cottonBallsExpiry || '-'}</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-300 col-span-2 shadow-sm group-hover:border-indigo-200 transition-colors">
                              <span className="text-slate-950 font-black uppercase tracking-widest font-mono">📦 กล่องบรรจุภัณฑ์</span>
                              <span className={`px-2 rounded-md border text-[8px] flex-shrink-0 font-black font-mono ${
                                st.containerStatus === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {st.containerStatus === 'Normal' ? 'ปกติ' : 'ชำรุด'}
                              </span>
                            </div>

                          </div>
                        )}
                      </div>

                      {/* Display inspection metadata */}
                      <div className="border-t border-slate-300 pt-4 text-[10px] space-y-1.5">
                        <div className="flex justify-between text-slate-500 font-black font-mono uppercase tracking-tighter">
                          <span>LAST AUDIT:</span>
                          <span className="text-slate-950">{st.lastInspectedDate || 'NEVER'}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-black font-mono uppercase tracking-tighter">
                          <span>OFFICER:</span>
                          <span className="text-slate-950">{st.lastInspector || '-'}</span>
                        </div>
                        {st.remarks && (
                          <div className="mt-3 text-[10px] p-3 bg-rose-50/20 text-rose-800 rounded-xl border border-rose-200/50 h-12 overflow-y-auto leading-relaxed custom-scrollbar font-black uppercase tracking-tight">
                            <strong className="text-rose-700">REMARKS: </strong>{st.remarks}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Bottom Trigger Action button to pop-up Audit modal */}
                    <div className="bg-white border-t border-slate-300 p-4">
                      <button
                        onClick={() => handleOpenInspect(st)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2.5 text-[10px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-200/20 uppercase tracking-widest font-mono"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>RECORD AUDIT</span>
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
      <div className="bg-white border rounded-2xl border-slate-300 shadow-2xl space-y-4 p-6">
        <div className="border-b border-slate-300 bg-white p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-indigo-700" />
            </div>
            <h3 className="font-black text-base text-slate-950 uppercase tracking-tight">
              {stationTypeFilter === 'pier' 
                ? 'ประวัติบันทึกการตรวจเวชภัณฑ์ยาบนท่าเรือ (Pier Medical Kit Audit Logs)' 
                : stationTypeFilter === 'boat' 
                  ? 'ประวัติบันทึกการตรวจเวชภัณฑ์ยาบนเรือ (Boat Medical Kit Audit Logs)' 
                  : 'ประวัติบันทึกการตรวจเวชภัณฑ์ยารวม (Combined Medical Kit Audit Logs)'}
            </h3>
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono px-3 py-1 rounded-full font-black border border-indigo-200">
            พบตามตัวกรอง: {history.filter(h => {
              const [y, m] = h.inspectionDate.split('-');
              const matchYear = medYearFilter === 'all' || y === medYearFilter;
              const matchMonth = medMonthFilter === 'all' || m === medMonthFilter;
              const matchType = stationTypeFilter === 'all' || h.stationType === stationTypeFilter;
              return matchYear && matchMonth && matchType;
            }).length} / ทั้งหมด {stationTypeFilter === 'all' ? history.length : history.filter(h => h.stationType === stationTypeFilter).length} รายการ
          </span>
        </div>

        {/* Filters for medical history */}
        <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-500 min-w-[70px] uppercase">ปี พ.ศ.:</span>
            <select value={medYearFilter}
              onChange={(e) => setMedYearFilter(e.target.value)}
              className="w-full bg-white text-slate-950 border border-slate-300 rounded-lg p-2 font-black focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="all">แสดงทุกปี (All Years)</option>
              {['2026', '2027', '2028', '2029', '2030', '2031'].map((y) => (
                <option key={y} value={y}>
                  พ.ศ. {parseInt(y, 10) + 543} ({y})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-black text-slate-500 min-w-[70px] uppercase">เดือนตรวจ:</span>
            <select value={medMonthFilter}
              onChange={(e) => setMedMonthFilter(e.target.value)}
              className="w-full bg-white text-slate-950 border border-slate-300 rounded-lg p-2 font-black focus:outline-none focus:border-indigo-600 cursor-pointer"
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

          <div className="flex items-center justify-between gap-3 border-l border-slate-300 pl-4">
            <span className="font-black text-slate-500 uppercase">มุมมอง:</span>
            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1 shadow-inner">
              <button
                onClick={() => setMedGroupedView(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                  medGroupedView
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200/40'
                    : 'text-slate-500 hover:bg-white'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                จัดกลุ่มรายเดือน
              </button>
              <button
                onClick={() => setMedGroupedView(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                  !medGroupedView
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200/40'
                    : 'text-slate-500 hover:bg-white'
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
            <div className="py-12 text-center text-xs text-slate-500 font-medium">ยังไม่พบประวัติการตรวจเช็คเวชภัณฑ์ถูกเขียนบันทึก</div>
          ) : (() => {
            // Apply filtering
            const filteredLogs = history.filter((h) => {
              const [y, m] = h.inspectionDate.split('-');
              const matchYear = medYearFilter === 'all' || y === medYearFilter;
              const matchMonth = medMonthFilter === 'all' || m === medMonthFilter;
              const matchType = stationTypeFilter === 'all' || h.stationType === stationTypeFilter;
              return matchYear && matchMonth && matchType;
            }).sort((a, b) => b.inspectionDate.localeCompare(a.inspectionDate));

            if (filteredLogs.length === 0) {
              return (
                <div className="py-12 text-center text-xs text-slate-500 font-medium">
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
                <div key={ymKey} className="bg-white p-4 rounded-2xl border border-slate-300 space-y-3 mt-4 shadow-xl">
                  <div className="bg-white text-indigo-700 px-4 py-2.5 rounded-xl font-black text-xs flex justify-between items-center border border-slate-300 shadow-inner">
                    <div className="flex items-center gap-2 tracking-wider">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      <span className="uppercase">{getMonthYearLabelThai(ymKey)}</span>
                    </div>
                    <span className="bg-indigo-50/40 text-indigo-800 border border-indigo-200/50 px-2 py-0.5 rounded-md text-[10px] font-mono font-black">
                      จำนวน {grouped[ymKey].length} บันทึก
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/50 bg-white rounded-xl border border-slate-300 overflow-hidden shadow-inner">
                    {grouped[ymKey].map((h, hIdx) => (
                      <div key={h.id || hIdx} className="p-4 hover:bg-slate-100/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs transition-colors">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border font-mono tracking-tighter ${
                              h.stationType === 'boat' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200'
                            }`}>
                              {h.stationId}
                            </span>
                            <strong className="text-slate-950 text-sm font-black tracking-tight">{h.targetName}</strong>
                            <span className="text-slate-700">|</span>
                            <span className="text-slate-500 font-black">{h.location}</span>
                          </div>

                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 font-mono font-black">
                            <div className="flex items-center gap-1.5">
                              <UserIcon className="h-3.5 w-3.5 text-slate-600" />
                              <span>ตรวจโดย: <span className="text-slate-700">{h.inspectorName}</span></span>
                            </div>
                            <span className="text-slate-950">•</span>
                            <div>
                              <span>วันที่: <span className="text-slate-700">{h.inspectionDate}</span></span>
                            </div>
                          </div>

                          {h.remarks && (
                            <p className="text-[10px] text-slate-500 bg-white px-2 py-1.5 rounded-lg border border-slate-300 inline-block mt-1 font-black max-w-full">
                              <span className="text-indigo-700 mr-1.5">REMARKS:</span>{h.remarks}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 sm:text-right">
                          {/* Status checklist metrics summarized */}
                          <div className="hidden lg:flex gap-1.5 flex-wrap justify-end max-w-sm">
                            {[
                              { s: h.paracetamolStatus, l: 'พาราฯ' },
                              { s: h.motionSicknessStatus, l: 'แก้เมารถ' },
                              { s: h.ammoniaStatus, l: 'แอมโมเนีย' },
                              { s: h.bandagesStatus, l: 'พลาสเตอร์' },
                              { s: h.antacidStatus, l: 'ยาลดกรด' },
                              { s: h.cottonBudsStatus, l: 'สำลีก้าน' },
                              { s: h.betadineStatus, l: 'เบตาดีน' },
                              { s: h.salineStatus, l: 'น้ำเกลือ' },
                              { s: h.gauzeStatus, l: 'ผ้าก๊อซ' },
                              { s: h.surgicalTapeStatus, l: 'เทปแต่งแผล' },
                              { s: h.cottonBallsStatus, l: 'สำลีก้อน' },
                              { s: h.containerStatus, l: 'ตู้ยา' }
                            ].map((item, idx) => (
                              <span 
                                key={idx}
                                className={`text-[8px] px-1.5 py-0.2 border rounded-md font-black tracking-tighter ${
                                  item.s === 'Normal' 
                                    ? 'bg-emerald-50/30 text-emerald-500 border-emerald-200/50' 
                                    : 'bg-rose-50/30 text-rose-500 border-rose-200/50'
                                }`}
                              >
                                {item.l}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-3">
                            {h.photoUrl && (
                              <div 
                                onClick={() => setSelectedLightboxPhoto(h.photoUrl || null)}
                                className="relative w-9 h-9 rounded-lg border border-slate-300 overflow-hidden cursor-pointer hover:border-indigo-500 hover:scale-105 transition-all shadow-lg shadow-black/40 group"
                                title="ดูรูปถ่ายรายงาน"
                              >
                                <img 
                                  src={h.photoUrl} 
                                  alt="Medical Kit Audit" 
                                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                            <span className={`text-[10px] font-black py-1.5 px-3 rounded-lg border uppercase tracking-widest font-mono shadow-sm ${
                              h.overallStatus === 'Pass' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {h.overallStatus === 'Pass' ? 'PASS' : 'FAIL'}
                            </span>
                            <button
                              onClick={() => onDeleteInspection(h.id)}
                              className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50/30 rounded-lg border border-slate-300 hover:border-rose-200 transition-all cursor-pointer"
                              title="ลบประวัตินี้"
                            >
                              <Trash2 className="h-4 w-4" />
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
              <div key={h.id || hIdx} className="p-5 hover:bg-slate-100/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs border-b border-slate-300 last:border-0 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border font-mono tracking-tighter ${
                      h.stationType === 'boat' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200'
                    }`}>
                      {h.stationId}
                    </span>
                    <strong className="text-slate-950 text-sm font-black tracking-tight">{h.targetName}</strong>
                    <span className="text-slate-700">|</span>
                    <span className="text-slate-500 font-black">{h.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 font-mono font-black">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-slate-600" />
                      <span>ตรวจโดย: <span className="text-slate-700">{h.inspectorName}</span></span>
                    </div>
                    <span className="text-slate-950">•</span>
                    <div>
                      <span>วันที่: <span className="text-slate-700">{h.inspectionDate}</span></span>
                    </div>
                  </div>

                  {h.remarks && (
                    <p className="text-[10px] text-slate-500 bg-white px-2 py-1.5 rounded-lg border border-slate-300 inline-block mt-1 font-black">
                      <span className="text-indigo-700 mr-1.5">REMARKS:</span>{h.remarks}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 sm:text-right">
                  <div className="hidden md:flex gap-1.5 flex-wrap justify-end max-w-md">
                    {[
                      { s: h.paracetamolStatus, l: 'พาราฯ' },
                      { s: h.motionSicknessStatus, l: 'แก้เมารถ' },
                      { s: h.ammoniaStatus, l: 'แอมโมเนีย' },
                      { s: h.bandagesStatus, l: 'พลาสเตอร์' },
                      { s: h.antacidStatus, l: 'ยาลดกรด' },
                      { s: h.cottonBudsStatus, l: 'สำลีก้าน' },
                      { s: h.betadineStatus, l: 'เบตาดีน' },
                      { s: h.salineStatus, l: 'น้ำเกลือ' },
                      { s: h.gauzeStatus, l: 'ผ้าก๊อซ' },
                      { s: h.surgicalTapeStatus, l: 'เทปแต่งแผล' },
                      { s: h.cottonBallsStatus, l: 'สำลีก้อน' },
                      { s: h.containerStatus, l: 'ตู้ยา' }
                    ].map((item, idx) => (
                      <span 
                        key={idx}
                        className={`text-[8px] px-1.5 py-0.2 border rounded-md font-black tracking-tighter ${
                          item.s === 'Normal' 
                            ? 'bg-emerald-50/30 text-emerald-500 border-emerald-200/50' 
                            : 'bg-rose-50/30 text-rose-500 border-rose-200/50'
                        }`}
                      >
                        {item.l}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    {h.photoUrl && (
                      <div 
                        onClick={() => setSelectedLightboxPhoto(h.photoUrl || null)}
                        className="relative w-9 h-9 rounded-lg border border-slate-300 overflow-hidden cursor-pointer hover:border-indigo-500 hover:scale-105 transition-all shadow-lg shadow-black/40 group"
                        title="ดูรูปถ่ายรายงาน"
                      >
                        <img 
                          src={h.photoUrl} 
                          alt="Medical Kit Audit" 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <span className={`text-[10px] font-black py-1.5 px-3 rounded-lg border uppercase tracking-widest font-mono shadow-sm ${
                      h.overallStatus === 'Pass' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {h.overallStatus === 'Pass' ? 'PASS' : 'FAIL'}
                    </span>
                    <button
                      onClick={() => onDeleteInspection(h.id)}
                      className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50/30 rounded-lg border border-slate-300 hover:border-rose-200 transition-all cursor-pointer"
                      title="ลบประวัตินี้"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
      </div>
      )}

      {/* Interactive Modal Sheet Overlay */}
      {inspectingStation && createPortal(
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-hidden">
          <style>{`
            #inspection-modal {
              background-color: #ffffff !important;
              border-color: #0f172a !important;
              color: #0f172a !important;
            }
            #inspection-modal .bg-white, 
            #inspection-modal .bg-white {
              background-color: #f8fafc !important;
              border-color: #cbd5e1 !important;
              color: #0f172a !important;
            }
            #inspection-modal select, 
            #inspection-modal input, 
            #inspection-modal textarea {
              background-color: #ffffff !important;
              color: #0f172a !important;
              border-color: #cbd5e1 !important;
            }
            #inspection-modal select option {
              background-color: #ffffff !important;
              color: #0f172a !important;
            }
            #inspection-modal .text-slate-950 {
              color: #0f172a !important;
            }
            #inspection-modal .text-slate-500 {
              color: #475569 !important;
            }
            #inspection-modal .border-slate-300 {
              border-color: #cbd5e1 !important;
            }
            #inspection-modal .px-6.py-5.bg-white {
              background-color: #f8fafc !important;
              border-bottom: 2px solid #cbd5e1 !important;
              border-top: 1px solid #cbd5e1 !important;
            }
            #inspection-modal .text-slate-500.hover\\:text-slate-950.hover\\:bg-white:hover {
              color: #0f172a !important;
              background-color: #f1f5f9 !important;
            }
            #inspection-modal button.text-slate-500:hover {
              background-color: #f1f5f9 !important;
              color: #0f172a !important;
            }
          `}</style>
          <div 
            className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl max-w-xl w-full max-h-[95vh] flex flex-col overflow-hidden animate-fade-in"
            id="inspection-modal"
          >
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-white text-slate-950 flex justify-between items-center border-b border-slate-300 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest bg-indigo-600 text-white px-2 py-0.5 rounded-md font-mono border border-indigo-500 shadow-lg shadow-indigo-200/40">
                  AUDIT ID: {inspectingStation.id}
                </span>
                <h3 className="text-lg font-black uppercase mt-1.5 tracking-tight">
                  บันทึกผลตรวจสอบ: {inspectingStation.targetName}
                </h3>
              </div>
              <button 
                onClick={handleCloseInspect}
                className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                id="close-modal-btn"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body Container form */}
            <form onSubmit={handleSubmitInspection} className="flex flex-col overflow-hidden min-h-0 flex-1">
              <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* Target metadata display */}
              <div className="p-4 bg-white text-slate-500 rounded-xl border border-slate-300 text-xs leading-relaxed space-y-2 shadow-inner">
                <div className="font-black flex items-center gap-2 text-[11px] text-slate-950">
                  <Activity className="h-4 w-4 text-indigo-700 animate-pulse" />
                  <span className="uppercase tracking-wider">ตำแหน่งงาน: {inspectingStation.stationId} ({inspectingStation.stationType === 'boat' ? 'ตู้ยาพกพาบนเรือ' : 'ตู้ยาสถานีรายท่าเทียบ'})</span>
                </div>
                <div className="font-medium text-slate-500"><strong>ตู้ยาประจำ:</strong> {inspectingStation.targetName} | <strong>รายละเอียดจุดติดตั้ง:</strong> {inspectingStation.location}</div>
              </div>

              {/* Inspector details entry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                    👨‍✈️ ชื่อเจ้าหน้าที่ผู้ตรวจสอบ
                  </label>
                  <input type="text"
                    required
                    placeholder="ระบุชื่อ-นามสกุล"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full bg-white text-slate-950 text-xs border border-slate-300 rounded-lg p-3 focus:outline-none focus:border-indigo-600 font-black placeholder:text-slate-700 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                    📅 วันที่เข้าทำความสะอาดและตรวจสอบ
                  </label>
                  <input type="date"
                    required
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full bg-white text-slate-950 text-xs border border-slate-300 rounded-lg p-3 focus:outline-none focus:border-indigo-600 font-black font-mono transition-all"
                  />
                </div>
              </div>

              {/* Matrix of items select box indicators */}
              <div className="space-y-4 pt-4 border-t border-slate-300">
                <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] font-mono">
                  ประเมินรายเวชภัณฑ์ (Inspection Parameters)
                </h4>

                {/* Param 1: Paracetamol */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center transition-all hover:border-slate-300">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-950 block">💊 1. ยาแก้ปวดพาราเซตามอล</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider mt-0.5">พาราเซตามอล 500มก.</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">สถานะ</label>
                    <select value={paracetamolStatus}
                      onChange={(e) => setParacetamolStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 font-black cursor-pointer text-slate-950 focus:border-indigo-600 outline-none"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 ยาหมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 เสียหาย / ชำรุด</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">วันหมดอายุ</label>
                    <input type="date"
                      value={paracetamolExpiry}
                      onChange={(e) => setParacetamolExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 text-slate-950 font-black font-mono text-center focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Param 2: Motion Sickness */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center transition-all hover:border-slate-300">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-950 block">🤢 2. ยาแก้เมาเรือ</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider mt-0.5">Dimenhydrinate (Motion Sickness)</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">สถานะ (Status)</label>
                    <select value={motionSicknessStatus}
                      onChange={(e) => setMotionSicknessStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 font-black cursor-pointer text-slate-950 focus:border-indigo-600 outline-none"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 ยาหมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 เสียหาย / ชำรุด</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">วันหมดอายุ</label>
                    <input type="date"
                      value={motionSicknessExpiry}
                      onChange={(e) => setMotionSicknessExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 text-slate-950 font-black font-mono text-center focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Param 3: Ammonia */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center transition-all hover:border-slate-300">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-950 block">👃 3. แอมโมเนียหอม</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider mt-0.5">Ammonia Inhalant</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">สถานะ (Status)</label>
                    <select value={ammoniaStatus}
                      onChange={(e) => setAmmoniaStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 font-black cursor-pointer text-slate-950 focus:border-indigo-600 outline-none"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 เสียหาย / ผิดรูป</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">วันหมดอายุ</label>
                    <input type="date"
                      value={ammoniaExpiry}
                      onChange={(e) => setAmmoniaExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 text-slate-950 font-black font-mono text-center focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Param 4: Bandages */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center transition-all hover:border-slate-300">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-950 block">🩹 4. พลาสเตอร์ปิดแผล</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider mt-0.5">Adhesive Bandages</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">สถานะ (Status)</label>
                    <select value={bandagesStatus}
                      onChange={(e) => setBandagesStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 font-black cursor-pointer text-slate-950 focus:border-indigo-600 outline-none"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 เสียหาย / ชื้นเปียก</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">วันหมดอายุ</label>
                    <input type="date"
                      value={bandagesExpiry}
                      onChange={(e) => setBandagesExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 text-slate-950 font-black font-mono text-center focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Param 5: Antacid */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center transition-all hover:border-slate-300">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-950 block">🥛 5. ยาธาตุน้ำขาว/ยาลดกรด</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider mt-0.5">Antacid / Stomachic</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">สถานะ (Status)</label>
                    <select value={antacidStatus}
                      onChange={(e) => setAntacidStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 font-black cursor-pointer text-slate-950 focus:border-indigo-600 outline-none"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 กล่องรั่ว / บรรจุภัณฑ์ชำรุด</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">วันหมดอายุ</label>
                    <input type="date"
                      value={antacidExpiry}
                      onChange={(e) => setAntacidExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 text-slate-950 font-black font-mono text-center focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Param 6: Cotton Buds */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center transition-all hover:border-slate-300">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-950 block">🎋 6. สำลีก้าน</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider mt-0.5">Cotton Swabs</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">สถานะ (Status)</label>
                    <select value={cottonBudsStatus}
                      onChange={(e) => setCottonBudsStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 font-black cursor-pointer text-slate-950 focus:border-indigo-600 outline-none"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 บรรจุภัณฑ์ฉีกขาด / สกปรก</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">วันหมดอายุ</label>
                    <input type="date"
                      value={cottonBudsExpiry}
                      onChange={(e) => setCottonBudsExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 text-slate-950 font-black font-mono text-center focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Param 7: Betadine */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center transition-all hover:border-slate-300">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-950 block">🟤 7. ยาเบตาดีนล้างแผล</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider mt-0.5">Betadine Wound Cleanser</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">สถานะ (Status)</label>
                    <select value={betadineStatus}
                      onChange={(e) => setBetadineStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 font-black cursor-pointer text-slate-950 focus:border-indigo-600 outline-none"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 ยาหมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 ฝาแตก / รั่วซึม</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">วันหมดอายุ</label>
                    <input type="date"
                      value={betadineExpiry}
                      onChange={(e) => setBetadineExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 text-slate-950 font-black font-mono text-center focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Param 8: Saline */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center transition-all hover:border-slate-300">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-950 block">💧 8. น้ำเกลือล้างแผล</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider mt-0.5">Saline Wound Wash</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">สถานะ (Status)</label>
                    <select value={salineStatus}
                      onChange={(e) => setSalineStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 font-black cursor-pointer text-slate-950 focus:border-indigo-600 outline-none"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 ยาหมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 เปิดใช้แล้ว / ขวดแตก</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">วันหมดอายุ</label>
                    <input type="date"
                      value={salineExpiry}
                      onChange={(e) => setSalineExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 text-slate-950 font-black font-mono text-center focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Param 9: Gauze */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center transition-all hover:border-slate-300">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-950 block">🕸️ 9. ผ้าก๊อซปิดแผล</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider mt-0.5">Gauze Pads</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">สถานะ (Status)</label>
                    <select value={gauzeStatus}
                      onChange={(e) => setGauzeStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 font-black cursor-pointer text-slate-950 focus:border-indigo-600 outline-none"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 ปนเปื้อน / ซองฉีกขาด</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">วันหมดอายุ</label>
                    <input type="date"
                      value={gauzeExpiry}
                      onChange={(e) => setGauzeExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 text-slate-950 font-black font-mono text-center focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Param 10: Surgical Tape */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center transition-all hover:border-slate-300">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-950 block">🎗️ 10. เทปแต่งแผล</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider mt-0.5">Medical Tape</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">สถานะ (Status)</label>
                    <select value={surgicalTapeStatus}
                      onChange={(e) => setSurgicalTapeStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 font-black cursor-pointer text-slate-950 focus:border-indigo-600 outline-none"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 หมดกาว / เก่าชำรุด</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">วันหมดอายุ</label>
                    <input type="date"
                      value={surgicalTapeExpiry}
                      onChange={(e) => setSurgicalTapeExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 text-slate-950 font-black font-mono text-center focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Param 11: Cotton Balls */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center transition-all hover:border-slate-300">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-950 block">⚪ 11. สำลีก้อนทาแผล</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider mt-0.5">Cotton Balls</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">สถานะ (Status)</label>
                    <select value={cottonBallsStatus}
                      onChange={(e) => setCottonBallsStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 font-black cursor-pointer text-slate-950 focus:border-indigo-600 outline-none"
                    >
                      <option value="Normal">🟢 ปกติ / เพียงพอ</option>
                      <option value="LowStock">🟡 ใกล้หมด / พร่อง</option>
                      <option value="Expired">🔴 หมดอายุ (Expired)</option>
                      <option value="Missing">🟠 สูญหาย / ขาดแคลน</option>
                      <option value="Damaged">🔴 ซองฉีกขาด / ปนเปื้อน</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">วันหมดอายุ</label>
                    <input type="date"
                      value={cottonBallsExpiry}
                      onChange={(e) => setCottonBallsExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 text-slate-950 font-black font-mono text-center focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Param 12: Container */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center transition-all hover:border-slate-300">
                  <div className="sm:col-span-1">
                    <span className="text-xs font-black text-slate-950 block">📦 12. สภาพกล่อง/ตัวตู้ยา</span>
                    <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider mt-0.5">Container Quality</span>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-widest">สถานะกล่อง/บานพับ/ระบบล็อค</label>
                    <select value={containerStatus}
                      onChange={(e) => setContainerStatus(e.target.value as MedicalItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg text-xs p-2 font-black cursor-pointer text-slate-950 focus:border-indigo-600 outline-none"
                    >
                      <option value="Normal">🟢 ปกติ / แข็งแรงและแห้งมิดชิด (Safe & Normal)</option>
                      <option value="Damaged">🔴 แตกหัก / ชำรุดฝาล็อคไม่ได้ (Damaged)</option>
                      <option value="Missing">🟠 ตู้สูญหาย / ถูกเคลื่อนย้าย (Missing)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Photo Upload Box */}
              <div className="space-y-2 border-t border-slate-300 pt-5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                  📸 แนบรูปถ่ายประกอบการตรวจสอบ
                </label>
                <div className="bg-white p-2 rounded-xl border border-slate-300 border-dashed hover:border-indigo-500 transition-colors">
                  <ImageUpload
                    label="คลิกเพื่อเลือกรูปภาพหรือลากวางที่นี่"
                    onImageSelected={setPhotoUrl}
                    existingImage={photoUrl}
                  />
                </div>
              </div>

              {/* Remarks Box */}
              <div className="space-y-2 border-t border-slate-300 pt-5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                  📝 รายละเอียดเพิ่มเติม / แผนเสนอแก้ไข
                </label>
                <textarea value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="ระบุรายละเอียดเพิ่มเติม..."
                  className="w-full bg-white text-slate-950 text-xs border border-slate-300 rounded-xl p-4 h-24 focus:outline-none focus:border-indigo-600 font-black placeholder:text-slate-700 transition-all leading-normal custom-scrollbar"
                />
              </div>
              </div>

              {/* Form Actions Footer */}
              <div className="px-6 py-5 bg-white border-t border-slate-300 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseInspect}
                  className="px-6 py-2.5 text-[11px] font-black text-slate-500 hover:bg-white hover:text-slate-950 rounded-lg font-mono uppercase tracking-[0.2em] cursor-pointer transition-all border border-transparent hover:border-slate-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-[11px] font-black text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border border-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200/40 font-mono uppercase tracking-[0.2em] cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  SAVE AUDIT
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

      {/* Interactive Lightbox Portal for Zooming Medical Images */}
      {selectedLightboxPhoto && createPortal(
        <div 
          className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedLightboxPhoto(null)}
        >
          <div className="relative bg-white p-2 rounded-2xl border-2 border-slate-900 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <button
              onClick={() => setSelectedLightboxPhoto(null)}
              className="absolute top-4 right-4 bg-white/90 text-slate-950 p-2 rounded-full cursor-pointer hover:bg-slate-100 border border-slate-300 transition-colors z-10 font-bold"
              title="Close"
            >
              ✕ CLOSE
            </button>
            <div className="flex-1 bg-white flex items-center justify-center overflow-hidden rounded-xl border border-slate-300">
              <img 
                src={selectedLightboxPhoto} 
                alt="Medical Kit Zoom" 
                className="max-w-full max-h-[75vh] object-contain" 
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
