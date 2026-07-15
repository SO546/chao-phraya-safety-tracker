import React, { useState, useRef, useCallback } from 'react';
import { Map, Grid, Save, CheckCircle2 } from 'lucide-react';
import { BoatSeatLifeJacket, LifeJacketItemStatus } from '../types';

const ctbLayoutImg = '/Layout_CTB_Boat.jpg';
const rLayoutImg = '/Layout_R_Boat.png';

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



// Precomputed seat grid positions for CTB boats (Layout_CTB_Boat.jpg)
const ctbSeatGridMap: Record<string, { col: number; row: number }> = (() => {
  const map: Record<string, { col: number; row: number }> = {};
  
  // 1. Port side (Rows 0-2, Columns 0-14)
  const portSeats = [
    ['1C', '22B', '21B'],
    ['18B', '19B', '20B'],
    ['17B', '16B', '15B'],
    ['12B', '13B', '14B'],
    ['11B', '10B', '9B'],
    ['6B', '7B', '8B'],
    ['3B', '4B', '5B'],
    ['2B', '1B', '1A'],
    ['4A', '3A', '2A'],
    ['5A', '6A', '7A'],
    ['10A', '9A', '8A'],
    ['11A', '12A', '13A'],
    ['16A', '15A', '14A'],
    ['17A', '18A', '19A'],
    ['22A', '21A', '20A']
  ];
  for (let c = 0; c < 15; c++) {
    for (let r = 0; r < 3; r++) {
      if (portSeats[c] && portSeats[c][r]) {
        map[portSeats[c][r]] = { col: c, row: r };
      }
    }
  }

  // 2. Center side (Rows 3-6, Columns 4-13)
  const centerSeats = [
    ['19D', '18D', '17D', '16D'],
    ['12D', '13D', '14D', '15D'],
    ['11D', '10D', '9D', '8D'],
    ['4D', '5D', '6D', '7D'],
    ['3D', '2D', '1D', '2C'],
    ['5C', '4C', '3C', '6C'],
    ['9C', '8C', '7C', '10C'],
    ['11C', '12C', '13C', '14C'],
    ['17C', '16C', '15C', '18C'],
    ['19C', '20D', '21D', '22D']
  ];
  for (let c = 0; c < 10; c++) {
    for (let r = 0; r < 4; r++) {
      if (centerSeats[c] && centerSeats[c][r]) {
        map[centerSeats[c][r]] = { col: c + 4, row: r + 3 };
      }
    }
  }

  // 3. Starboard side (Rows 7-9, Columns 0-14)
  const starboardSeats = [
    ['21F', '20F', '19F'],
    ['16F', '17F', '18F'],
    ['15F', '14F', '13F'],
    ['10F', '11F', '12F'],
    ['9F', '8F', '7F'],
    ['4F', '5F', '6F'],
    ['3F', '2F', '1F'],
    ['1E', '2E', '3E'],
    ['6E', '5E', '4E'],
    ['7E', '8E', '9E'],
    ['12E', '11E', '10E'],
    ['13E', '14E', '15E'],
    ['18E', '17E', '16E'],
    ['19E', '20E', '21E'],
    ['22C', '21C', '20C']
  ];
  for (let c = 0; c < 15; c++) {
    for (let r = 0; r < 3; r++) {
      if (starboardSeats[c] && starboardSeats[c][r]) {
        map[starboardSeats[c][r]] = { col: c, row: r + 7 };
      }
    }
  }

  return map;
})();

