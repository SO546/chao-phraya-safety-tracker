import React, { useState } from 'react';
import { Boat, FireExtinguisher } from '../types';
import { ShieldCheck, AlertCircle, HelpCircle, Flame, Edit, CornerDownRight } from 'lucide-react';

import ctbLayoutImg from '../../Image/Layout_CTB_Boat.jpg';
import rLayoutImg from '../../Image/Layout_R_Boat.png';

interface BoatMapProps {
  boat: Boat;
  extinguishers: FireExtinguisher[];
  onInspectExtinguisher: (ext: FireExtinguisher) => void;
}

export default function BoatMap({
  boat,
  extinguishers,
  onInspectExtinguisher,
}: BoatMapProps) {
  const [hoveredExt, setHoveredExt] = useState<string | null>(null);

  // Filter extinguishers for the current boat
  const boatExts = extinguishers.filter((e) => e.boatId === boat.id);

  const isCTB = boat.name.startsWith('CTB');
  const layoutImg = isCTB ? ctbLayoutImg : rLayoutImg;

  // Map of index (0-4) to dynamic coordinates matching visual uploaded floor plans
  const pinPositions = isCTB
    ? [
        {
          x: 26.5,
          y: 28.5,
          label: 'ถังที่ 1',
          desc: 'หน้าทางเข้า-ออกฝั่งซ้าย (Port Stern Entrance)',
        },
        {
          x: 68.5,
          y: 41.0,
          label: 'ถังที่ 2',
          desc: 'หน้าห้องนายท้ายฝั่งซ้าย (Port Wheelhouse Front)',
        },
        {
          x: 68.5,
          y: 45.0,
          label: 'ถังที่ 3',
          desc: 'หน้าห้องนายท้ายฝั่งขวา (Starboard Wheelhouse Front)',
        },
        {
          x: 26.5,
          y: 68.0,
          label: 'ถังที่ 4',
          desc: 'หน้าทางเข้า-ออกฝั่งขวา (Starboard Stern Entrance)',
        },
        {
          x: 70.5,
          y: 41.5,
          label: 'ถังที่ 5',
          desc: 'ในห้องนายท้าย (Inside Wheelhouse)',
        },
      ]
    : [
        {
          x: 20.2,
          y: 19.5,
          label: 'ถังที่ 1',
          desc: 'หน้าทางเข้า-ออกฝั่งซ้าย (Port Stern Entrance)',
        },
        {
          x: 62.9,
          y: 42.4,
          label: 'ถังที่ 2',
          desc: 'หน้าห้องนายท้ายฝั่งซ้าย (Port Wheelhouse Front)',
        },
        {
          x: 62.9,
          y: 47.6,
          label: 'ถังที่ 3',
          desc: 'หน้าห้องนายท้ายฝั่งขวา (Starboard Wheelhouse Front)',
        },
        {
          x: 20.2,
          y: 69.0,
          label: 'ถังที่ 4',
          desc: 'หน้าทางเข้า-ออกฝั่งขวา (Starboard Stern Entrance)',
        },
      ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass':
        return {
          bg: 'bg-green-500 hover:bg-green-600',
          ring: 'ring-green-300',
          text: 'text-green-600',
          border: 'border-green-500',
          iconColor: 'text-green-500',
        };
      case 'Fail':
        return {
          bg: 'bg-red-600 hover:bg-red-700 animate-pulse',
          ring: 'ring-red-300',
          text: 'text-red-700',
          border: 'border-red-500',
          iconColor: 'text-red-600',
        };
      default:
        return {
          bg: 'bg-amber-500 hover:bg-amber-600',
          ring: 'ring-amber-300',
          text: 'text-amber-600',
          border: 'border-amber-400',
          iconColor: 'text-amber-600',
        };
    }
  };

  const mapTypeToThai = (type: string) => {
    switch (type) {
      case 'Dry Chemical': return 'เคมีแห้ง (Dry Chemical)';
      case 'CO2': return 'คาร์บอนไดออกไซด์ (CO2)';
      case 'Clean Agent': return 'สารเคมีสะอาด (Clean Agent)';
      case 'Foam': return 'ถังโฟม (Foam)';
      default: return type;
    }
  };

  const handlePinClick = (ext: FireExtinguisher) => {
    onInspectExtinguisher(ext);
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded p-5 space-y-4" id={`boat-map-${boat.id}`}>
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
            แผนผังจุดติดตั้งถังดับเพลิงประจำเรือ (Fire Extinguisher Installation Map)
          </h3>
        </div>
        <div className="flex gap-4 text-[10px] borer-l pl-4 border-slate-200 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-green-500 rounded-full inline-block" />
            <span className="text-slate-600 font-bold">ผ่าน (PASS)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-600 rounded-full inline-block animate-pulse" />
            <span className="text-slate-600 font-bold">ชำรุด (DEFECT)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-amber-500 rounded-full inline-block" />
            <span className="text-slate-600 font-bold">ค้างตรวจ (PENDING)</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Interactive Schematic Area - 3 Cols */}
        <div className="lg:col-span-3 relative bg-slate-900 overflow-hidden rounded-md border border-slate-950 p-4 flex flex-col justify-between shadow-inner select-none">
          
          {/* Deck indicator details */}
          <div className="absolute top-3 left-3 text-[10px] text-slate-450 font-mono uppercase bg-slate-950/90 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-800 z-10 transition-opacity">
            กราบซ้าย (Port / Left Side)
          </div>
          <div className="absolute bottom-3 left-3 text-[10px] text-slate-450 font-mono uppercase bg-slate-950/90 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-800 z-10 transition-opacity">
            กราบขวา (Starboard / Right Side)
          </div>

          <div className="absolute top-1/2 left-3 -translate-y-1/2 text-[10px] text-slate-500 font-bold font-mono tracking-widest uppercase origin-center rotate-270 opacity-50 z-10">
            ◀ ท้ายเรือ (STERN)
          </div>
          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-slate-500 font-bold font-mono tracking-widest uppercase origin-center rotate-90 opacity-50 z-10">
            หัวเรือ (BOW) ▶
          </div>

          {/* Floor plan layout from precise uploaded floor-plan design drawings */}
          <div className="flex-1 flex items-center justify-center relative w-full h-full py-4 min-h-[240px]">
            <div className="relative w-full max-w-[850px] aspect-[1000/420] bg-white rounded border-2 border-slate-800 overflow-hidden shadow-2xl">
              <img
                src={layoutImg}
                alt={`${boat.name} Floor Plan Diagram`}
                className="w-full h-full object-cover opacity-95 hover:opacity-100 transition-opacity duration-300"
                referrerPolicy="no-referrer"
              />

              {/* Positioned HTML pins overlaid precisely on the coordinates */}
              {pinPositions.map((pos, idx) => {
                // Only render the 5th extinguisher if the boat has 5 extinguishers
                if (idx === 4 && boat.totalExtinguishers < 5) return null;

                // Find matching live extinguisher data
                const targetId = `${boat.name}-ถังที่ ${idx + 1}`;
                const extData = boatExts.find((e) => e.id === targetId) || boatExts[idx];

                if (!extData) return null;

                const colors = getStatusColor(extData.overallStatus);
                const isHovered = hoveredExt === extData.id;

                return (
                  <div
                    key={extData.id}
                    className="absolute"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    {/* Glowing halo when hovered */}
                    <div
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-100/5 transition-all duration-300 pointer-events-none flex items-center justify-center ${
                        isHovered ? 'scale-125 bg-white/15 ring-4 ring-blue-500/35' : 'scale-75'
                      }`}
                    />

                    {/* Pulsing state ring for failures */}
                    {extData.overallStatus === 'Fail' && (
                      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-red-500 animate-ping opacity-60 pointer-events-none" />
                    )}

                    {/* Pin Dot Button */}
                    <button
                      onClick={() => handlePinClick(extData)}
                      onMouseEnter={() => setHoveredExt(extData.id)}
                      onMouseLeave={() => setHoveredExt(null)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full ${colors.bg} text-white font-mono font-black text-xs border-2 border-slate-900 flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 active:scale-95 transition-all duration-150 ring-2 ${colors.ring}`}
                      title={pos.desc}
                      id={`map-pin-${extData.id}`}
                    >
                      {idx + 1}
                    </button>

                    {/* Dynamic Tooltip */}
                    <div
                      className={`absolute bottom-6 left-12 -translate-x-1/2 md:translate-x-0 w-52 md:w-60 bg-slate-950/95 backdrop-blur-md text-white p-3 rounded border border-slate-750 shadow-xl z-55 space-y-2 pointer-events-none transition-all duration-200 origin-bottom ${
                        isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90 pointer-events-none'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] font-bold text-slate-450 tracking-wider">ถังลำดับที่ {idx + 1}</div>
                          <div className="font-bold text-xs truncate max-w-[130px] font-mono text-cyan-400">
                            {extData.id}
                          </div>
                        </div>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm border uppercase ${
                          extData.overallStatus === 'Pass' 
                            ? 'bg-green-950/90 text-green-400 border-green-800' 
                            : extData.overallStatus === 'Fail'
                            ? 'bg-red-950/90 text-red-400 border-red-800'
                            : 'bg-amber-950/90 text-amber-400 border-amber-800'
                        }`}>
                          {extData.overallStatus === 'Pass' ? 'ผ่านเกณฑ์' : extData.overallStatus === 'Fail' ? 'พบค้างซ่อม' : 'ค้างตรวจ'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-200 border-t border-slate-800 pt-1.5">
                        <span className="text-slate-450 block text-[9px] uppercase font-bold tracking-wider">ตำแหน่งติดตั้งด้านจริง</span>
                        <strong className="block text-white leading-normal mt-0.5">{extData.location}</strong>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
                        <div>
                          <span className="text-slate-450 block text-[8px] uppercase font-bold">ชนิดถัง</span>
                          <span className="font-semibold block">{mapTypeToThai(extData.type)}</span>
                        </div>
                        <div>
                          <span className="text-slate-450 block text-[8px] uppercase font-bold">ขนาด</span>
                          <span className="font-semibold block">{extData.size}</span>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-450 text-right italic font-mono pt-1">
                        *คลิกที่ปุ่มเพื่อแก้ไขการตรวจเช็คนี้
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Informative Side Panel - 1 Col */}
        <div className="lg:col-span-1 bg-slate-50 rounded border border-slate-200 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">
              ข้อมูลแผนผังประจำโครงสร้าง
            </h4>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              สลักตำแหน่งสู้ภัยระดับสากลใหม่ โดยคำนึงถึงกึ่งกลางแนวกราบซ้าย-ขวา ท้ายเรือ (Stern) และหัวเรือ (Bow)
            </p>

            {/* Structured Table */}
            <div className="space-y-1.5 text-[11px] pt-2">
              {pinPositions.slice(0, boat.totalExtinguishers).map((pos, idx) => {
                const targetId = `${boat.name}-ถังที่ ${idx + 1}`;
                const extData = boatExts.find((e) => e.id === targetId) || boatExts[idx];
                const isItemHovered = extData && hoveredExt === extData.id;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => extData && setHoveredExt(extData.id)}
                    onMouseLeave={() => setHoveredExt(null)}
                    onClick={() => extData && handlePinClick(extData)}
                    className={`flex items-start gap-2 p-2 rounded border transition-all cursor-pointer ${
                      isItemHovered
                        ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-5 h-5 flex-shrink-0 bg-slate-900 text-white rounded-full font-mono text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold flex items-center gap-1">
                        <span>{pos.label}</span>
                        {extData && (
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            extData.overallStatus === 'Pass' 
                              ? 'bg-green-500' 
                              : extData.overallStatus === 'Fail'
                              ? 'bg-red-500 animate-pulse'
                              : 'bg-amber-500'
                          }`} />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium truncate" title={pos.desc}>
                        {pos.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] text-slate-450 border-t border-slate-200 pt-3 italic space-y-1">
            <span className="block font-bold">💡 ข้อแนะนำสำหรับเจ้าหน้าที่:</span>
            <span className="block leading-relaxed">
              สามารถกดจิ้มที่ตัวหมายเลขถังในภาพร่างแบบ เรือ หรือบนรายการด้านสลัก เพื่อลงบันทึกการตรวจสอบได้ทันที
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
