import React, { useState } from 'react';
import { 
  Flame, 
  Printer, 
  Download, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Ship,
  Search,
  Filter
} from 'lucide-react';
import { FireExtinguisher, Boat } from '../types';

export function formatExpiryThai(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const match = dateStr.match(/^(\d{4})-(\d{2})/);
  if (!match) return dateStr;
  const year = parseInt(match[1]);
  const monthIdx = parseInt(match[2]) - 1;
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const thaiMonth = thaiMonths[monthIdx] || match[2];
  const thaiYear = year + 543;
  return `${thaiMonth} ${thaiYear}`;
}

interface ExtinguisherReportProps {
  extinguishers: FireExtinguisher[];
  boats: Boat[];
}

export default function ExtinguisherReport({ extinguishers, boats }: ExtinguisherReportProps) {
  const [selectedBoatId, setSelectedBoatId] = useState<string>(boats[0]?.id || '');
  
  const currentBoat = boats.find(b => b.id === selectedBoatId);
  const boatExts = extinguishers.filter(e => e.boatId === selectedBoatId);
  
  const totalCount = boatExts.length;
  const passCount = boatExts.filter(e => e.overallStatus === 'Pass').length;
  const failCount = boatExts.filter(e => e.overallStatus === 'Fail').length;
  const neverInspectedCount = boatExts.filter(e => e.overallStatus === 'NeverInspected').length;

  const currentThaiDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass': return 'text-emerald-700 bg-emerald-50/40 border-emerald-200/50';
      case 'Fail': return 'text-rose-700 bg-rose-50/40 border-rose-200/50';
      default: return 'text-slate-500 bg-white border-slate-300';
    }
  };

  const getPressureLabel = (p: string) => {
    if (p === 'Normal') return 'ปกติ';
    if (p === 'Low') return 'ต่ำ (Low)';
    if (p === 'High') return 'สูง (High)';
    return '-';
  };

  const getThaiStatus = (s: string) => {
    if (s === 'Normal') return 'ปกติ';
    if (s === 'Damaged') return 'ชำรุด';
    if (s === 'Missing') return 'สูญหาย';
    if (s === 'Rusted') return 'สนิม';
    if (s === 'Dented') return 'บุบ';
    if (s === 'Corroded') return 'ผุกร่อน';
    if (s === 'Cracked') return 'แตกลาย';
    if (s === 'Blocked') return 'ตัน';
    return s;
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-300 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-widest">
            <Flame className="h-4 w-4" />
            Fire Safety Compliance
          </div>
          <h2 className="text-xl font-black text-slate-950">รายงานผลการตรวจสอบเครื่องดับเพลิง</h2>
          <p className="text-xs text-slate-500 font-bold">ข้อมูลการตรวจสอบล่าสุดรายลำเรือ ประจำวันที่ {currentThaiDate}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={selectedBoatId}
              onChange={(e) => setSelectedBoatId(e.target.value)}
              className="bg-white text-slate-950 text-sm font-bold pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer transition-all min-w-[200px]"
            >
              {boats.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <Ship className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>

          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white hover:bg-slate-200 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border border-slate-300"
          >
            <Printer className="h-4 w-4" />
            พิมพ์รายงาน
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200/50">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">จำนวนทั้งหมด</div>
            <div className="text-xl font-black text-slate-950">{totalCount} <span className="text-xs text-slate-500 font-medium">ถัง</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/50">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ปกติ (Pass)</div>
            <div className="text-xl font-black text-slate-950">{passCount} <span className="text-xs text-slate-500 font-medium">ถัง</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-lg border border-rose-200/50">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">บกพร่อง (Fail)</div>
            <div className="text-xl font-black text-slate-950">{failCount} <span className="text-xs text-slate-500 font-medium">ถัง</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-white text-slate-500 rounded-lg border border-slate-300">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ยังไม่ตรวจสอบ</div>
            <div className="text-xl font-black text-slate-950">{neverInspectedCount} <span className="text-xs text-slate-500 font-medium">ถัง</span></div>
          </div>
        </div>
      </div>

      {/* Main Report Table */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl overflow-hidden print:border-none print:shadow-none">
        <div className="p-5 border-b border-slate-300 flex items-center justify-between bg-slate-100/50">
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-indigo-700" />
            ตารางแสดงรายละเอียดผลการตรวจสอบ (Inspection Details)
          </h3>
          <span className="text-[10px] font-bold text-slate-500">เรือ: {currentBoat?.name}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-white text-slate-500 font-black border-b border-slate-300">
                <th className="p-4 uppercase tracking-widest">ลำดับ/รหัส</th>
                <th className="p-4 uppercase tracking-widest">ตำแหน่งติดตั้ง</th>
                <th className="p-4 uppercase tracking-widest">ชนิด/ขนาด</th>
                <th className="p-4 uppercase tracking-widest text-center">เข็มวัด (Pressure)</th>
                <th className="p-4 uppercase tracking-widest text-center">สลัก (Pin)</th>
                <th className="p-4 uppercase tracking-widest text-center">ตัวถัง (Tank)</th>
                <th className="p-4 uppercase tracking-widest text-center">สายฉีด (Hose)</th>
                <th className="p-4 uppercase tracking-widest text-center">น้ำหนัก (Weight)</th>
                <th className="p-4 uppercase tracking-widest">วันหมดอายุ</th>
                <th className="p-4 uppercase tracking-widest text-center">ผลสรุป</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {boatExts.map((e, idx) => (
                <tr key={e.id} className="hover:bg-slate-100/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-indigo-700">
                    <div className="flex flex-col">
                      <span>{idx + 1}</span>
                      <span className="text-[9px] text-slate-600">{e.id}</span>
                    </div>
                  </td>
                  <td className="p-4 font-extrabold text-slate-950">{e.location}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-bold">{e.type}</span>
                      <span className="text-[10px] text-slate-500">{e.size}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                      e.pressureStatus === 'Normal' ? 'bg-emerald-50/20 text-emerald-500 border-emerald-200/50' : 'bg-rose-50/20 text-rose-500 border-rose-200/50'
                    }`}>
                      {getPressureLabel(e.pressureStatus)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                      e.safetyPinStatus === 'Normal' ? 'bg-emerald-50/20 text-emerald-500 border-emerald-200/50' : 'bg-rose-50/20 text-rose-500 border-rose-200/50'
                    }`}>
                      {getThaiStatus(e.safetyPinStatus)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                      e.tankStatus === 'Normal' ? 'bg-emerald-50/20 text-emerald-500 border-emerald-200/50' : 'bg-rose-50/20 text-rose-500 border-rose-200/50'
                    }`}>
                      {getThaiStatus(e.tankStatus)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                      e.hoseStatus === 'Normal' ? 'bg-emerald-50/20 text-emerald-500 border-emerald-200/50' : 'bg-rose-50/20 text-rose-500 border-rose-200/50'
                    }`}>
                      {getThaiStatus(e.hoseStatus)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                      e.weightStatus === 'Normal' ? 'bg-emerald-50/20 text-emerald-500 border-emerald-200/50' : 'bg-rose-50/20 text-rose-500 border-rose-200/50'
                    }`}>
                      {getThaiStatus(e.weightStatus)}
                    </span>
                  </td>
                  <td className="p-4 font-sans font-bold text-slate-500">{formatExpiryThai(e.expiryDate)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border shadow-sm ${getStatusColor(e.overallStatus)}`}>
                      {e.overallStatus === 'Pass' ? '✅ ผ่าน' : e.overallStatus === 'Fail' ? '❌ ไม่ผ่าน' : '⏳ รอตรวจ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer for signature in print mode */}
        <div className="hidden print:block mt-12 p-8 border-t border-slate-300 text-slate-950">
          <div className="grid grid-cols-2 gap-12">
            <div className="text-center space-y-8">
              <div className="border-b border-slate-400 h-12 w-48 mx-auto"></div>
              <p className="text-xs font-bold">(...................................................)</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">ผู้ตรวจสอบ / INSPECTOR</p>
            </div>
            <div className="text-center space-y-8">
              <div className="border-b border-slate-400 h-12 w-48 mx-auto"></div>
              <p className="text-xs font-bold">(...................................................)</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">หัวหน้ากองเรือ / SUPERVISOR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
