import React, { useState } from 'react';
import { ArrowLeft, Ship as BoatIcon, ShieldCheck, Flame, AlertCircle, Sparkles, Clipboard, Search, CheckCircle2 } from 'lucide-react';
import { Boat, FireExtinguisher } from '../types';
import BoatMap from './BoatMap';

interface BoatListProps {
  selectedBoatId: string | null;
  boats: Boat[];
  extinguishers: FireExtinguisher[];
  onSelectBoat: (boatId: string | null) => void;
  onInspectExtinguisher: (ext: FireExtinguisher) => void;
}

export default function BoatList({
  selectedBoatId,
  boats,
  extinguishers,
  onSelectBoat,
  onInspectExtinguisher,
}: BoatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const currentMonthStr = new Date().toISOString().substring(0, 7);

  // If no boat is selected, we can show a list of all boats to let user select (similar to dashboard but list form)
  const selectedBoat = boats.find((b) => b.id === selectedBoatId);

  // Filter extinguishers based on search and boat selection
  const filteredExtinguishers = extinguishers.filter((e) => {
    const matchesBoat = selectedBoatId ? e.boatId === selectedBoatId : true;
    const matchesSearch =
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.boatName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBoat && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pass':
        return <span className="bg-green-150 text-green-800 border border-green-300 text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm uppercase">ผ่านเกณฑ์ (Pass)</span>;
      case 'Fail':
        return <span className="bg-red-150 text-red-800 border border-red-300 text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm uppercase animate-pulse">ชำรุด (Defective)</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm uppercase">ค้างตรวจ (Pending)</span>;
    }
  };

  const getDetailStatusIndicator = (label: string, value: string, isOk: boolean) => {
    return (
      <div className="flex justify-between items-center bg-white p-2 rounded-sm border border-slate-200 text-[11px]">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className={`font-bold font-mono ${isOk ? 'text-green-700' : 'text-red-650 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-xs'}`}>
          {value}
        </span>
      </div>
    );
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3">
          {selectedBoatId && (
            <button
              onClick={() => onSelectBoat(null)}
              className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded transition-all shadow-sm cursor-pointer"
              title="ย้อนกลับ"
              id="back-btn-boatlist"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
              {selectedBoat ? `รายการถังดับเพลิง: ${selectedBoat.name}` : 'สารบบถังดับเพลิงเรือท่องเที่ยวทั้งหมด'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedBoat
                ? `รายการประจำที่บนเรือท่องเที่ยวขนาดมาตรฐาน ${selectedBoat.totalExtinguishers} ถัง`
                : 'ข้อมูลแจกแจงตำแหน่งติดตั้งและบันทึกประวัติการสู้ภัยประจำงวดบนเรือท่องเที่ยวหลักทั้ง 7 ลำ'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="ค้นหา เลขถัง, สถานที่ตั้ง, ชื่อเรือ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-800 text-xs border border-slate-250 rounded px-4 py-2.5 pl-10 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-medium"
          />
          <Search className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
        </div>
      </div>

      {/* Boat selection pills if in overall mode */}
      {!selectedBoatId && (
        <div className="flex flex-wrap gap-1.5 pb-1">
          <button
            onClick={() => onSelectBoat(null)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded border uppercase font-mono shadow-sm transition-all cursor-pointer ${
              selectedBoatId === null
                ? 'bg-slate-900 text-white border-slate-950 font-extrabold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            เรือทุกลำ (All Ships)
          </button>
          {boats.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelectBoat(b.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded border uppercase font-mono shadow-sm transition-all cursor-pointer ${
                selectedBoatId === b.id
                  ? 'bg-red-600 text-white border-red-700 font-extrabold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {b.name} ({b.totalExtinguishers} ถัง)
            </button>
          ))}
        </div>
      )}

      {/* Grid of fire extinguisher cards */}
      {selectedBoat ? (
        <BoatMap 
          boat={selectedBoat}
          extinguishers={extinguishers}
          onInspectExtinguisher={onInspectExtinguisher}
        />
      ) : (
        <div className="bg-slate-50 border border-slate-250 rounded p-4 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
            <span className="leading-relaxed">💡 <strong>คำแนะนำเพิ่มเติม:</strong> เลือกกดปุ่มแท็บรายชื่อเรือ (เช่น <strong>CTB1, CTB2, R1</strong>) ในแถบเมนูด้านบนเพื่อเปิดดู <strong>แผนผังจุดติดตั้งแบบไดนามิกประจำตำแหน่งเรือ (Interactive Deck Blueprint)</strong> ได้ทันที</span>
          </div>
        </div>
      )}

      {filteredExtinguishers.length === 0 ? (
        <div className="py-20 text-center bg-white border border-dashed border-slate-350 rounded flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="h-8 w-8 text-slate-400" />
          <div className="text-sm font-bold text-slate-600 uppercase tracking-wider">ไม่พบถังดับเพลิงที่ตรงเงื่อนไขการค้นหา</div>
          <div className="text-xs text-slate-400">กรุณาลองปรับข้อความค้นหานามสลักใหม่อีกครั้ง</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExtinguishers.map((e) => {
            const hasBeenCheckedThisMonth = e.lastInspectedDate && e.lastInspectedDate.startsWith(currentMonthStr);
            const isFailing = e.overallStatus === 'Fail';

            // High contrast border styling with crisp geometric left cue
            const borderStyles = isFailing
              ? 'border-slate-250 border-l-4 border-l-red-600 bg-red-50/10'
              : hasBeenCheckedThisMonth
              ? 'border-slate-250 border-l-4 border-l-green-600 bg-green-50/10'
              : 'border-slate-250 border-l-4 border-l-amber-500 bg-amber-50/10';
            
            return (
              <div
                key={e.id}
                className={`bg-white rounded border ${borderStyles} hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
                id={`ext-card-${e.id}`}
              >
                {/* Header item */}
                <div className="p-5 space-y-4 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold text-blue-850 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm font-mono leading-none">
                          {e.id}
                        </span>
                        {!selectedBoatId && (
                          <span className="text-[10px] font-bold text-slate-500 truncate max-w-[110px] uppercase tracking-wider font-mono" title={e.boatName}>
                            {e.boatName}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug pt-1">
                        {e.location}
                      </h3>
                    </div>
                    {getStatusBadge(e.overallStatus)}
                  </div>

                  {/* General spec information */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-100 border border-slate-200 rounded text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">ชนิดถัง</span>
                      <span className="font-bold text-slate-800 block mt-0.5 truncate" title={mapTypeToThai(e.type)}>
                        {mapTypeToThai(e.type)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">ขนาดบรรจุ</span>
                      <span className="font-bold text-slate-800 block mt-0.5">{e.size}</span>
                    </div>
                  </div>

                  {/* Detail statuses of individual indicators */}
                  <div className="space-y-1.5">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">รายละเอียดเกณฑ์การตรวจประจำงวด</div>
                    
                    {getDetailStatusIndicator(
                      '• เกจวัดแรงดัน (Pressure)',
                      e.pressureStatus === 'Normal' ? 'ปกติ (Normal)' : e.pressureStatus === 'Low' ? 'ต่ำกว่าขีดแดง (Low)' : 'สูงเกินพิกัด (High)',
                      e.pressureStatus === 'Normal'
                    )}
                    
                    {getDetailStatusIndicator(
                      '• สลักและซีลนิรภัย (Safety Pin)',
                      e.safetyPinStatus === 'Normal' ? 'ติดตั้งถาวร/ปกติ' : e.safetyPinStatus === 'Missing' ? 'สายสลักหลุดหาย' : 'ล็อคเสียหาย',
                      e.safetyPinStatus === 'Normal'
                    )}

                    {getDetailStatusIndicator(
                      '• โครงสร้างถังบอดี้ (Tank Body)',
                      e.tankStatus === 'Normal' ? 'ปกติ/ไม่ชำรุด' : e.tankStatus === 'Rusted' ? 'เป็นสนิมขัดเกลา' : e.tankStatus === 'Dented' ? 'ตัวถังบุบชน' : 'ชำรุดผุกร่อน',
                      e.tankStatus === 'Normal'
                    )}

                    {getDetailStatusIndicator(
                      '• สภาพสายยางและหัวฉีด (Hose)',
                      e.hoseStatus === 'Normal' ? 'ปกติ/ปราศจากคราบ' : e.hoseStatus === 'Cracked' ? 'แห้งกรอบ/ฉีกขาด' : e.hoseStatus === 'Blocked' ? 'มีสิ่งอุดตัน' : 'ชำรุดเสียหาย',
                      e.hoseStatus === 'Normal'
                    )}

                    {getDetailStatusIndicator(
                      '• ตรวจวัดน้ำหนัก (Weight)',
                      e.weightStatus === 'Normal' ? 'ผ่านเกณฑ์ปกติ' : 'น้ำหนักต่ำกว่าข้อกำหนด',
                      e.weightStatus === 'Normal'
                    )}
                  </div>
                </div>

                {/* Footer buttons / last check indicators */}
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">วันที่ตรวจล่าสุด</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {e.lastInspectedDate || 'NEVER AUDITED'}
                      </span>
                    </div>
                    {e.lastInspector && (
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">เจ้าหน้าที่ตรวจ</span>
                        <span className="font-bold text-slate-700">
                          {e.lastInspector}
                        </span>
                      </div>
                    )}
                  </div>

                  {e.remarks && (
                    <div className="text-[11px] text-amber-800 bg-amber-50/50 px-2.5 py-1.5 rounded border border-amber-200 truncate leading-tight">
                      <strong>หมายเหตุ:</strong> {e.remarks}
                    </div>
                  )}

                  <button
                    onClick={() => onInspectExtinguisher(e)}
                    className={`w-full py-2 px-4 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer uppercase font-mono shadow-sm ${
                      hasBeenCheckedThisMonth
                        ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                        : 'bg-slate-900 text-white border-slate-950 hover:bg-slate-950 shadow-xs'
                    }`}
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                    {hasBeenCheckedThisMonth ? 'แก้ไขการตรวจเช็ค (EDIT)' : 'บันทึกตรวจสอบประจำเดือน (AUDIT)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
