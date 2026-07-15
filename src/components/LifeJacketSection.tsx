import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Search, 
  Save, 
  X, 
  LifeBuoy,
  CheckCircle2, 
  AlertCircle, 
  ClipboardCheck,
  Camera,
  Map,
  Grid,
  Trash2
} from 'lucide-react';
import { BoatLifeJacketState, LifeJacketInspectionRecord, LifeJacketItemStatus, OverallStatus, BoatSeatLifeJacket } from '../types';
import ImageUpload from './ImageUpload';

const ctbLayoutImg = '/Layout_CTB_Boat.jpg';
const rLayoutImg = '/Layout_R_Boat.png';

// Helper to generate dynamic 6-column seats (13 rows for CTB, 10 rows for R)
const generateDefaultSeats = (boatName?: string): BoatSeatLifeJacket[] => {
  const isCTB = boatName ? boatName.toUpperCase().startsWith('CTB') : true;
  const maxRows = isCTB ? 13 : 10;
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seats: BoatSeatLifeJacket[] = [];
  for (let r = 1; r <= maxRows; r++) {
    cols.forEach(c => {
      seats.push({ id: `${r}${c}`, status: 'green' });
    });
  }
  return seats;
};

import SeatMapGrid from './SeatMapGrid';

// Reusable Passenger Cabin Seat Map Component - REMOVED and extracted to SeatMapGrid.tsx
interface LifeJacketSectionProps {
  jackets: BoatLifeJacketState[];
  onSaveInspection: (record: LifeJacketInspectionRecord | Omit<LifeJacketInspectionRecord, 'id'>) => void;
  onDeleteInspection: (id: string) => void;
  history: LifeJacketInspectionRecord[];
}

