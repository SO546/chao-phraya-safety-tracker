import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  HeartPulse, 
  LifeBuoy, 
  Printer, 
  Calendar, 
  Ship, 
  ArrowRight,
  TrendingUp,
  FileCheck,
  FileText,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Award
} from 'lucide-react';
import { 
  Boat, 
  FireExtinguisher, 
  InspectionRecord, 
  MedicalKitStation, 
  MedicalInspectionRecord, 
  BoatLicenseState, 
  LicenseInspectionRecord, 
  BoatLifeJacketState, 
  LifeJacketInspectionRecord 
} from '../types';
import { formatExpiryThai } from './ExtinguisherReport';

interface ExecutiveSummaryReportProps {
  boats: Boat[];
  extinguishers: FireExtinguisher[];
  extinguisherHistory: InspectionRecord[];
  medicalStations: MedicalKitStation[];
  medicalHistory: MedicalInspectionRecord[];
  licenses: BoatLicenseState[];
  licenseHistory: LicenseInspectionRecord[];
  lifeJackets: BoatLifeJacketState[];
  lifeJacketHistory: LifeJacketInspectionRecord[];
}

export default function ExecutiveSummaryReport({
  boats,
  extinguishers,
  extinguisherHistory,
  medicalStations,
  medicalHistory,
  licenses,
  licenseHistory,
  lifeJackets,
  lifeJacketHistory
}: ExecutiveSummaryReportProps) {
  
  // Available Months for selection based on all historical records
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    
    // Default current month & last month
    const curDate = new Date();
    const curMonthStr = curDate.toISOString().substring(0, 7);
    monthsSet.add(curMonthStr);
    
    const prevDate = new Date(curDate.getFullYear(), curDate.getMonth() - 1, 1);
    const prevMonthStr = prevDate.toISOString().substring(0, 7);
    monthsSet.add(prevMonthStr);

    // Scan histories
    extinguisherHistory.forEach(h => { if (h.inspectionDate) monthsSet.add(h.inspectionDate.substring(0, 7)); });
    medicalHistory.forEach(h => { if (h.inspectionDate) monthsSet.add(h.inspectionDate.substring(0, 7)); });
    licenseHistory.forEach(h => { if (h.inspectionDate) monthsSet.add(h.inspectionDate.substring(0, 7)); });
    lifeJacketHistory.forEach(h => { if (h.inspectionDate) monthsSet.add(h.inspectionDate.substring(0, 7)); });

    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [extinguisherHistory, medicalHistory, licenseHistory, lifeJacketHistory]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || new Date().toISOString().substring(0, 7));
  const [expandedBoats, setExpandedBoats] = useState<Record<string, boolean>>({});

  // Toggle boat details accordion
  const toggleBoatExpand = (boatId: string) => {
    setExpandedBoats(prev => ({
      ...prev,
      [boatId]: !prev[boatId]
    }));
  };

  const getThaiMonthYear = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const monthName = thaiMonths[parseInt(month) - 1] || month;
    const thaiYear = parseInt(year) + 543;
    return `${monthName} ${thaiYear}`;
  };

  // Process data for the selected month
  const reportData = useMemo(() => {
    return boats.map(boat => {
      // 1. Extinguisher status for this boat in this month
      const boatExts = extinguishers.filter(e => e.boatId === boat.id);
      const extInspectionsInMonth = extinguisherHistory.filter(h => 
        h.boatId === boat.id && h.inspectionDate.startsWith(selectedMonth)
      );
      
      // Determine status
      let extStatus: 'Pass' | 'Fail' | 'Pending' = 'Pending';
      let latestExtDate = '';
      
      if (extInspectionsInMonth.length > 0) {
        // Sort by date descending
        const sorted = [...extInspectionsInMonth].sort((a, b) => b.inspectionDate.localeCompare(a.inspectionDate));
        latestExtDate = sorted[0].inspectionDate;
        
        // Check if there are failures in the latest inspection for each extinguisher in this month
        const latestStatusByExt: Record<string, string> = {};
        sorted.forEach(ins => {
          if (!latestStatusByExt[ins.extinguisherId]) {
            latestStatusByExt[ins.extinguisherId] = ins.overallStatus;
          }
        });
        
        const statuses = Object.values(latestStatusByExt);
        if (statuses.includes('Fail')) {
          extStatus = 'Fail';
        } else {
          // If we have inspected at least one and none failed, it is Pass (or if we want strict: checked all exts)
          extStatus = 'Pass';
        }
      }

      // 2. Medical Station status
      const medStation = medicalStations.find(s => s.targetId === boat.id || s.targetName === boat.name);
      const medInspectionsInMonth = medicalHistory.filter(h => 
        h.stationType === 'boat' && 
        h.targetName === boat.name && 
        h.inspectionDate.startsWith(selectedMonth)
      );

      let medStatus: 'Pass' | 'Fail' | 'Pending' = 'Pending';
      let latestMedDate = '';

      if (medInspectionsInMonth.length > 0) {
        const sorted = [...medInspectionsInMonth].sort((a, b) => b.inspectionDate.localeCompare(a.inspectionDate));
        latestMedDate = sorted[0].inspectionDate;
        medStatus = sorted[0].overallStatus as 'Pass' | 'Fail';
      }

      // 3. Life Jacket status
      const ljInspectionsInMonth = lifeJacketHistory.filter(h => 
        h.boatId === boat.id && h.inspectionDate.startsWith(selectedMonth)
      );

      let ljStatus: 'Pass' | 'Fail' | 'Pending' = 'Pending';
      let latestLjDate = '';

      if (ljInspectionsInMonth.length > 0) {
        const sorted = [...ljInspectionsInMonth].sort((a, b) => b.inspectionDate.localeCompare(a.inspectionDate));
        latestLjDate = sorted[0].inspectionDate;
        ljStatus = sorted[0].overallStatus as 'Pass' | 'Fail';
      }

      // 4. License status
      const licInspectionsInMonth = licenseHistory.filter(h => 
        h.boatId === boat.id && h.inspectionDate.startsWith(selectedMonth)
      );

      let licStatus: 'Pass' | 'Fail' | 'Pending' = 'Pending';
      let latestLicDate = '';

      if (licInspectionsInMonth.length > 0) {
        const sorted = [...licInspectionsInMonth].sort((a, b) => b.inspectionDate.localeCompare(a.inspectionDate));
        latestLicDate = sorted[0].inspectionDate;
        licStatus = sorted[0].overallStatus as 'Pass' | 'Fail';
      }

      // Compute overall compliance status for the boat in this month
      const categories = [extStatus, medStatus, ljStatus, licStatus];
      let overallBoatStatus: 'Pass' | 'Fail' | 'Pending' = 'Pass';

      if (categories.includes('Fail')) {
        overallBoatStatus = 'Fail';
      } else if (categories.includes('Pending')) {
        overallBoatStatus = 'Pending';
      }

      return {
        boat,
        extStatus,
        latestExtDate,
        extRecords: extInspectionsInMonth,
        medStatus,
        latestMedDate,
        medRecords: medInspectionsInMonth,
        ljStatus,
        latestLjDate,
        ljRecords: ljInspectionsInMonth,
        licStatus,
        latestLicDate,
        licRecords: licInspectionsInMonth,
        overallBoatStatus
      };
    });
  }, [boats, extinguishers, extinguisherHistory, medicalStations, medicalHistory, licenseHistory, lifeJacketHistory, selectedMonth]);

  // General executive metrics for the month
  const metrics = useMemo(() => {
    const total = reportData.length;
    const fullyCompliant = reportData.filter(d => d.overallBoatStatus === 'Pass').length;
    const deficient = reportData.filter(d => d.overallBoatStatus === 'Fail').length;
    const incomplete = reportData.filter(d => d.overallBoatStatus === 'Pending').length;

    // Category statistics
    const passExt = reportData.filter(d => d.extStatus === 'Pass').length;
    const failExt = reportData.filter(d => d.extStatus === 'Fail').length;
    const pendExt = reportData.filter(d => d.extStatus === 'Pending').length;

    const passMed = reportData.filter(d => d.medStatus === 'Pass').length;
    const failMed = reportData.filter(d => d.medStatus === 'Fail').length;
    const pendMed = reportData.filter(d => d.medStatus === 'Pending').length;

    const passLj = reportData.filter(d => d.ljStatus === 'Pass').length;
    const failLj = reportData.filter(d => d.ljStatus === 'Fail').length;
    const pendLj = reportData.filter(d => d.ljStatus === 'Pending').length;

    const passLic = reportData.filter(d => d.licStatus === 'Pass').length;
    const failLic = reportData.filter(d => d.licStatus === 'Fail').length;
    const pendLic = reportData.filter(d => d.licStatus === 'Pending').length;

    return {
      total,
      fullyCompliant,
      deficient,
      incomplete,
      ext: { pass: passExt, fail: failExt, pend: pendExt },
      med: { pass: passMed, fail: failMed, pend: pendMed },
      lj: { pass: passLj, fail: failLj, pend: pendLj },
      lic: { pass: passLic, fail: failLic, pend: pendLic }
    };
  }, [reportData]);

  // Actionable checklist of fail issues for the executive summary table
  const failDetails = useMemo(() => {
    const issues: Array<{ boatName: string; category: string; description: string; date: string }> = [];

    reportData.forEach(d => {
      // Extinguisher issues
      if (d.extStatus === 'Fail') {
        const latestFail = d.extRecords.filter(r => r.overallStatus === 'Fail')[0];
        issues.push({
          boatName: d.boat.name,
          category: 'ถังดับเพลิง',
          description: latestFail?.remarks || 'ตรวจพบถังดับเพลิงไม่ได้มาตรฐานหรือชำรุด',
          date: d.latestExtDate
        });
      }
      // Medical issues
      if (d.medStatus === 'Fail') {
        const latestFail = d.medRecords.filter(r => r.overallStatus === 'Fail')[0];
        issues.push({
          boatName: d.boat.name,
          category: 'ตู้ยาเวชภัณฑ์',
          description: latestFail?.remarks || 'อุปกรณ์ในตู้ยาหมดอายุหรือจำนวนไม่เพียงพอ',
          date: d.latestMedDate
        });
      }
      // Life Jacket issues
      if (d.ljStatus === 'Fail') {
        const latestFail = d.ljRecords.filter(r => r.overallStatus === 'Fail')[0];
        issues.push({
          boatName: d.boat.name,
          category: 'เสื้อชูชีพ',
          description: latestFail?.remarks || 'จำนวนเสื้อชูชีพไม่ครบหรือมีสภาพชำรุดเสียหาย',
          date: d.latestLjDate
        });
      }
      // License issues
      if (d.licStatus === 'Fail') {
        const latestFail = d.licRecords.filter(r => r.overallStatus === 'Fail')[0];
        issues.push({
          boatName: d.boat.name,
          category: 'ใบอนุญาตเรือ & เจ้าหน้าที่',
          description: latestFail?.remarks || 'ใบอนุญาตเรือ ใบนายท้าย หรือใบช่างเครื่องหมดอายุ',
          date: d.latestLicDate
        });
      }
    });

    return issues;
  }, [reportData]);

  const getStatusBadge = (status: 'Pass' | 'Fail' | 'Pending') => {
    switch (status) {
      case 'Pass':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border-2 border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ผ่านเกณฑ์มาตรฐาน
          </span>
        );
      case 'Fail':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border-2 border-rose-500/20">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
            ตรวจพบจุดบกพร่อง
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 border-2 border-amber-500/20">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            รอรอบตรวจสอบค้าง
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ถังดับเพลิง': return <Flame className="h-4 w-4 text-orange-500" />;
      case 'ตู้ยาเวชภัณฑ์': return <HeartPulse className="h-4 w-4 text-emerald-500" />;
      case 'เสื้อชูชีพ': return <LifeBuoy className="h-4 w-4 text-sky-500" />;
      case 'ใบอนุญาตเรือ & เจ้าหน้าที่': return <ShieldCheck className="h-4 w-4 text-indigo-500" />;
      default: return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Executive Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-300 shadow-xl print:border-none print:shadow-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-800 font-black text-xs uppercase tracking-widest">
            <Award className="h-4.5 w-4.5 text-indigo-600" />
            EXECUTIVE COMPLIANCE BRIEFING
          </div>
          <h2 className="text-xl font-black text-slate-950">รายงานผลความปลอดภัยบูรณาการสำหรับผู้บริหาร</h2>
          <p className="text-xs text-slate-500 font-bold">
            สรุปสถานะความคุ้มครองความปลอดภัย ถังดับเพลิง, เวชภัณฑ์, เสื้อชูชีพ และใบอนุญาตประจำเดือน {getThaiMonthYear(selectedMonth)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white text-slate-950 text-sm font-bold pl-10 pr-8 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer transition-all min-w-[180px]"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>{getThaiMonthYear(m)}</option>
              ))}
            </select>
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all border border-transparent shadow-md hover:shadow-lg"
          >
            <Printer className="h-4 w-4" />
            พิมพ์สรุปรายงาน
          </button>
        </div>
      </div>

      {/* Primary KPI Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
            <Ship className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">เรือทั้งหมดในกองเรือ</div>
            <div className="text-2xl font-black text-slate-950 mt-0.5">{metrics.total} <span className="text-xs text-slate-500 font-medium">ลำ</span></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">ผ่านเกณฑ์สมบูรณ์ (100%)</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">{metrics.fullyCompliant} <span className="text-xs text-emerald-500 font-medium">ลำ</span></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            <AlertTriangle className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">พบข้อบกพร่อง/ชำรุด</div>
            <div className="text-2xl font-black text-rose-700 mt-0.5">{metrics.deficient} <span className="text-xs text-slate-500 font-medium">ลำ</span></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">ตรวจไม่ครบ / รอคิวตรวจ</div>
            <div className="text-2xl font-black text-amber-700 mt-0.5">{metrics.incomplete} <span className="text-xs text-slate-500 font-medium">ลำ</span></div>
          </div>
        </div>
      </div>

      {/* Heuristic AI-Vibe Manager Insight Summary Box */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border-2 border-slate-300 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="h-4.5 w-4.5 text-indigo-700" />
          สรุปบทวิเคราะห์ของผู้บริหาร (EXECUTIVE REPORT SUMMARY & RECOMMENDATIONS)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700 leading-relaxed">
          <div className="space-y-2">
            <p>
              • สถานะกองเรือโดยภาพรวมในเดือน <span className="text-slate-900 font-extrabold">{getThaiMonthYear(selectedMonth)}</span> มีอัตราความปลอดภัยสมบูรณ์ร้อยละ <span className="text-emerald-700 font-extrabold">{Math.round((metrics.fullyCompliant / metrics.total) * 100)}%</span> ของจำนวนลำเรือทั้งหมด
            </p>
            <p>
              • ด้านถังดับเพลิง: ผ่านเกณฑ์การรับรอง <span className="text-emerald-700">{metrics.ext.pass} ลำ</span>, บกพร่อง <span className="text-rose-700">{metrics.ext.fail} ลำ</span> {metrics.ext.pend > 0 && `, ค้างตรวจสอบรอบเดือนนี้ ${metrics.ext.pend} ลำ`}
            </p>
            <p>
              • ด้านตู้ยาเวชภัณฑ์: ผ่านเกณฑ์การรับรอง <span className="text-emerald-700">{metrics.med.pass} ลำ</span>, ตู้ยาเสียหายหรือยาขาดแคลน <span className="text-rose-700">{metrics.med.fail} ลำ</span>
            </p>
          </div>
          <div className="space-y-2">
            <p>
              • ด้านความมั่นคงของเสื้อชูชีพ: ตรวจสอบและผ่านเกณฑ์ <span className="text-emerald-700">{metrics.lj.pass} ลำ</span> และพบจุดชำรุดเสียหายหรือขาดแคลน <span className="text-rose-700">{metrics.lj.fail} ลำ</span>
            </p>
            <p>
              • ด้านใบอนุญาตเรือและกำลังพลเรือ: ใบขับขี่นายท้ายและใบใช้เรือมีสถานะปกติ <span className="text-emerald-700">{metrics.lic.pass} ลำ</span>, หมดอายุหรือใกล้หมดอายุแจ้งเบิกเปลี่ยนใหม่ <span className="text-rose-700">{metrics.lic.fail} ลำ</span>
            </p>
            <div className="pt-1.5 border-t border-slate-300 flex items-center gap-2 text-[10px] text-indigo-800 uppercase font-black">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              ข้อเสนอแนะ: {metrics.deficient > 0 ? 'ควรเร่งสั่งการให้เจ้าหน้าที่กู้คืนจุดบกพร่องของเรือสีแดงตามรายการตรวจสอบด้านล่าง' : 'กองเรือปฏิบัติหน้าที่ความมั่นคงและปลอดภัยอย่างสมบูรณ์แบบ รักษามาตรฐานนี้ต่อไป'}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Deficiencies List */}
      {failDetails.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-rose-300 overflow-hidden shadow-lg animate-pulse-subtle">
          <div className="bg-rose-50 border-b-2 border-rose-200 px-5 py-3.5 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <h3 className="text-xs font-black text-rose-800 uppercase tracking-widest">
              รายการปัญหาความมั่นคงที่ต้องได้รับการแก้ไขเร่งด่วน ({failDetails.length} รายการ)
            </h3>
          </div>
          <div className="divide-y divide-rose-100">
            {failDetails.map((issue, index) => (
              <div key={index} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-rose-50/20 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
                    {getCategoryIcon(issue.category)}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block text-sm">
                      เรือ {issue.boatName} &mdash; <span className="text-rose-700">{issue.category}</span>
                    </span>
                    <span className="text-slate-600 font-medium block mt-1">
                      รายละเอียดปัญหา: <span className="font-bold text-slate-800">{issue.description}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px] shrink-0 self-start sm:self-center bg-rose-100/50 px-2 py-1 rounded">
                  <Calendar className="h-3.5 w-3.5 text-rose-600" />
                  ตรวจพบวันที่: {issue.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comprehensive Boats Compliance Table & Accordion */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
            <FileCheck className="h-4.5 w-4.5 text-slate-700" />
            ตารางรายงานแจกแจงสถานะความมั่นคงเรือรายลำเรือ
          </h3>
          <span className="text-[10px] text-slate-500 font-bold bg-white px-2.5 py-1 rounded-full border border-slate-200">
            กดที่ลำเรือเพื่อเปิดประวัติการรายงานแบบเต็ม
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">ชื่อเรือประจำการ</th>
                <th className="py-4 px-4 text-center">ถังดับเพลิง</th>
                <th className="py-4 px-4 text-center">ตู้ยาและเวชภัณฑ์</th>
                <th className="py-4 px-4 text-center">เสื้อชูชีพประจำจุด</th>
                <th className="py-4 px-4 text-center">ใบอนุญาตเรือ & นายท้าย</th>
                <th className="py-4 px-6 text-right">สรุปผลรวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-bold">
              {reportData.map(({
                boat,
                extStatus,
                latestExtDate,
                extRecords,
                medStatus,
                latestMedDate,
                medRecords,
                ljStatus,
                latestLjDate,
                ljRecords,
                licStatus,
                latestLicDate,
                licRecords,
                overallBoatStatus
              }) => {
                const isExpanded = !!expandedBoats[boat.id];
                
                const getStatusCell = (status: 'Pass' | 'Fail' | 'Pending', dateStr: string) => {
                  let badgeClass = '';
                  let statusText = '';
                  if (status === 'Pass') {
                    badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    statusText = 'ผ่าน';
                  } else if (status === 'Fail') {
                    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                    statusText = 'บกพร่อง';
                  } else {
                    badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                    statusText = 'ค้างตรวจ';
                  }

                  return (
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <span className={`px-2 py-0.5 rounded border font-black text-[10px] ${badgeClass}`}>
                        {statusText}
                      </span>
                      {dateStr && (
                        <span className="text-[9px] text-slate-500 font-mono">{dateStr}</span>
                      )}
                    </div>
                  );
                };

                return (
                  <React.Fragment key={boat.id}>
                    {/* Row Item */}
                    <tr 
                      onClick={() => toggleBoatExpand(boat.id)}
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-indigo-50/10' : ''}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-200 text-teal-600 shrink-0">
                            <Ship className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <span className="font-black text-slate-950 text-sm block">{boat.name}</span>
                            <span className="text-[10px] text-slate-500 font-semibold uppercase font-mono block mt-0.5">Fleet Boat #{boat.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">{getStatusCell(extStatus, latestExtDate)}</td>
                      <td className="py-4 px-4 text-center">{getStatusCell(medStatus, latestMedDate)}</td>
                      <td className="py-4 px-4 text-center">{getStatusCell(ljStatus, latestLjDate)}</td>
                      <td className="py-4 px-4 text-center">{getStatusCell(licStatus, latestLicDate)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {getStatusBadge(overallBoatStatus)}
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Inspection Logs */}
                    {isExpanded && (
                      <tr className="bg-slate-50/30">
                        <td colSpan={6} className="py-4 px-6 border-t border-slate-200">
                          <div className="bg-white rounded-xl border border-slate-300 p-5 space-y-4 shadow-inner">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <span className="font-extrabold text-sm text-indigo-900 uppercase">
                                บันทึกสรุปรายละเอียดความมั่นคง &mdash; เรือ {boat.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono font-bold">
                                ประจำรอบเดือน {selectedMonth}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left side: Extinguisher & Medical */}
                              <div className="space-y-3">
                                {/* Fire Extinguisher Log */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Flame className="h-4.5 w-4.5 text-orange-600" />
                                    <span className="font-extrabold text-xs text-slate-900">1. การตรวจเช็คถังดับเพลิงประจำเดือน</span>
                                  </div>
                                  {extRecords.length > 0 ? (
                                    <div className="space-y-1.5 text-[11px] leading-relaxed">
                                      <p className="text-slate-600">
                                        • จำนวนประวัติการตรวจสอบในรอบเดือน: <span className="font-bold text-slate-900">{extRecords.length} ครั้ง</span>
                                      </p>
                                      {extRecords.map((r, i) => (
                                        <div key={i} className="pl-3.5 border-l-2 border-indigo-200 mt-1">
                                          <div className="flex justify-between">
                                            <span className="font-extrabold text-slate-800">วันที่: {r.inspectionDate} โดย {r.inspectorName}</span>
                                            <span className={`px-1.5 py-0.2 rounded font-black ${r.overallStatus === 'Pass' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                                              {r.overallStatus === 'Pass' ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน'}
                                            </span>
                                          </div>
                                          {r.remarks && <p className="text-slate-500 font-medium">หมายเหตุ: {r.remarks}</p>}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-slate-500 text-[11px] italic">• ค้างการตรวจเช็คในรอบเดือนนี้ (ไม่มีรายงานตรวจเช็คของเดือนนี้)</p>
                                  )}
                                </div>

                                {/* Medical Kit Log */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <HeartPulse className="h-4.5 w-4.5 text-emerald-600" />
                                    <span className="font-extrabold text-xs text-slate-900">2. การตรวจเช็คตู้ยาและคลังเวชภัณฑ์</span>
                                  </div>
                                  {medRecords.length > 0 ? (
                                    <div className="space-y-1.5 text-[11px] leading-relaxed">
                                      {medRecords.map((r, i) => (
                                        <div key={i} className="space-y-1">
                                          <div className="flex justify-between">
                                            <span className="font-bold text-slate-800">วันที่ตรวจสอบล่าสุด: <span className="font-extrabold text-indigo-950">{r.inspectionDate}</span></span>
                                            <span className={`px-1.5 py-0.2 rounded font-black ${r.overallStatus === 'Pass' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                                              {r.overallStatus === 'Pass' ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน'}
                                            </span>
                                          </div>
                                          <p className="text-slate-600 font-medium">ผู้ตรวจสอบ: {r.inspectorName}</p>
                                          {r.remarks && <p className="text-slate-500 font-medium">สรุปสภาพ: {r.remarks}</p>}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-slate-500 text-[11px] italic">• ค้างการตรวจเช็คในรอบเดือนนี้ (ไม่มีรายงานตรวจเช็คของเดือนนี้)</p>
                                  )}
                                </div>
                              </div>

                              {/* Right side: Life Jacket & Licenses */}
                              <div className="space-y-3">
                                {/* Life Jacket Log */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <LifeBuoy className="h-4.5 w-4.5 text-sky-600" />
                                    <span className="font-extrabold text-xs text-slate-900">3. สภาพเสื้อชูชีพและแผนผังประจำที่นั่ง</span>
                                  </div>
                                  {ljRecords.length > 0 ? (
                                    <div className="space-y-1.5 text-[11px] leading-relaxed">
                                      {ljRecords.map((r, i) => (
                                        <div key={i} className="space-y-1">
                                          <div className="flex justify-between">
                                            <span className="font-bold text-slate-800">ตรวจสอบล่าสุด: <span className="font-extrabold text-indigo-950">{r.inspectionDate}</span></span>
                                            <span className={`px-1.5 py-0.2 rounded font-black ${r.overallStatus === 'Pass' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                                              {r.overallStatus === 'Pass' ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน'}
                                            </span>
                                          </div>
                                          <p className="text-slate-600 font-medium">
                                            ผู้รายงาน: {r.inspectorName} | ชูชีพผู้ใหญ่: <span className="font-extrabold">{r.totalAdults}</span> ตัว | ชูชีพเด็ก: <span className="font-extrabold">{r.totalKids}</span> ตัว
                                          </p>
                                          {r.remarks && <p className="text-slate-500 font-medium">หมายเหตุ: {r.remarks}</p>}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-slate-500 text-[11px] italic">• ค้างการตรวจเช็คในรอบเดือนนี้ (ไม่มีรายงานตรวจเช็คของเดือนนี้)</p>
                                  )}
                                </div>

                                {/* License Compliance Log */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="h-4.5 w-4.5 text-indigo-600" />
                                    <span className="font-extrabold text-xs text-slate-900">4. ใบสำคัญอนุญาตประจำตัวเรือและกำลังพล</span>
                                  </div>
                                  {licRecords.length > 0 ? (
                                    <div className="space-y-1.5 text-[11px] leading-relaxed">
                                      {licRecords.map((r, i) => (
                                        <div key={i} className="space-y-1.5">
                                          <div className="flex justify-between">
                                            <span className="font-bold text-slate-800">อัปเดตใบอนุญาต: <span className="font-extrabold text-indigo-950">{r.inspectionDate}</span></span>
                                            <span className={`px-1.5 py-0.2 rounded font-black ${r.overallStatus === 'Pass' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                                              {r.overallStatus === 'Pass' ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน'}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] bg-white p-1.5 rounded border border-slate-200 font-medium">
                                            <div>• ใบอนุญาตเรือ: <span className={`font-extrabold ${r.vesselLicenseStatus === 'Normal' ? 'text-emerald-700' : 'text-rose-600'}`}>{r.vesselLicenseStatus === 'Normal' ? 'ปกติ' : 'บกพร่อง/หมดอายุ'}</span></div>
                                            <div>• ใบนายท้าย ({r.helmsmanName || '-'}): <span className={`font-extrabold ${r.helmsmanLicenseStatus === 'Normal' ? 'text-emerald-700' : 'text-rose-600'}`}>{r.helmsmanLicenseStatus === 'Normal' ? 'ปกติ' : 'บกพร่อง/หมดอายุ'}</span></div>
                                            <div>• ใบช่างเครื่อง ({r.engineerName || '-'}): <span className={`font-extrabold ${r.engineerLicenseStatus === 'Normal' ? 'text-emerald-700' : 'text-rose-600'}`}>{r.engineerLicenseStatus === 'Normal' ? 'ปกติ' : 'บกพร่อง/หมดอายุ'}</span></div>
                                          </div>
                                          {r.remarks && <p className="text-slate-500 font-medium">รายละเอียดใบอนุญาต: {r.remarks}</p>}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-slate-500 text-[11px] italic">• ค้างการอัปเดตใบอนุญาตในรอบเดือนนี้ (ไม่มีรายงานอัปเดต)</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
