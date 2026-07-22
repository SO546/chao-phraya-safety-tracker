import React, { useState, useRef } from 'react';
import { Map, Grid } from 'lucide-react';
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
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [savedConfirmed, setSavedConfirmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load custom seat positions from localStorage
  const [customPositions, setCustomPositions] = useState<Record<string, Record<string, { left: string; top: string }>>>(() => {
    try {
      // Clear old v10 positions so the new layout defaults show up automatically
      const version = localStorage.getItem('boat_seat_positions_version');
      if (version !== 'v11') {
        localStorage.removeItem('boat_seat_positions');
        localStorage.setItem('boat_seat_positions_version', 'v11');
        return {};
      }
      const saved = localStorage.getItem('boat_seat_positions');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

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
    // For R-boats (R1, R2, R3, R4), fallback to R1's custom layout if available
    if (!isCTB && customPositions['R1'] && customPositions['R1'][seatId]) {
      return customPositions['R1'][seatId];
    }

    const match = seatId.match(/^(\d+)([A-F])$/);
    if (!match) return { left: '50%', top: '50%' };
    const rowNum = parseInt(match[1]);
    const col = match[2];

    if (isCTB) {
      // CTB: 130 seats generated in order (r=1..22, c=A..F, skip 22E,22F)
      // Layout: top 3×15=45, center 4×10=40, bottom 3×15=45 → total 130
      //
      // Compute the sequential index of this seat in the generation order.
      const colOrder = ['A', 'B', 'C', 'D', 'E', 'F'];
      const colIdx = colOrder.indexOf(col);
      if (colIdx < 0) return { left: '50%', top: '50%' };
      
      // Seats 22E and 22F don't exist
      if (rowNum === 22 && colIdx >= 4) return { left: '50%', top: '50%' };
      
      const seatIndex = (rowNum - 1) * 6 + colIdx;
      if (seatIndex < 0 || seatIndex >= 130) return { left: '50%', top: '50%' };

      // Map sequential index → physical position on CTB layout image
      // Image: bow on right (~80.0%), stern on left (~28.5%)
      // "เน้นจากหัวเรือไปท้ายเรือ" -> index 0 starts at the bow (rightmost, 80%)
      const topLeftStart  = 28.5;
      const topLeftEnd    = 80.0;
      const topLeftStep   = (topLeftEnd - topLeftStart) / 14; // 15 positions → 14 gaps

      // Center section: 4 rows × 10 cols
      const ctrLeftStart  = 37.0;
      const ctrLeftEnd    = 76.5;
      const ctrLeftStep   = (ctrLeftEnd - ctrLeftStart) / 9; // 10 positions → 9 gaps

      let leftPct: number;
      let topPct: number;

      if (seatIndex < 45) {
        // TOP section: 3 rows × 15 seats (A, B, C rows)
        const physRow = Math.floor(seatIndex / 15); // 0, 1, 2
        const physCol = seatIndex % 15;              // 0..14 (bow→stern)
        leftPct = topLeftEnd - physCol * topLeftStep;
        topPct  = [25.5, 33.0, 41.0][physRow];
      } else if (seatIndex < 85) {
        // CENTER section: 4 rows × 10 seats
        const i = seatIndex - 45;
        const physRow = Math.floor(i / 10); // 0, 1, 2, 3
        const physCol = i % 10;              // 0..9 (bow→stern)
        leftPct = ctrLeftEnd - physCol * ctrLeftStep;
        topPct  = [47.0, 51.5, 56.0, 60.5][physRow];
      } else {
        // BOTTOM section: 3 rows × 15 seats (D, E, F rows)
        const i = seatIndex - 85;
        const physRow = Math.floor(i / 15); // 0, 1, 2
        const physCol = i % 15;              // 0..14 (bow→stern)
        leftPct = topLeftEnd - physCol * topLeftStep;
        topPct  = [66.5, 74.5, 82.0][physRow];
      }

      return { left: `${leftPct.toFixed(2)}%`, top: `${topPct}%` };

    } else {
      // R Boat: seats span Upperdeck (port A,B,C) and Maindeck (starboard D,E,F)
      // rowNum 1-21. Also reversed to go from bow (right, 74%) to stern (left, 20%)
      const leftPct = 74.0 - (rowNum - 1) * ((74.0 - 20.0) / 20);
      let topPct: number;
      if      (col === 'A') topPct = 17.0;
      else if (col === 'B') topPct = 24.0;
      else if (col === 'C') topPct = 31.0;
      else if (col === 'D') topPct = 59.0;
      else if (col === 'E') topPct = 66.0;
      else                  topPct = 73.0; // F
      return { left: `${leftPct.toFixed(2)}%`, top: `${topPct}%` };
    }
  };

  const handleResetPositions = () => {
    setCustomPositions((prev) => {
      const next = { ...prev };
      delete next[boatName || 'Standard'];
      localStorage.setItem('boat_seat_positions', JSON.stringify(next));
      return next;
    });
    setHasPendingChanges(false);
    setSavedConfirmed(false);
  };

  const handleSavePositions = () => {
    // Positions are already saved in localStorage during drag, just confirm and lock
    const boatKey = boatName || 'Standard';
    const current = customPositions[boatKey] || {};
    const saved = JSON.parse(localStorage.getItem('boat_seat_positions') || '{}');
    saved[boatKey] = current;
    localStorage.setItem('boat_seat_positions', JSON.stringify(saved));
    setHasPendingChanges(false);
    setSavedConfirmed(true);
    setTimeout(() => setSavedConfirmed(false), 2500);
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

      setHasPendingChanges(true);
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

      setHasPendingChanges(true);
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
          {hasPendingChanges && (
            <button
              onClick={handleSavePositions}
              className="ml-2 text-[9px] font-black text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 px-2 py-0.5 rounded cursor-pointer transition-all font-sans flex items-center gap-1 animate-pulse"
              title="ยืนยันและบันทึกตำแหน่งจุดที่ลากวางไว้ทั้งหมด"
            >
              ✅ ยืนยันและบันทึกจุด
            </button>
          )}
          {savedConfirmed && (
            <span className="ml-2 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded font-sans flex items-center gap-1">
              🔒 บันทึกแล้ว!
            </span>
          )}
          {Object.keys(customPositions[boatName || 'Standard'] || {}).length > 0 && !hasPendingChanges && !savedConfirmed && (
            <button
              onClick={handleResetPositions}
              className="ml-2 text-[9px] font-black text-slate-500 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-300 hover:border-rose-300 px-2 py-0.5 rounded cursor-pointer transition-all font-sans flex items-center gap-1"
              title="ล้างพิกัดที่กำหนดเองทั้งหมด กลับสู่ตำแหน่งเริ่มต้น"
            >
              🔄 รีเซ็ต
            </button>
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
                // For diagram view we render a clear circular marker for red/orange statuses.
                // Keep green seats showing the life_jacket image to indicate normal state.
                const isGreen = seat.status === 'green';
                const isMissing = seat.status === 'red';
                const isDamaged = seat.status === 'orange';

                // Render missing as red (with life-jacket icon), damaged as green.
                const markerStyle: React.CSSProperties | undefined = isMissing
                  ? { background: '#FF3B30', boxShadow: '0 0 10px rgba(255,59,48,0.9)' } // bright red
                  : isDamaged
                  ? { background: '#10B981', boxShadow: '0 0 10px rgba(16,185,129,0.85)' } // bright green
                  : undefined;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onMouseDown={(e) => handleMouseDown(seat.id, e)}
                    onTouchStart={(e) => handleTouchStart(seat.id, e)}
                    style={getSeatCoords(seat.id)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-[26px] h-[26px] rounded-full flex items-center justify-center font-mono font-extrabold text-[9px] transition-all z-20 cursor-move hover:scale-110 active:scale-95 ${isGreen ? '' : ''}`}
                    title={`ที่นั่ง ${seat.id}: ${
                      isGreen ? 'มีเสื้อชูชีพปกติ' : isMissing ? 'ไม่มีเสื้อชูชีพ' : 'มีเสื้อชูชีพแต่ชำรุด/เก่า'
                    } (คลิกเพื่อเปลี่ยนสถานะ / ลากเพื่อจัดตำแหน่งได้)`}
                  >
                    {isGreen ? (
                      <img
                        src="/life_jacket.png"
                        alt={`Life Jacket ${seat.status}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span
                        className="w-full h-full rounded-full flex items-center justify-center text-white text-[9px] font-extrabold overflow-hidden relative"
                        style={markerStyle}
                      >
                          <img
                            src="/life_jacket.png"
                            alt={`Life Jacket ${seat.status}`}
                            className="object-contain"
                            style={{ width: '60%', height: '60%' }}
                          />
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-white text-[9px] font-extrabold">
                          {seat.id.match(/\d+/)?.[0]}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[10px] font-bold text-slate-500 font-mono">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center sm:justify-start">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 inline-block"><img src="/life_jacket.png" alt="มีชูชีพ" className="w-full h-full object-contain" /></span>
                <span>มีชูชีพปกติ ({seats?.filter(s => s.status === 'green').length || 0})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 inline-block rounded-full" style={{ background: '#FF3B30', boxShadow: '0 0 6px rgba(255,59,48,0.8)' }} />
                <span>ไม่มีชูชีพ ({seats?.filter(s => s.status === 'red').length || 0})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 inline-block rounded-full" style={{ background: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
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
                        ? 'bg-red-500 hover:bg-red-400 border-red-600 text-white animate-pulse'
                        : 'bg-orange-500 hover:bg-orange-400 border-orange-600 text-white';

                    const gridFilterStyle = seat.status === 'red'
                      ? { filter: 'hue-rotate(115deg) saturate(2.5) brightness(1.1)' }
                      : seat.status === 'orange'
                      ? { filter: 'hue-rotate(170deg) saturate(1.8) brightness(1.1)' }
                      : {};

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
                        <span className="w-3.5 h-3.5 inline-block mt-0.5">
                          <img
                            src="/life_jacket.png"
                            alt={`Life Jacket ${seat.status}`}
                            className="w-full h-full object-contain"
                            style={gridFilterStyle}
                          />
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