// Precomputed seat grid positions for R boats (Layout_R_Boat.png)
const rSeatGridMap: Record<string, { col: number; row: number }> = (() => {
  const map: Record<string, { col: number; row: number }> = {};
  
  // Port side block (columns A, B, C) mapped to columns 0 to 20, rows 0 to 2
  for (let colIdx = 0; colIdx < 21; colIdx++) {
    let r1, r2, r3;
    if (colIdx >= 14) { // Columns 14-20: A seats
      const aGroupIdx = 20 - colIdx;
      const baseRow = aGroupIdx * 3 + 1;
      const isDescending = colIdx === 17 || colIdx === 15;
      if (isDescending) {
        r1 = `${baseRow + 2}A`;
        r2 = `${baseRow + 1}A`;
        r3 = `${baseRow}A`;
      } else {
        r1 = `${baseRow}A`;
        r2 = `${baseRow + 1}A`;
        r3 = `${baseRow + 2}A`;
      }
    } else if (colIdx >= 7) { // Columns 7-13: B seats
      const bGroupIdx = 13 - colIdx;
      const baseRow = bGroupIdx * 3 + 1;
      const isDescending = colIdx === 11 || colIdx === 9 || colIdx === 7;
      if (isDescending) {
        r1 = `${baseRow + 2}B`;
        r2 = `${baseRow + 1}B`;
        r3 = `${baseRow}B`;
      } else {
        r1 = `${baseRow}B`;
        r2 = `${baseRow + 1}B`;
        r3 = `${baseRow + 2}B`;
      }
    } else { // Columns 0-6: C seats
      const cGroupIdx = 6 - colIdx;
      const baseRow = cGroupIdx * 3 + 1;
      const isDescending = colIdx === 4 || colIdx === 2 || colIdx === 0;
      if (isDescending) {
        r1 = `${baseRow + 2}C`;
        r2 = `${baseRow + 1}C`;
        r3 = `${baseRow}C`;
      } else {
        r1 = `${baseRow}C`;
        r2 = `${baseRow + 1}C`;
        r3 = `${baseRow + 2}C`;
      }
    }
    
    map[r1] = { col: colIdx, row: 0 };
    map[r2] = { col: colIdx, row: 1 };
    map[r3] = { col: colIdx, row: 2 };
  }

  // Starboard side block (columns D, E, F) mapped to columns 0 to 20, rows 3 to 5
  for (let colIdx = 0; colIdx < 21; colIdx++) {
    let r1, r2, r3;
    if (colIdx >= 14) { // Columns 14-20: D seats
      const dGroupIdx = 20 - colIdx;
      const baseRow = dGroupIdx * 3 + 1;
      const isDescending = colIdx === 17 || colIdx === 15;
      if (isDescending) {
        r1 = `${baseRow + 2}D`;
        r2 = `${baseRow + 1}D`;
        r3 = `${baseRow}D`;
      } else {
        r1 = `${baseRow}D`;
        r2 = `${baseRow + 1}D`;
        r3 = `${baseRow + 2}D`;
      }
    } else if (colIdx >= 7) { // Columns 7-13: E seats
      const eGroupIdx = 13 - colIdx;
      const baseRow = eGroupIdx * 3 + 1;
      const isDescending = colIdx === 11 || colIdx === 9 || colIdx === 7;
      if (isDescending) {
        r1 = `${baseRow + 2}E`;
        r2 = `${baseRow + 1}E`;
        r3 = `${baseRow}E`;
      } else {
        r1 = `${baseRow}E`;
        r2 = `${baseRow + 1}E`;
        r3 = `${baseRow + 2}E`;
      }
    } else { // Columns 0-6: F seats
      const fGroupIdx = 6 - colIdx;
      const baseRow = fGroupIdx * 3 + 1;
      const isDescending = colIdx === 4 || colIdx === 2 || colIdx === 0;
      if (isDescending) {
        r1 = `${baseRow + 2}F`;
        r2 = `${baseRow + 1}F`;
        r3 = `${baseRow}F`;
      } else {
        r1 = `${baseRow}F`;
        r2 = `${baseRow + 1}F`;
        r3 = `${baseRow + 2}F`;
      }
    }
    
    map[r1] = { col: colIdx, row: 3 };
    map[r2] = { col: colIdx, row: 4 };
    map[r3] = { col: colIdx, row: 5 };
  }

  return map;
})();