export default function LifeJacketSection({
  jackets,
  onSaveInspection,
  onDeleteInspection,
  history,
}: LifeJacketSectionProps) {
  // Selected boat state
  const [activeBoatId, setActiveBoatId] = useState<string>('');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Form input states
  const [inspectorName, setInspectorName] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().substring(0, 10));
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  
  const [totalAdults, setTotalAdults] = useState<number>(80);
  const [totalKids, setTotalKids] = useState<number>(15);
  const [adultsStatus, setAdultsStatus] = useState<LifeJacketItemStatus>('Normal');
  const [kidsStatus, setKidsStatus] = useState<LifeJacketItemStatus>('Normal');
  const [whistleStatus, setWhistleStatus] = useState<LifeJacketItemStatus>('Normal');
  const [lightStatus, setLightStatus] = useState<LifeJacketItemStatus>('Normal');
  const [cabinetStatus, setCabinetStatus] = useState<LifeJacketItemStatus>('Normal');
  const [remarks, setRemarks] = useState('');
  const [formSeats, setFormSeats] = useState<BoatSeatLifeJacket[]>([]);

  // Function to load boat's current status into form state
  const loadBoat = (boatId: string) => {
    const boat = jackets.find(j => j.boatId === boatId);
    if (boat) {
      setActiveBoatId(boatId);
      setEditingRecordId(null);
      setInspectorName(boat.lastInspector || '');
      setPhotoUrl(boat.photoUrl);
      setInspectionDate(new Date().toISOString().substring(0, 10));
      setTotalAdults(boat.totalAdults);
      setTotalKids(boat.totalKids);
      setAdultsStatus(boat.adultsStatus);
      setKidsStatus(boat.kidsStatus);
      setWhistleStatus(boat.whistleStatus);
      setLightStatus(boat.lightStatus);
      setCabinetStatus(boat.cabinetStatus);
      setRemarks(boat.remarks || '');
      setFormSeats(boat.seats || generateDefaultSeats(boat.boatName));
    }
  };

  // Sync state with selected boat or when jackets updates
  useEffect(() => {
    if (jackets.length > 0) {
      const currentId = activeBoatId || jackets[0].boatId;
      if (!activeBoatId) {
        setActiveBoatId(currentId);
      }
      
      const currentBoat = jackets.find(j => j.boatId === currentId);
      if (currentBoat && !editingRecordId) {
        setInspectorName(currentBoat.lastInspector || '');
        setPhotoUrl(currentBoat.photoUrl);
        setTotalAdults(currentBoat.totalAdults);
        setTotalKids(currentBoat.totalKids);
        setAdultsStatus(currentBoat.adultsStatus);
        setKidsStatus(currentBoat.kidsStatus);
        setWhistleStatus(currentBoat.whistleStatus);
        setLightStatus(currentBoat.lightStatus);
        setCabinetStatus(currentBoat.cabinetStatus);
        setRemarks(currentBoat.remarks || '');
        setFormSeats(currentBoat.seats || generateDefaultSeats(currentBoat.boatName));
      }
    }
  }, [jackets, activeBoatId, editingRecordId]);

  const handleEditHistoryRecord = (record: LifeJacketInspectionRecord, boat: BoatLifeJacketState) => {
    setEditingRecordId(record.id);
    setInspectorName(record.inspectorName);
    setInspectionDate(record.inspectionDate);
    setPhotoUrl(record.photoUrl);

    setTotalAdults(record.totalAdults);
    setTotalKids(record.totalKids);
    setAdultsStatus(record.adultsStatus);
    setKidsStatus(record.kidsStatus);
    setWhistleStatus(record.whistleStatus);
    setLightStatus(record.lightStatus);
    setCabinetStatus(record.cabinetStatus);
    setRemarks(record.remarks || '');
    setFormSeats(record.seats || boat.seats || generateDefaultSeats(boat.boatName));
    setActiveBoatId(boat.boatId);
  };

  // Toggle seat status in form
  const handleSeatClick = (seatId: string) => {
    setFormSeats(prev => prev.map(seat => {
      if (seat.id === seatId) {
        let nextStatus: 'green' | 'red' | 'orange' = 'green';
        if (seat.status === 'green') nextStatus = 'red';
        else if (seat.status === 'red') nextStatus = 'orange';
        else nextStatus = 'green';
        return { ...seat, status: nextStatus };
      }
      return seat;
    }));
  };

  // Toggle cabinet point status in form
  const handleCabinetClick = (index: number) => {
    if (index === 1) {
      setAdultsStatus(prev => prev === 'Normal' ? 'Damaged' : prev === 'Damaged' ? 'LowStock' : 'Normal');
    } else if (index === 2) {
      setKidsStatus(prev => prev === 'Normal' ? 'Damaged' : prev === 'Damaged' ? 'LowStock' : 'Normal');
    } else if (index === 3) {
      setWhistleStatus(prev => prev === 'Normal' ? 'Damaged' : prev === 'Damaged' ? 'Missing' : 'Normal');
    } else if (index === 4) {
      setLightStatus(prev => prev === 'Normal' ? 'Damaged' : prev === 'Damaged' ? 'Missing' : 'Normal');
    } else if (index === 5) {
      setCabinetStatus(prev => prev === 'Normal' ? 'Damaged' : prev === 'Damaged' ? 'Missing' : 'Normal');
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeBoat = jackets.find(j => j.boatId === activeBoatId);
    if (!activeBoat) return;

    if (!inspectorName.trim()) {
      alert('กรุณากรอกชื่อผู้ตรวจสอบหลัก');
      return;
    }

    // Check if any seat is red or orange
    const hasSeatIssues = formSeats.some(s => s.status === 'red' || s.status === 'orange');

    // Determine overall status
    const hasFailStates = 
      adultsStatus !== 'Normal' || 
      kidsStatus !== 'Normal' || 
      whistleStatus !== 'Normal' || 
      lightStatus !== 'Normal' || 
      cabinetStatus !== 'Normal' ||
      hasSeatIssues;

    const calculatedOverall: 'Pass' | 'Fail' = hasFailStates ? 'Fail' : 'Pass';

    onSaveInspection({
      ...(editingRecordId ? { id: editingRecordId } : {}),
      boatId: activeBoat.boatId,
      boatName: activeBoat.boatName,
      inspectionDate,
      inspectorName,
      totalAdults,
      totalKids,
      adultsStatus,
      kidsStatus,
      whistleStatus,
      lightStatus,
      cabinetStatus,
      overallStatus: calculatedOverall,
      remarks,
      photoUrl,
      seats: formSeats,
    });

    setEditingRecordId(null);
  };

  // Helper labels
  const getStatusBadge = (status: OverallStatus) => {
    switch (status) {
      case 'Pass':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full uppercase">
            <CheckCircle2 className="h-3.5 w-3.5" /> ผ่านเกณฑ์สมบูรณ์
          </span>
        );
      case 'Fail':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-250 px-2.5 py-1 rounded-full uppercase">
            <AlertCircle className="h-3.5 w-3.5" /> ค้างแก้ไข
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-slate-500 border border-slate-300 px-2.5 py-1 rounded-full uppercase">
            ยังไม่ได้ตรวจรอบนี้
          </span>
        );
    }
  };

  const getItemStatusLabel = (status: LifeJacketItemStatus) => {
    switch (status) {
      case 'Normal':
        return <span className="text-emerald-600 font-bold">ปกติ</span>;
      case 'Damaged':
        return <span className="text-rose-600 font-bold">ชำรุด</span>;
      case 'LowStock':
        return <span className="text-amber-600 font-bold">ไม่เพียงพอ</span>;
      case 'Missing':
        return <span className="text-orange-600 font-bold">สูญหาย</span>;
      default:
        return status;
    }
  };

  // Find active boat
  const activeBoat = jackets.find(j => j.boatId === activeBoatId) || jackets[0];

  // Analytics Calculations
  const totalFleetAdults = jackets.reduce((acc, curr) => acc + curr.totalAdults, 0);
  const totalFleetKids = jackets.reduce((acc, curr) => acc + curr.totalKids, 0);
  const totalFleetJackets = totalFleetAdults + totalFleetKids;

  const fleetIssuesCount = jackets.filter(j => j.overallStatus === 'Fail').length;
  const fleetInspectedCount = jackets.filter(j => j.overallStatus !== 'NeverInspected').length;
  const passPercent = fleetInspectedCount > 0 
    ? Math.round((jackets.filter(j => j.overallStatus === 'Pass').length / fleetInspectedCount) * 100) 
    : 100;

  return (
    <div className="space-y-6 animate-fade-in" id="lifejacket-inspection-module">
      {/* Mini Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border border-slate-300 shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg border border-orange-100">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">ชูชีพทั้งกองเรือ</span>
            <span className="text-xl font-black text-slate-950 font-mono">{totalFleetJackets} ตัว</span>
            <span className="block text-[9px] text-slate-500">ผู้ใหญ่ {totalFleetAdults} / เด็ก {totalFleetKids}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-300 shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg border border-green-100">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">ตรวจครบแล้ว</span>
            <span className="text-xl font-black text-slate-950 font-mono">{fleetInspectedCount} / {jackets.length} ลำ</span>
            <span className="block text-[9px] text-slate-500">อัตราผ่านเกณฑ์ {passPercent}%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-300 shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">พบข้อบกพร่อง</span>
            <span className="text-xl font-black text-slate-950 font-mono">{fleetIssuesCount} ลำ</span>
            <span className="block text-[9px] text-slate-500">ต้องเร่งจัดสรรอุปกรณ์ทดแทน</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-300 shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">ประวัติการตรวจบันทึก</span>
            <span className="text-xl font-black text-slate-950 font-mono">{history.length} รายการ</span>
            <span className="block text-[9px] text-slate-500">เรียงตามการลงทะเบียนล่าสุด</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border rounded border-slate-300 shadow-sm overflow-hidden">
        {/* Toolbar Header with Dropdown Selector */}
        <div className="p-5 border-b border-slate-300 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-slate-950 tracking-tight flex items-center gap-2">
              🚢 ระบบลงบันทึกและตรวจสอบเสื้อชูชีพแบบรายที่นั่ง (Tactile Vessel Life Jackets Audit)
            </h3>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              เลือกเรือเพื่อเปิดดูผังทางกายภาพ และคลิกเปลี่ยนสถานะเสื้อชูชีพแต่ละจุดติดตั้งเพื่อบันทึกประวัติความปลอดภัยทันที
            </p>
          </div>

          {/* Boat Picker Dropdown */}
          <div className="bg-orange-50 border border-orange-250 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
            <label className="text-xs font-black text-orange-950 uppercase tracking-widest font-mono flex items-center gap-1">
              <span>🛳️</span> เลือกเรือที่ตรวจสอบ (Vessel):
            </label>
            <select value={activeBoatId}
              onChange={(e) => loadBoat(e.target.value)}
              className="px-3 py-1.5 border border-orange-350 rounded-md bg-white font-black text-xs text-slate-950 focus:outline-none focus:ring-1 focus:ring-orange-650 cursor-pointer min-w-[200px] shadow-3xs"
            >
              {jackets.map((b) => (
                <option key={b.boatId} value={b.boatId}>
                  {b.boatName} ({b.overallStatus === 'Pass' ? '🟢 ปกติ' : b.overallStatus === 'Fail' ? '🔴 ค้างแก้ไข' : '⚪ ยังไม่ตรวจ'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Boat Status Strip */}
        {activeBoat && (
          <div className="px-5 py-3.5 bg-white text-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-950">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-orange-650 text-slate-950 font-mono font-black text-sm rounded-lg shadow-sm">
                {activeBoat.boatId}
              </span>
              <div>
                <strong className="text-lg font-black tracking-tight text-slate-950 block leading-none">{activeBoat.boatName}</strong>
                <span className="text-[10px] text-slate-500 font-mono block mt-1.5">
                  ตรวจสอบล่าสุด: {activeBoat.lastInspectedDate || 'ยังไม่มีบันทึก'} | ผู้ตรวจล่าสุด: {activeBoat.lastInspector || 'ไม่มีข้อมูล'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="px-3 py-1 bg-white rounded border border-slate-300 font-mono">
                <span className="text-slate-500">ชูชีพผู้ใหญ่:</span> <strong className="text-slate-950">{activeBoat.totalAdults} ตัว</strong>
              </div>
              <div className="px-3 py-1 bg-white rounded border border-slate-300 font-mono">
                <span className="text-slate-500">ชูชีพเด็ก:</span> <strong className="text-slate-950">{activeBoat.totalKids} ตัว</strong>
              </div>
              {getStatusBadge(activeBoat.overallStatus)}
            </div>
          </div>
        )}

        {/* Boat Layout Image */}
        {activeBoat && (
          <div className="border-b border-slate-200">
            <div className="px-5 py-3 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🗺️</span>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  แผนผังตำแหน่งเสื้อชูชีพบนเรือ {activeBoat.boatName}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                {activeBoat.boatName.startsWith('CTB') ? 'CTB BOAT LAYOUT' : 'R BOAT LAYOUT'}
              </span>
            </div>
            <div className="p-4 flex justify-center bg-white">
              <img
                src={activeBoat.boatName.startsWith('CTB') ? ctbLayoutImg : rLayoutImg}
                alt={`แผนผังเรือ ${activeBoat.boatName}`}
                className="max-w-full h-auto rounded border border-slate-200 shadow-sm"
                style={{ maxHeight: '350px', objectFit: 'contain' }}
              />
            </div>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
              <p className="text-[10px] text-slate-500 text-center font-medium">
                📍 จุดสีแดงแสดงตำแหน่งติดตั้งถังดับเพลิง/เสื้อชูชีพ | หมายเลขวงกลมแสดงลำดับอุปกรณ์ประจำเรือ
              </p>
            </div>
          </div>
        )}

        {/* Interactive Workspace Grid */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Inspection form (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded-xl p-4 shadow-3xs space-y-4">
              <div className="border-b border-slate-300 pb-2.5 flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-950 uppercase tracking-wider flex items-center gap-1">
                  <span>📋</span> {editingRecordId ? 'แก้ไขใบตรวจสอบเดิม' : 'บันทึกการตรวจสอบ'}
                </h4>
                {editingRecordId && (
                  <span className="px-2 py-0.5 text-[9px] font-black bg-rose-100 text-rose-700 rounded animate-pulse">
                    โหมดแก้ไขใบประวัติเดิม
                  </span>
                )}
              </div>

              {/* Inspector Details */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider">
                    ชื่อผู้ตรวจสอบหลัก (Inspector) <span className="text-red-500">*</span>
                  </label>
                  <input type="text"
                    required
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    placeholder="ระบุชื่อผู้ดำเนินการ..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none text-slate-950 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider">
                    วันที่ตรวจสอบ (Audit Date)
                  </label>
                  <input type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none font-mono text-slate-950 font-bold"
                  />
                </div>
              </div>

              {/* Quantity Inputs */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-300 pt-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest font-mono">
                    ชูชีพผู้ใหญ่ (Adults)
                  </label>
                  <input type="number"
                    min="0"
                    value={totalAdults}
                    onChange={(e) => setTotalAdults(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none font-mono font-black text-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest font-mono">
                    ชูชีพเด็ก (Kids)
                  </label>
                  <input type="number"
                    min="0"
                    value={totalKids}
                    onChange={(e) => setTotalKids(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none font-mono font-black text-slate-950"
                  />
                </div>
              </div>

              {/* Item Statuses dropdowns */}
              <div className="space-y-2 border-t border-slate-300 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-700 uppercase tracking-wider">
                      สภาพชูชีพผู้ใหญ่
                    </label>
                    <select value={adultsStatus}
                      onChange={(e) => setAdultsStatus(e.target.value as LifeJacketItemStatus)}
                      className="w-full px-1.5 py-1 border border-slate-400 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-500 font-black text-slate-950 bg-white"
                    >
                      <option value="Normal">🟢 ปกติสมบูรณ์</option>
                      <option value="Damaged">🔴 ชำรุด/ขาด</option>
                      <option value="LowStock">🟡 ไม่พอ</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-700 uppercase tracking-wider">
                      สภาพชูชีพเด็ก
                    </label>
                    <select value={kidsStatus}
                      onChange={(e) => setKidsStatus(e.target.value as LifeJacketItemStatus)}
                      className="w-full px-1.5 py-1 border border-slate-400 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-500 font-black text-slate-950 bg-white"
                    >
                      <option value="Normal">🟢 ปกติสมบูรณ์</option>
                      <option value="Damaged">🔴 ชำรุด/ขาด</option>
                      <option value="LowStock">🟡 ไม่พอ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-700 uppercase tracking-wider">
                      สภาพนกหวีด
                    </label>
                    <select value={whistleStatus}
                      onChange={(e) => setWhistleStatus(e.target.value as LifeJacketItemStatus)}
                      className="w-full px-1.5 py-1 border border-slate-400 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-500 font-black text-slate-950 bg-white"
                    >
                      <option value="Normal">🟢 มีครบถ้วน</option>
                      <option value="Missing">🟠 สูญหายบางตัว</option>
                      <option value="Damaged">🔴 ชำรุด</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-700 uppercase tracking-wider">
                      ไฟสัญญาณกะพริบ
                    </label>
                    <select value={lightStatus}
                      onChange={(e) => setLightStatus(e.target.value as LifeJacketItemStatus)}
                      className="w-full px-1.5 py-1 border border-slate-400 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-500 font-black text-slate-950 bg-white"
                    >
                      <option value="Normal">🟢 ปกติ</option>
                      <option value="Missing">🟠 ไม่มี/หาย</option>
                      <option value="Damaged">🔴 เสีย/ถ่านหมด</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-700 uppercase tracking-wider">
                    ตู้/กล่อง/ที่จัดเก็บความปลอดภัย
                  </label>
                  <select value={cabinetStatus}
                    onChange={(e) => setCabinetStatus(e.target.value as LifeJacketItemStatus)}
                    className="w-full px-2 py-1 border border-slate-400 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 font-black text-slate-950 bg-white"
                  >
                    <option value="Normal">🟢 สะอาด หยิบใช้ง่าย</option>
                    <option value="Damaged">🔴 ประตูตู้ชำรุด</option>
                    <option value="Missing">🟠 มีสิ่งของอื่นกีดขวาง</option>
                  </select>
                </div>
              </div>

              {/* Attach Photo */}
              <div className="space-y-1 border-t border-slate-300 pt-3">
                <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5" /> แนบภาพถ่ายการตรวจสอบ (Photo)
                </label>
                <ImageUpload 
                  label="รูปถ่ายผลการตรวจสอบเสื้อชูชีพ"
                  existingImage={photoUrl} 
                  onImageSelected={setPhotoUrl} 
                />
              </div>

              {/* Remarks */}
              <div className="space-y-1 border-t border-slate-300 pt-3">
                <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  หมายเหตุเพิ่มเติม / ข้อเสนอแนะการแก้ไข
                </label>
                <textarea value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="ระบุรายละเอียดอุปกรณ์ที่ต้องซ่อมบำรุงหรือเปลี่ยนทดแทน..."
                  rows={2}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Form Submission Controls */}
              <div className="pt-3 border-t border-slate-300 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-3xs"
                >
                  <Save className="h-4 w-4" />
                  {editingRecordId ? 'บันทึกอัปเดตใบตรวจสอบ' : '💾 บันทึกบันทึกการตรวจสอบ'}
                </button>

                {editingRecordId && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeBoat) loadBoat(activeBoat.boatId);
                    }}
                    className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10.5px] rounded-lg cursor-pointer transition-all"
                  >
                    ยกเลิกการแก้ไขใบเดิม
                  </button>
                )}
              </div>
            </form>

            {/* Instruction block */}
            <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl space-y-2 text-xs text-orange-950 mt-4">
              <strong className="block text-[11px] font-black uppercase tracking-wider">💡 แนะนำการบันทึกผังความปลอดภัย:</strong>
              <ul className="list-disc list-inside space-y-1 text-[10.5px] leading-relaxed text-slate-700">
                <li>เลือกสลับแท็บเรือด้วย Dropdown ขวาบน</li>
                <li>คุณสามารถ **จิ้มเสื้อชูชีพแต่ละจุด** บนผังเรือจริงทางขวาโดยตรงเพื่อสลับสถานะ:</li>
                <li className="pl-3 font-semibold text-slate-850">🟢 ปกติสมบูรณ์ 👉 🔴 ไม่มี/สูญหาย 👉 🟠 ชำรุด/เก่า</li>
                <li>ยอดนับสรุป 🟢/🔴/🟠 จะรวมให้อัตโนมัติในแถบสถานะ</li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Full-screen tactile seating layout (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-2">
            <div className="bg-white rounded-xl p-2 border border-slate-950">
              <div className="flex items-center justify-between px-3 py-1 text-slate-500 text-[10px] font-bold font-mono">
                <span>🖥️ VIEWPORT: INTERACTIVE TACTILE COMPLIANCE GRID</span>
                <span className="text-orange-700 font-bold">จิ้มตรวจสอบเสื้อชูชีพแบบเต็มจอได้ที่ผังนี้</span>
              </div>
              
              <SeatMapGrid 
                seats={formSeats} 
                interactive={true} 
                onSeatClick={handleSeatClick} 
                boatName={activeBoat?.boatName}
                cabinetStatuses={{
                  adultsStatus,
                  kidsStatus,
                  whistleStatus,
                  lightStatus,
                  cabinetStatus
                }}
                onCabinetClick={handleCabinetClick}
              />
            </div>

            {/* Overall safety summary indicators under map */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-white border border-slate-300 rounded-xl text-center">
              <div className="p-2 rounded bg-emerald-50 border border-emerald-100">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">ชูชีพปกติ (🟢)</span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  {formSeats.filter(s => s.status === 'green').length} ตัว
                </span>
              </div>
              <div className="p-2 rounded bg-rose-50 border border-rose-100 animate-pulse">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">ไม่มีชูชีพ (🔴)</span>
                <span className="text-lg font-black text-rose-700 font-mono">
                  {formSeats.filter(s => s.status === 'red').length} ตัว
                </span>
              </div>
              <div className="p-2 rounded bg-amber-50 border border-amber-100">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">ชูชีพชำรุด (🟠)</span>
                <span className="text-lg font-black text-amber-700 font-mono">
                  {formSeats.filter(s => s.status === 'orange').length} ตัว
                </span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* History Log Section */}
      {history.length > 0 && (
        <div className="bg-white border rounded border-slate-300 shadow-sm mt-6">
          <div className="p-4 bg-white border-b border-slate-300 flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
              📜 ประวัติบันทึกการตรวจสอบความปลอดภัยของเสื้อชูชีพ (Life Jacket Inspection Logs)
            </h4>
            <span className="text-[10px] text-slate-500 font-mono font-bold">
              ทั้งหมด {history.length} รายการ
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
            {history.map((rec) => {
              const matchedBoat = jackets.find(j => j.boatId === rec.boatId);
              return (
                <div key={rec.id} className="p-3.5 hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-950 font-mono">{rec.boatName} ({rec.boatId})</span>
                      {rec.overallStatus === 'Pass' ? (
                        <span className="text-[9px] bg-green-50 text-green-700 font-bold border border-green-200 px-1.5 py-0.5 rounded-full">🟢 ผ่าน</span>
                      ) : (
                        <span className="text-[9px] bg-rose-50 text-rose-700 font-bold border border-rose-250 px-1.5 py-0.5 rounded-full animate-pulse">🔴 ค้างแก้ไข</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      ชูชีพผู้ใหญ่ {rec.totalAdults} ({rec.adultsStatus}) | ชูชีพเด็ก {rec.totalKids} ({rec.kidsStatus}) | นกหวีด {rec.whistleStatus} | ไฟกะพริบ {rec.lightStatus}
                    </p>
                    {rec.remarks && (
                      <p className="text-[11px] text-orange-750 font-medium font-sans">📝 หมายเหตุ: {rec.remarks}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-left md:text-right text-[10px] text-slate-500 font-mono">
                      <span className="block font-bold text-slate-700">วันที่ตรวจ: {rec.inspectionDate}</span>
                      <span className="block">โดย: {rec.inspectorName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-sans">
                      {rec.photoUrl && (
                        <img 
                          src={rec.photoUrl} 
                          alt="Attach" 
                          className="w-10 h-10 object-cover rounded border border-slate-250 cursor-pointer hover:scale-105 transition-transform"
                        />
                      )}
                      {matchedBoat && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditHistoryRecord(rec, matchedBoat)}
                            className="p-1.5 text-teal-800 hover:bg-teal-50 rounded border border-teal-200 cursor-pointer text-xs"
                            title="แก้ไขใบตรวจบันทึกนี้"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onDeleteInspection(rec.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200 cursor-pointer text-xs"
                            title="ลบใบตรวจบันทึกนี้"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
