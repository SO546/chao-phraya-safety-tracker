import React, { useState, useRef } from 'react';
import { Map, Grid } from 'lucide-react';
import { BoatSeatLifeJacket, LifeJacketItemStatus } from '../types';

const ctbLayoutImg = 'https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/ctb_boat_layout.jpg';
const rLayoutImg = 'https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/r_boat_layout.jpg';

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

    const match = seatId.match(/^(\d+)([A-F])$/);
    if (!match) return { left: '0%', top: '0%' };
    const rowNum = parseInt(match[1]);
    const col = match[2];
    
    let left = 0;
    let top = 0;

    if (isCTB) {
      left = 28.5 + (rowNum - 1) * ((80.0 - 28.5) / (maxRows - 1));
      if (col === 'A') top = 26.5;
      else if (col === 'B') top = 34.5;
      else if (col === 'C') top = 42.5;
      else if (col === 'D') top = 56.5;
      else if (col === 'E') top = 64.5;
      else if (col === 'F') top = 72.5;
    } else {
      left = 24.0 + (rowNum - 1) * ((72.0 - 24.0) / (maxRows - 1));
      if (col === 'A') top = 21.0;
      else if (col === 'B') top = 29.0;
      else if (col === 'C') top = 37.0;
      else if (col === 'D') top = 51.0;
      else if (col === 'E') top = 59.0;
      else if (col === 'F') top = 67.0;
    }

    return { left: `${left}%`, top: `${top}%` };
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