export default function SeatMapGrid({ 
  seats, 
  interactive, 
  onSeatClick, 
  boatName,
  cabinetStatuses,
  onCabinetClick
}: SeatMapGridProps) {
  const [viewMode, setViewMode] = useState<'diagram' | 'table'>('diagram');
  const containerRef = useRef<HTMLDivElement>(null);

  // Load custom seat positions from localStorage
  const [customPositions, setCustomPositions] = useState<Record<string, Record<string, { left: string; top: string }>>>(() => {
    try {
      // Clear old v2 positions so the new layout defaults show up automatically
      const version = localStorage.getItem('boat_seat_positions_version');
      if (version !== 'v3') {
        localStorage.removeItem('boat_seat_positions');
        localStorage.setItem('boat_seat_positions_version', 'v3');
        return {};
      }
      const saved = localStorage.getItem('boat_seat_positions');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Track whether positions have been modified since last explicit save
  const [savedPositionsSnapshot, setSavedPositionsSnapshot] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('boat_seat_positions');
      return saved || '{}';
    } catch { return '{}'; }
  });
  const [showSavedToast, setShowSavedToast] = useState(false);

  const hasUnsavedChanges = JSON.stringify(customPositions) !== savedPositionsSnapshot;

  const handleSavePositions = useCallback(() => {
    const json = JSON.stringify(customPositions);
    localStorage.setItem('boat_seat_positions', json);
    setSavedPositionsSnapshot(json);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  }, [customPositions]);

  // Cabinet status indicator positions for CTB and R boats
  const cabinetPositions = isCTB
    ? [
        { x: 26.5, y: 28.5, label: '1', key: 'adultsStatus', name: 'ชูชีพผู้ใหญ่', desc: 'ชูชีพผู้ใหญ่ (Adults)' },
        { x: 68.5, y: 20.0, label: '2', key: 'kidsStatus', name: 'ชูชีพเด็ก', desc: 'ชูชีพเด็ก (Kids)' },
        { x: 68.5, y: 78.0, label: '3', key: 'whistleStatus', name: 'นกหวีด', desc: 'นกหวีด (Whistle)' },
        { x: 26.5, y: 72.0, label: '4', key: 'lightStatus', name: 'ไฟสัญญาณ', desc: 'ไฟสัญญาณ (Indicator Light)' },
        { x: 78.0, y: 42.0, label: '5', key: 'cabinetStatus', name: 'ตู้เก็บชูชีพ', desc: 'ตู้เก็บ/ที่จัดเก็บ (Storage Cabinet)' },
      ]
    : [
        { x: 18.0, y: 14.0, label: '1', key: 'adultsStatus', name: 'ชูชีพผู้ใหญ่', desc: 'ชูชีพผู้ใหญ่ (Adults) — จุดที่ 1 ฝั่งซ้ายท้ายเรือ' },
        { x: 58.0, y: 20.0, label: '2', key: 'kidsStatus', name: 'ชูชีพเด็ก', desc: 'ชูชีพเด็ก (Kids) — จุดที่ 2 หัวเรือชั้นบน' },
        { x: 60.0, y: 73.0, label: '3', key: 'whistleStatus', name: 'นกหวีด', desc: 'นกหวีด (Whistle) — จุดที่ 3 หัวเรือชั้นล่าง' },
        { x: 18.0, y: 73.0, label: '4', key: 'lightStatus', name: 'ไฟสัญญาณ', desc: 'ไฟสัญญาณ (Indicator Light) — จุดที่ 4 ท้ายเรือชั้นล่าง' },
      ];

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
    const boatKey = boatName || 'Standard';
    if (customPositions[boatKey] && customPositions[boatKey][seatId]) {
      return customPositions[boatKey][seatId];
    }

    if (isCTB) {
      const pos = ctbSeatGridMap[seatId];
      if (!pos) return { left: '0%', top: '0%' };
      const left = 28.5 + pos.col * ((80.0 - 28.5) / 14);
      const topMap = [26.5, 34.5, 42.5, 46.5, 49.5, 52.5, 55.5, 60.5, 67.5, 74.5];
      const top = topMap[pos.row];
      return { left: `${left}%`, top: `${top}%` };
    } else {
      const pos = rSeatGridMap[seatId];
      if (!pos) return { left: '0%', top: '0%' };
      const left = 18.0 + pos.col * ((72.0 - 18.0) / 20);
      const topMap = [14.0, 21.0, 28.0, 35.0, 42.0, 49.0];
      const top = topMap[pos.row];
      return { left: `${left}%`, top: `${top}%` };
    }
  };

  const handleResetPositions = () => {
    setCustomPositions((prev) => {
      const next = { ...prev };
      delete next[boatName || 'Standard'];
      localStorage.setItem('boat_seat_positions', JSON.stringify(next));
      return next;
    });
  };

  // Mouse drag handler for repositioning dots
  const handleMouseDown = (seatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let hasDragged = false;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasDragged = true;
      }

      const x = moveEvent.clientX - rect.left;
      const y = moveEvent.clientY - rect.top;
      
      const leftPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const topPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));

      setCustomPositions((prev) => {
        const boatKey = boatName || 'Standard';
        const next = {
          ...prev,
          [boatKey]: {
            ...(prev[boatKey] || {}),
            [seatId]: { left: `${leftPercent.toFixed(2)}%`, top: `${topPercent.toFixed(2)}%` },
          },
        };
        localStorage.setItem('boat_seat_positions', JSON.stringify(next));
        return next;
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (!hasDragged && interactive && onSeatClick) {
        onSeatClick(seatId);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Touch drag handler for repositioning dots (mobile/tablet friendly)
  const handleTouchStart = (seatId: string, e: React.TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touchStart = e.touches[0];
    const startX = touchStart.clientX;
    const startY = touchStart.clientY;
    let hasDragged = false;

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
      const touch = moveEvent.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasDragged = true;
      }

      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const leftPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const topPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));

      setCustomPositions((prev) => {
        const boatKey = boatName || 'Standard';
        const next = {
          ...prev,
          [boatKey]: {
            ...(prev[boatKey] || {}),
            [seatId]: { left: `${leftPercent.toFixed(2)}%`, top: `${topPercent.toFixed(2)}%` },
          },
        };
        localStorage.setItem('boat_seat_positions', JSON.stringify(next));
        return next;
      });
    };

    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (!hasDragged && interactive && onSeatClick) {
        onSeatClick(seatId);
      }
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-300 overflow-hidden shadow-xl select-none">
      <div className="flex justify-between items-center bg-white px-3 py-2 border-b border-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
          <span className="text-[10px] md:text-[11px] font-bold text-slate-700 font-mono uppercase">
            🚢 {boatName || 'Standard'} Seat Map
          </span>
          {Object.keys(customPositions[boatName || 'Standard'] || {}).length > 0 && (
            <button
              onClick={handleResetPositions}
              className="ml-2 text-[9px] font-black text-rose-700 bg-rose-50/40 hover:bg-rose-200 border border-rose-300 px-2 py-0.5 rounded cursor-pointer transition-all uppercase font-sans flex items-center gap-1"
              title="รีเซ็ตพิกัดตำแหน่งที่นั่งทั้งหมดเป็นค่าเริ่มต้น"
            >
              🔄 รีเซ็ตจุด
            </button>
          )}
          {/* Save Changes Button */}
          <button
            onClick={handleSavePositions}
            className={`ml-2 text-[9px] font-black px-2.5 py-1 rounded cursor-pointer transition-all uppercase font-sans flex items-center gap-1 shadow-sm ${
              hasUnsavedChanges
                ? 'bg-teal-600 hover:bg-teal-700 text-white border border-teal-700 animate-pulse'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
            }`}
            title="บันทึกตำแหน่งจุดที่ลากจัดเรียงไว้ลงเครื่อง"
          >
            <Save className="h-3 w-3" />
            {hasUnsavedChanges ? '💾 บันทึกการเปลี่ยนแปลง' : '✅ บันทึกแล้ว'}
          </button>
          {/* Saved Toast */}
          {showSavedToast && (
            <span className="ml-2 text-[9px] font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="h-3 w-3" /> บันทึกสำเร็จ!
            </span>
          )}
        </div>
        <div className="flex bg-white p-0.5 rounded border border-slate-300 text-[9px] md:text-[10px]">
          <button
            type="button"
            onClick={() => setViewMode('diagram')}
            className={`px-2 py-0.5 rounded-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              viewMode === 'diagram' ? 'bg-orange-650 text-slate-950' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <Map className="h-2.5 w-2.5" />
            ผังเรือจริง (Layout)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-2 py-0.5 rounded-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              viewMode === 'table' ? 'bg-orange-650 text-slate-950' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <Grid className="h-2.5 w-2.5" />
            ตารางย่อ (Grid)
          </button>
        </div>
      </div>

      {viewMode === 'diagram' ? (
        <div className="p-3 bg-white space-y-3">
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div 
              ref={containerRef}
              className="relative w-full min-w-[760px] aspect-[1000/420] bg-white rounded border border-slate-300 overflow-hidden shadow-2xl mx-auto"
            >
              <img
                src={layoutImg}
                alt={`${boatName || 'Boat'} Floor Plan`}
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 text-[8px] font-mono font-bold text-slate-500 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded border border-slate-300 pointer-events-none">
                กราบซ้าย (PORT SIDE)
              </div>
              <div className="absolute bottom-2 left-2 text-[8px] font-mono font-bold text-slate-500 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded border border-slate-300 pointer-events-none">
                กราบขวา (STARBOARD SIDE)
              </div>
              <div className="absolute top-1/2 left-2 -translate-y-1/2 text-[8px] font-bold font-mono tracking-widest text-slate-500 bg-white/80 backdrop-blur-xs px-1 py-1 rounded border border-slate-300 origin-center rotate-270 opacity-85 pointer-events-none">
                ◀ ท้ายเรือ (STERN)
              </div>
              <div className="absolute top-1/2 right-2 -translate-y-1/2 text-[8px] font-bold font-mono tracking-widest text-slate-500 bg-white/80 backdrop-blur-xs px-1 py-1 rounded border border-slate-300 origin-center rotate-90 opacity-85 pointer-events-none">
                หัวเรือ (BOW) ▶
              </div>

              {seats?.map((seat) => {
                const statusColor = 
                  seat.status === 'green' 
                    ? 'bg-emerald-500 hover:bg-emerald-450 border-emerald-600 text-slate-950 shadow-[0_0_6px_rgba(16,185,129,0.5)]' 
                    : seat.status === 'red'
                    ? 'bg-rose-600 hover:bg-rose-550 border-rose-700 text-slate-950 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] border-red-500'
                    : 'bg-amber-500 hover:bg-amber-455 border-amber-600 text-slate-950 shadow-[0_0_6px_rgba(245,158,11,0.5)]';

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onMouseDown={(e) => handleMouseDown(seat.id, e)}
                    onTouchStart={(e) => handleTouchStart(seat.id, e)}
                    style={getSeatCoords(seat.id)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border flex items-center justify-center font-mono font-extrabold text-[7px] transition-all z-20 ${statusColor} cursor-move hover:scale-130 active:scale-95`}
                    title={`ที่นั่ง ${seat.id}: ${
                      seat.status === 'green' ? 'มีเสื้อชูชีพปกติ' : seat.status === 'red' ? 'ไม่มีเสื้อชูชีพ' : 'มีเสื้อชูชีพแต่ชำรุด/เก่า'
                    } (คลิกเพื่อเปลี่ยนสถานะ / ลากเพื่อจัดตำแหน่งได้)`}
                  >
                    {seat.id}
                  </button>
                );
              })}

              {/* Cabinet Status Indicator Points (numbered circles) */}
              {cabinetStatuses && cabinetPositions.map((point, idx) => {
                const statusKey = point.key as keyof typeof cabinetStatuses;
                const status = cabinetStatuses[statusKey];
                const pointColor = status === 'Normal'
                  ? 'bg-emerald-500 border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                  : 'bg-rose-600 border-rose-800 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]';
                return (
                  <button
                    key={`cabinet-${point.label}`}
                    type="button"
                    onClick={() => onCabinetClick && onCabinetClick(idx + 1)}
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 flex items-center justify-center font-mono font-black text-[11px] text-white z-30 cursor-pointer hover:scale-125 active:scale-95 transition-all ${pointColor}`}
                    title={`${point.desc}: ${status === 'Normal' ? '🟢 ปกติ' : '🔴 ผิดปกติ'} (คลิกเพื่อสลับสถานะ)`}
                  >
                    {point.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[10px] font-bold text-slate-500 font-mono">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center sm:justify-start">
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
            <div className="text-[9px] text-slate-500 font-sans text-center sm:text-right italic">
              💡 ท่านสามารถลากจุดที่นั่งเพื่อขยับปรับตำแหน่งให้อยู่บนภาพแปลนได้อย่างอิสระตามความจริง
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-white space-y-3">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-300 pb-1.5 font-mono">
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
                    <div className="w-full h-[1px] bg-white flex items-center justify-center">
                      <span className="bg-white px-2 text-[8px] text-slate-500 font-mono font-bold tracking-widest uppercase">
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
