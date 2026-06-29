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

import ctbLayoutImg from '../../Image/Layout_CTB_Boat.jpg';
import rLayoutImg from '../../Image/Layout_R_Boat.png';

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

// Reusable Passenger Cabin Seat Map Component
interface SeatMapGridProps {
  seats: BoatSeatLifeJacket[];
  interactive?: boolean;
  onSeatClick?: (seatId: string) => void;
  boatName?: string;
  cabinetStatuses?: {
    adultsStatus: LifeJacketItemStatus;
    kidsStatus: LifeJacketItemStatus;
    whistleStatus: LifeJacketItemStatus;
    lightStatus: LifeJacketItemStatus;
    cabinetStatus: LifeJacketItemStatus;
  };
  onCabinetClick?: (pointIndex: number) => void;
}

function SeatMapGrid({ 
  seats, 
  interactive, 
  onSeatClick, 
  boatName,
  cabinetStatuses,
  onCabinetClick
}: SeatMapGridProps) {
  const [viewMode, setViewMode] = useState<'diagram' | 'table'>('diagram');

  const isCTB = boatName ? boatName.toUpperCase().startsWith('CTB') : true;
  const layoutImg = isCTB ? ctbLayoutImg : rLayoutImg;

  // Calculate dynamic maxRows based on actual seats
  const maxRows = seats && seats.length > 0
    ? Math.max(...seats.map(s => {
        const m = s.id.match(/^(\d+)/);
        return m ? parseInt(m[1]) : 1;
      }))
    : (isCTB ? 22 : 21);

  const getSeatCoords = (seatId: string) => {
    const match = seatId.match(/^(\d+)([A-F])$/);
    if (!match) return { left: '0%', top: '0%' };
    const rowNum = parseInt(match[1]);
    const col = match[2];
    
    let left = 0;
    let top = 0;

    if (isCTB) {
      // Cabin spans from x: 28.5% to x: 80.0%
      left = 28.5 + (rowNum - 1) * ((80.0 - 28.5) / (maxRows - 1));
      if (col === 'A') top = 26.5;
      else if (col === 'B') top = 34.5;
      else if (col === 'C') top = 42.5;
      else if (col === 'D') top = 56.5;
      else if (col === 'E') top = 64.5;
      else if (col === 'F') top = 72.5;
    } else {
      // R Layout — mapped to actual chair positions on Layout_R_Boat.png
      // Seating cabin spans x: 18% (stern/entry side, row 1) to 72% (bow side, row 21)
      left = 18.0 + (rowNum - 1) * ((72.0 - 18.0) / (maxRows - 1));
      // Upper deck rows (port side)
      if (col === 'A') top = 14.0;
      else if (col === 'B') top = 21.0;
      else if (col === 'C') top = 28.0;
      // Lower deck rows (starboard side)
      else if (col === 'D') top = 55.0;
      else if (col === 'E') top = 62.0;
      else if (col === 'F') top = 69.0;
    }

    return { left: `${left}%`, top: `${top}%` };
  };

  const getCabinetStatusColor = (status?: LifeJacketItemStatus) => {
    if (!status || status === 'Normal') {
      return 'bg-emerald-500 hover:bg-emerald-450 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.7)] text-white';
    } else if (status === 'Damaged') {
      return 'bg-rose-600 hover:bg-rose-550 border-rose-800 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.9)]';
    } else {
      return 'bg-amber-500 hover:bg-amber-455 border-amber-650 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.7)]';
    }
  };

  const getCabinetLabel = (status: LifeJacketItemStatus) => {
    if (status === 'Normal') return '🟢 ปกติ';
    if (status === 'Damaged') return '🔴 ชำรุด';
    if (status === 'LowStock') return '🟡 ไม่พอ';
    if (status === 'Missing') return '🟠 สูญหาย';
    return status;
  };

  const cabinetPositions = isCTB
    ? [
        { x: 26.5, y: 28.5, label: '1', key: 'adultsStatus', name: 'ชูชีพผู้ใหญ่', desc: 'ชูชีพผู้ใหญ่ (Adults)' },
        { x: 68.5, y: 41.0, label: '2', key: 'kidsStatus', name: 'ชูชีพเด็ก', desc: 'ชูชีพเด็ก (Kids)' },
        { x: 68.5, y: 45.0, label: '3', key: 'whistleStatus', name: 'นกหวีด', desc: 'นกหวีด (Whistle)' },
        { x: 26.5, y: 68.0, label: '4', key: 'lightStatus', name: 'ไฟสัญญาณ', desc: 'ไฟสัญญาณ (Indicator Light)' },
        { x: 70.5, y: 41.5, label: '5', key: 'cabinetStatus', name: 'ตู้เก็บชูชีพ', desc: 'ตู้เก็บ/ที่จัดเก็บ (Storage Cabinet)' },
      ]
    : [
        { x: 18.0, y: 14.0, label: '1', key: 'adultsStatus', name: 'ชูชีพผู้ใหญ่', desc: 'ชูชีพผู้ใหญ่ (Adults) — จุดที่ 1 ฝั่งซ้ายท้ายเรือ' },
        { x: 58.0, y: 38.0, label: '2', key: 'kidsStatus', name: 'ชูชีพเด็ก', desc: 'ชูชีพเด็ก (Kids) — จุดที่ 2 ฝั่งซ้ายกลางเรือ' },
        { x: 58.0, y: 50.0, label: '3', key: 'whistleStatus', name: 'นกหวีด', desc: 'นกหวีด (Whistle) — จุดที่ 3 ฝั่งขวากลางเรือ' },
        { x: 18.0, y: 76.0, label: '4', key: 'lightStatus', name: 'ไฟสัญญาณ', desc: 'ไฟสัญญาณ (Indicator Light) — จุดที่ 4 ฝั่งขวาท้ายเรือ' },
        { x: 75.0, y: 44.0, label: '5', key: 'cabinetStatus', name: 'ตู้เก็บชูชีพ', desc: 'ตู้เก็บ/ที่จัดเก็บ (Storage Cabinet) — หัวเรือ' },
      ];

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-850 overflow-hidden shadow-xl select-none">
      {/* Mode Selector Header */}
      <div className="flex justify-between items-center bg-slate-950 px-3 py-2 border-b border-slate-850">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
          <span className="text-[10px] md:text-[11px] font-bold text-slate-300 font-mono uppercase">
            🚢 {boatName || 'Standard'} Seat Map
          </span>
        </div>
        <div className="flex bg-slate-900 p-0.5 rounded border border-slate-800 text-[9px] md:text-[10px]">
          <button
            type="button"
            onClick={() => setViewMode('diagram')}
            className={`px-2 py-0.5 rounded-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              viewMode === 'diagram' ? 'bg-orange-650 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="h-2.5 w-2.5" />
            ผังเรือจริง (Layout)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-2 py-0.5 rounded-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              viewMode === 'table' ? 'bg-orange-650 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="h-2.5 w-2.5" />
            ตารางย่อ (Grid)
          </button>
        </div>
      </div>

      {viewMode === 'diagram' ? (
        <div className="p-3 bg-slate-950 space-y-3">
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div className="relative w-full min-w-[760px] aspect-[1000/420] bg-white rounded border border-slate-800 overflow-hidden shadow-2xl mx-auto">
              
              {/* Image background */}
              <img
                src={layoutImg}
                alt={`${boatName || 'Boat'} Floor Plan`}
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />

              {/* Labels */}
              <div className="absolute top-2 left-2 text-[8px] font-mono font-bold text-slate-500 bg-slate-900/90 backdrop-blur-xs px-1.5 py-0.5 rounded border border-slate-800 pointer-events-none">
                กราบซ้าย (PORT SIDE)
              </div>
              <div className="absolute bottom-2 left-2 text-[8px] font-mono font-bold text-slate-500 bg-slate-900/90 backdrop-blur-xs px-1.5 py-0.5 rounded border border-slate-800 pointer-events-none">
                กราบขวา (STARBOARD SIDE)
              </div>
              <div className="absolute top-1/2 left-2 -translate-y-1/2 text-[8px] font-bold font-mono tracking-widest text-slate-400 bg-slate-900/80 backdrop-blur-xs px-1 py-1 rounded border border-slate-800 origin-center rotate-270 opacity-85 pointer-events-none">
                ◀ ท้ายเรือ (STERN)
              </div>
              <div className="absolute top-1/2 right-2 -translate-y-1/2 text-[8px] font-bold font-mono tracking-widest text-slate-400 bg-slate-900/80 backdrop-blur-xs px-1 py-1 rounded border border-slate-800 origin-center rotate-90 opacity-85 pointer-events-none">
                หัวเรือ (BOW) ▶
              </div>

              {/* Render dynamic absolute overlay seats */}
              {seats?.map((seat) => {
                const statusColor = 
                  seat.status === 'green' 
                    ? 'bg-emerald-500 hover:bg-emerald-450 border-emerald-600 text-white shadow-[0_0_6px_rgba(16,185,129,0.5)]' 
                    : seat.status === 'red'
                    ? 'bg-rose-600 hover:bg-rose-550 border-rose-700 text-white animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] border-red-500'
                    : 'bg-amber-500 hover:bg-amber-455 border-amber-600 text-slate-950 shadow-[0_0_6px_rgba(245,158,11,0.5)]';

                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={!interactive}
                    onClick={() => onSeatClick && onSeatClick(seat.id)}
                    style={getSeatCoords(seat.id)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border flex items-center justify-center font-mono font-extrabold text-[7px] transition-all z-20 ${statusColor} ${
                      interactive 
                        ? 'cursor-pointer hover:scale-125 active:scale-95' 
                        : 'cursor-default'
                    }`}
                    title={`ที่นั่ง ${seat.id}: ${
                      seat.status === 'green' ? 'มีเสื้อชูชีพปกติ' : seat.status === 'red' ? 'ไม่มีเสื้อชูชีพ' : 'มีเสื้อชูชีพแต่ชำรุด/เก่า'
                    }`}
                  >
                    {seat.id}
                  </button>
                );
              })}

            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center pt-2 border-t border-slate-900 text-[10px] font-bold text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-emerald-600 inline-block shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
              <span>มีชูชีพปกติ ({seats?.filter(s => s.status === 'green').length || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rose-600 rounded-full border border-rose-700 inline-block animate-pulse shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
              <span>ไม่มีชูชีพ ({seats?.filter(s => s.status === 'red').length || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full border border-amber-600 inline-block shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
              <span>ชูชีพชำรุด/เก่า ({seats?.filter(s => s.status === 'orange').length || 0})</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-950 space-y-3">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-b border-slate-850 pb-1.5 font-mono">
            <span>◀ ท้ายเรือ (STERN) / แผนผังที่นั่งเสื้อชูชีพ</span>
            <span>หัวเรือ (BOW) ▶</span>
          </div>

          <div 
            className="grid gap-1 overflow-x-auto py-1"
            style={{ gridTemplateColumns: `repeat(${maxRows}, minmax(0, 1fr))` }}
          >
            {['A', 'B', 'C', 'Aisle', 'D', 'E', 'F'].map((col) => {
              if (col === 'Aisle') {
                return (
                  <div 
                    key="aisle" 
                    className="flex items-center justify-center my-1.5"
                    style={{ gridColumn: `span ${maxRows} / span ${maxRows}` }}
                  >
                    <div className="w-full h-[1px] bg-slate-800 flex items-center justify-center">
                      <span className="bg-slate-950 px-2 text-[8px] text-slate-500 font-mono font-bold tracking-widest uppercase">
                        ทางเดิน (AISLE)
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <React.Fragment key={col}>
                  {Array.from({ length: maxRows }, (_, rIdx) => {
                    const rowNum = rIdx + 1;
                    const seatId = `${rowNum}${col}`;
                    const seat = seats?.find(s => s.id === seatId);
                    
                    if (!seat) {
                      return (
                        <div key={seatId} className="h-7 rounded border border-transparent opacity-0 pointer-events-none" />
                      );
                    }
                    
                    const statusColor = 
                      seat.status === 'green' 
                        ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-700 text-emerald-50' 
                        : seat.status === 'red'
                        ? 'bg-rose-650 hover:bg-rose-600 border-rose-800 text-rose-50 animate-pulse'
                        : 'bg-amber-500 hover:bg-amber-450 border-amber-650 text-slate-950';

                    return (
                      <button
                        key={seatId}
                        type="button"
                        disabled={!interactive}
                        onClick={() => onSeatClick && onSeatClick(seatId)}
                        className={`h-7 rounded border font-mono font-bold text-[9px] flex flex-col items-center justify-center transition-all ${statusColor} ${
                          interactive 
                            ? 'cursor-pointer active:scale-90 active:opacity-85' 
                            : 'cursor-default'
                        }`}
                        title={`ที่นั่ง ${seatId}: ${
                          seat.status === 'green' ? 'มีเสื้อชูชีพปกติ' : seat.status === 'red' ? 'ไม่มีเสื้อชูชีพ' : 'มีเสื้อชูชีพแต่ชำรุด/เก่า'
                        }`}
                      >
                        <span>{seatId}</span>
                        <span className="text-[6px] leading-none mt-0.5">
                          {seat.status === 'green' ? '🟢' : seat.status === 'red' ? '🔴' : '🟠'}
                        </span>
                      </button>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
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
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full uppercase">
            ยังไม่ได้ตรวจรอบนี้
          </span>
        );
    }
  };

  const getItemStatusLabel = (status: LifeJacketItemStatus) => {
    switch (status) {
      case 'Normal':
        return <span className="text-emerald-600 font-bold">ปกติ (Normal)</span>;
      case 'Damaged':
        return <span className="text-rose-600 font-bold">ชำรุด (Damaged)</span>;
      case 'LowStock':
        return <span className="text-amber-600 font-bold">ไม่เพียงพอ (Low Stock)</span>;
      case 'Missing':
        return <span className="text-orange-600 font-bold">สูญหาย (Missing)</span>;
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
        <div className="bg-white p-4 rounded border border-slate-200 shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg border border-orange-100">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">ชูชีพทั้งกองเรือ</span>
            <span className="text-xl font-black text-slate-900 font-mono">{totalFleetJackets} ตัว</span>
            <span className="block text-[9px] text-slate-500">ผู้ใหญ่ {totalFleetAdults} / เด็ก {totalFleetKids}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg border border-green-100">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">ตรวจครบแล้ว</span>
            <span className="text-xl font-black text-slate-900 font-mono">{fleetInspectedCount} / {jackets.length} ลำ</span>
            <span className="block text-[9px] text-slate-500">อัตราผ่านเกณฑ์ {passPercent}%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">พบข้อบกพร่อง</span>
            <span className="text-xl font-black text-slate-900 font-mono">{fleetIssuesCount} ลำ</span>
            <span className="block text-[9px] text-slate-500">ต้องเร่งจัดสรรอุปกรณ์ทดแทน</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">ประวัติการตรวจบันทึก</span>
            <span className="text-xl font-black text-slate-900 font-mono">{history.length} รายการ</span>
            <span className="block text-[9px] text-slate-500">เรียงตามการลงทะเบียนล่าสุด</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border rounded border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar Header with Dropdown Selector */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
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
            <select
              value={activeBoatId}
              onChange={(e) => loadBoat(e.target.value)}
              className="px-3 py-1.5 border border-orange-350 rounded-md bg-white font-black text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-650 cursor-pointer min-w-[200px] shadow-3xs"
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
          <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-950">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-orange-650 text-white font-mono font-black text-sm rounded-lg shadow-sm">
                {activeBoat.boatId}
              </span>
              <div>
                <strong className="text-lg font-black tracking-tight text-white block leading-none">{activeBoat.boatName}</strong>
                <span className="text-[10px] text-slate-400 font-mono block mt-1.5">
                  ตรวจสอบล่าสุด: {activeBoat.lastInspectedDate || 'ยังไม่มีบันทึก'} | ผู้ตรวจล่าสุด: {activeBoat.lastInspector || 'ไม่มีข้อมูล'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="px-3 py-1 bg-slate-800 rounded border border-slate-700 font-mono">
                <span className="text-slate-400">ชูชีพผู้ใหญ่:</span> <strong className="text-slate-200">{activeBoat.totalAdults} ตัว</strong>
              </div>
              <div className="px-3 py-1 bg-slate-800 rounded border border-slate-700 font-mono">
                <span className="text-slate-400">ชูชีพเด็ก:</span> <strong className="text-slate-200">{activeBoat.totalKids} ตัว</strong>
              </div>
              {getStatusBadge(activeBoat.overallStatus)}
            </div>
          </div>
        )}

        {/* Interactive Workspace Grid */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Inspection form (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-3xs space-y-4">
              <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1">
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
                  <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    ชื่อผู้ตรวจสอบความปลอดภัย (Inspector) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    placeholder="ระบุชื่อผู้ดำเนินการ..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    วันที่ตรวจสอบ (Audit Date)
                  </label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Quantity Inputs */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                    ชูชีพผู้ใหญ่ (Adults)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalAdults}
                    onChange={(e) => setTotalAdults(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none font-mono font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                    ชูชีพเด็ก (Kids)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalKids}
                    onChange={(e) => setTotalKids(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Item Statuses dropdowns */}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
                      สภาพชูชีพผู้ใหญ่
                    </label>
                    <select
                      value={adultsStatus}
                      onChange={(e) => setAdultsStatus(e.target.value as LifeJacketItemStatus)}
                      className="w-full px-1.5 py-1 border border-slate-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold"
                    >
                      <option value="Normal">🟢 ปกติสมบูรณ์</option>
                      <option value="Damaged">🔴 ชำรุด/ขาด</option>
                      <option value="LowStock">🟡 ไม่พอ</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
                      สภาพชูชีพเด็ก
                    </label>
                    <select
                      value={kidsStatus}
                      onChange={(e) => setKidsStatus(e.target.value as LifeJacketItemStatus)}
                      className="w-full px-1.5 py-1 border border-slate-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold"
                    >
                      <option value="Normal">🟢 ปกติสมบูรณ์</option>
                      <option value="Damaged">🔴 ชำรุด/ขาด</option>
                      <option value="LowStock">🟡 ไม่พอ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
                      สภาพนกหวีด
                    </label>
                    <select
                      value={whistleStatus}
                      onChange={(e) => setWhistleStatus(e.target.value as LifeJacketItemStatus)}
                      className="w-full px-1.5 py-1 border border-slate-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold"
                    >
                      <option value="Normal">🟢 มีครบถ้วน</option>
                      <option value="Missing">🟠 สูญหายบางตัว</option>
                      <option value="Damaged">🔴 ชำรุด</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
                      ไฟสัญญาณกะพริบ
                    </label>
                    <select
                      value={lightStatus}
                      onChange={(e) => setLightStatus(e.target.value as LifeJacketItemStatus)}
                      className="w-full px-1.5 py-1 border border-slate-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold"
                    >
                      <option value="Normal">🟢 ปกติ</option>
                      <option value="Missing">🟠 ไม่มี/หาย</option>
                      <option value="Damaged">🔴 เสีย/ถ่านหมด</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
                    ตู้/กล่อง/ที่จัดเก็บความปลอดภัย
                  </label>
                  <select
                    value={cabinetStatus}
                    onChange={(e) => setCabinetStatus(e.target.value as LifeJacketItemStatus)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold"
                  >
                    <option value="Normal">🟢 สะอาด หยิบใช้ง่าย</option>
                    <option value="Damaged">🔴 ประตูตู้ชำรุด</option>
                    <option value="Missing">🟠 มีสิ่งของอื่นกีดขวาง</option>
                  </select>
                </div>
              </div>

              {/* Attach Photo */}
              <div className="space-y-1 border-t border-slate-200 pt-3">
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
              <div className="space-y-1 border-t border-slate-200 pt-3">
                <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  หมายเหตุเพิ่มเติม / ข้อเสนอแนะการแก้ไข
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="ระบุรายละเอียดอุปกรณ์ที่ต้องซ่อมบำรุงหรือเปลี่ยนทดแทน..."
                  rows={2}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Form Submission Controls */}
              <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
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
            <div className="bg-slate-900 rounded-xl p-2 border border-slate-950">
              <div className="flex items-center justify-between px-3 py-1 text-slate-400 text-[10px] font-bold font-mono">
                <span>🖥️ VIEWPORT: INTERACTIVE TACTILE COMPLIANCE GRID</span>
                <span className="text-orange-400 font-bold">จิ้มตรวจสอบเสื้อชูชีพแบบเต็มจอได้ที่ผังนี้</span>
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
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="p-2 rounded bg-emerald-50 border border-emerald-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">ชูชีพปกติ (🟢)</span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  {formSeats.filter(s => s.status === 'green').length} ตัว
                </span>
              </div>
              <div className="p-2 rounded bg-rose-50 border border-rose-100 animate-pulse">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">ไม่มีชูชีพ (🔴)</span>
                <span className="text-lg font-black text-rose-700 font-mono">
                  {formSeats.filter(s => s.status === 'red').length} ตัว
                </span>
              </div>
              <div className="p-2 rounded bg-amber-50 border border-amber-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">ชูชีพชำรุด (🟠)</span>
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
        <div className="bg-white border rounded border-slate-200 shadow-sm mt-6">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              📜 ประวัติบันทึกการตรวจสอบความปลอดภัยของเสื้อชูชีพ (Life Jacket Inspection Logs)
            </h4>
            <span className="text-[10px] text-slate-400 font-mono font-bold">
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
                      <span className="font-bold text-slate-800 font-mono">{rec.boatName} ({rec.boatId})</span>
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
