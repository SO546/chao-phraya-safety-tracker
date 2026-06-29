import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  User as UserIcon, 
  Search, 
  Ship as BoatIcon, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  X, 
  Award,
  Wrench,
  FileText,
  Filter,
  Users,
  ChevronRight,
  ClipboardCheck,
  CalendarClock,
  Trash2
} from 'lucide-react';
import { BoatLicenseState, LicenseInspectionRecord, LicenseItemStatus, OverallStatus } from '../types';
import ImageUpload from './ImageUpload';

interface LicenseSectionProps {
  licenses: BoatLicenseState[];
  onSaveInspection: (record: LicenseInspectionRecord | Omit<LicenseInspectionRecord, 'id'>) => void;
  onDeleteInspection: (id: string) => void;
  history: LicenseInspectionRecord[];
}

export default function LicenseSection({
  licenses,
  onSaveInspection,
  onDeleteInspection,
  history,
}: LicenseSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pass' | 'Fail' | 'NeverInspected'>('all');
  const [licenseTypeFilter, setLicenseTypeFilter] = useState<'all' | 'warning' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Inspection Modal States
  const [inspectingBoat, setInspectingBoat] = useState<BoatLicenseState | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [inspectorName, setInspectorName] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState<string | null>(null);
  
  // Form input states
  const [vesselLicenseNo, setVesselLicenseNo] = useState('');
  const [vesselLicenseIssue, setVesselLicenseIssue] = useState('');
  const [vesselLicenseExpiry, setVesselLicenseExpiry] = useState('');
  const [vesselLicenseStatus, setVesselLicenseStatus] = useState<LicenseItemStatus>('Normal');

  const [helmsmanName, setHelmsmanName] = useState('');
  const [helmsmanLicenseNo, setHelmsmanLicenseNo] = useState('');
  const [helmsmanLicenseIssue, setHelmsmanLicenseIssue] = useState('');
  const [helmsmanLicenseExpiry, setHelmsmanLicenseExpiry] = useState('');
  const [helmsmanLicenseStatus, setHelmsmanLicenseStatus] = useState<LicenseItemStatus>('Normal');

  const [engineerName, setEngineerName] = useState('');
  const [engineerLicenseNo, setEngineerLicenseNo] = useState('');
  const [engineerLicenseIssue, setEngineerLicenseIssue] = useState('');
  const [engineerLicenseExpiry, setEngineerLicenseExpiry] = useState('');
  const [engineerLicenseStatus, setEngineerLicenseStatus] = useState<LicenseItemStatus>('Normal');

  const [remarks, setRemarks] = useState('');
  const [vesselPhotoUrl, setVesselPhotoUrl] = useState<string | undefined>(undefined);
  const [helmsmanPhotoUrl, setHelmsmanPhotoUrl] = useState<string | undefined>(undefined);
  const [engineerPhotoUrl, setEngineerPhotoUrl] = useState<string | undefined>(undefined);

  // Open inspection/update modal
  const handleOpenInspect = (boat: BoatLicenseState) => {
    setEditingRecordId(null); // Adding new record
    setInspectingBoat(boat);
    setInspectorName(boat.lastInspector || '');
    setVesselPhotoUrl(boat.vesselPhotoUrl);
    setHelmsmanPhotoUrl(boat.helmsmanPhotoUrl);
    setEngineerPhotoUrl(boat.engineerPhotoUrl);
    setInspectionDate(new Date().toISOString().substring(0, 10));

    setVesselLicenseNo(boat.vesselLicenseNo || '');
    setVesselLicenseIssue(boat.vesselLicenseIssue || '');
    setVesselLicenseExpiry(boat.vesselLicenseExpiry || '');
    setVesselLicenseStatus(boat.vesselLicenseStatus || 'Normal');

    setHelmsmanName(boat.helmsmanName || '');
    setHelmsmanLicenseNo(boat.helmsmanLicenseNo || '');
    setHelmsmanLicenseIssue(boat.helmsmanLicenseIssue || '');
    setHelmsmanLicenseExpiry(boat.helmsmanLicenseExpiry || '');
    setHelmsmanLicenseStatus(boat.helmsmanLicenseStatus || 'Normal');

    setEngineerName(boat.engineerName || '');
    setEngineerLicenseNo(boat.engineerLicenseNo || '');
    setEngineerLicenseIssue(boat.engineerLicenseIssue || '');
    setEngineerLicenseExpiry(boat.engineerLicenseExpiry || '');
    setEngineerLicenseStatus(boat.engineerLicenseStatus || 'Normal');

    setRemarks(boat.remarks || '');
  };

  const handleEditHistoryRecord = (record: LicenseInspectionRecord, boat: BoatLicenseState) => {
    setEditingRecordId(record.id);
    setInspectingBoat(boat); // Re-use inspection modal
    setInspectorName(record.inspectorName);
    setInspectionDate(record.inspectionDate);
    setVesselPhotoUrl(record.vesselPhotoUrl);
    setHelmsmanPhotoUrl(record.helmsmanPhotoUrl);
    setEngineerPhotoUrl(record.engineerPhotoUrl);

    setVesselLicenseNo(record.vesselLicenseNo || '');
    setVesselLicenseIssue(record.vesselLicenseIssue || '');
    setVesselLicenseExpiry(record.vesselLicenseExpiry || '');
    setVesselLicenseStatus(record.vesselLicenseStatus || 'Normal');
    
    setHelmsmanName(record.helmsmanName || '');
    setHelmsmanLicenseNo(record.helmsmanLicenseNo || '');
    setHelmsmanLicenseIssue(record.helmsmanLicenseIssue || '');
    setHelmsmanLicenseExpiry(record.helmsmanLicenseExpiry || '');
    setHelmsmanLicenseStatus(record.helmsmanLicenseStatus || 'Normal');
    
    setEngineerName(record.engineerName || '');
    setEngineerLicenseNo(record.engineerLicenseNo || '');
    setEngineerLicenseIssue(record.engineerLicenseIssue || '');
    setEngineerLicenseExpiry(record.engineerLicenseExpiry || '');
    setEngineerLicenseStatus(record.engineerLicenseStatus || 'Normal');
    
    setRemarks(record.remarks || '');
  };

  // Submit/Save Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingBoat) return;

    if (!inspectorName.trim()) {
      alert('กรุณากรอกชื่อผู้ตรวจสอบหลักการตรวจใบอนุญาต');
      return;
    }

    // Determine overall audit status
    // If any license is expired or missing, it's a Fail.
    // Otherwise, if any is NearExpiry or Normal, it's Pass.
    const hasFailStates = 
      vesselLicenseStatus === 'Expired' || vesselLicenseStatus === 'Missing' ||
      helmsmanLicenseStatus === 'Expired' || helmsmanLicenseStatus === 'Missing' ||
      engineerLicenseStatus === 'Expired' || engineerLicenseStatus === 'Missing';

    const calculatedOverall: 'Pass' | 'Fail' = hasFailStates ? 'Fail' : 'Pass';

    onSaveInspection({
      ...(editingRecordId ? { id: editingRecordId } : {}),
      boatId: inspectingBoat.boatId,
      boatName: inspectingBoat.boatName,
      inspectionDate,
      inspectorName,
      vesselLicenseNo,
      vesselLicenseIssue,
      vesselLicenseExpiry,
      vesselLicenseStatus,
      helmsmanName,
      helmsmanLicenseNo,
      helmsmanLicenseIssue,
      helmsmanLicenseExpiry,
      helmsmanLicenseStatus,
      engineerName,
      engineerLicenseNo,
      engineerLicenseIssue,
      engineerLicenseExpiry,
      engineerLicenseStatus,
      overallStatus: calculatedOverall,
      remarks,
      vesselPhotoUrl,
      helmsmanPhotoUrl,
      engineerPhotoUrl,
    } as LicenseInspectionRecord);

    setInspectingBoat(null);
    setEditingRecordId(null);
  };

  // Helper labels & styles mapped
  const getStatusBadge = (status: LicenseItemStatus) => {
    switch (status) {
      case 'Normal':
        return (
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded font-bold text-[10px] border border-green-150">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            🟢 ปกติ / มีอายุใช้งาน
          </span>
        );
      case 'NearExpiry':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded font-bold text-[10px] border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            🟡 ใกล้หมดอายุ (เลี่ยงระวัง)
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded font-bold text-[10px] border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            🔴 หมดอายุ (Expired)
          </span>
        );
      case 'Missing':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1 rounded font-bold text-[10px] border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            🟠 สูญหาย / ไม่มีข้อมูล
          </span>
        );
      default:
        return null;
    }
  };

  const getOverallBadge = (status: OverallStatus) => {
    switch (status) {
      case 'Pass':
        return (
          <span className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-1 rounded font-bold text-[11px] uppercase tracking-wide">
            <CheckCircle2 className="h-3.5 w-3.5" />ผ่านเกณฑ์ (Pass)
          </span>
        );
      case 'Fail':
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white px-3 py-1 rounded font-bold text-[11px] uppercase tracking-wide">
            <AlertTriangle className="h-3.5 w-3.5" />พบใบชำรุด/หมดอายุ (Fail)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-500 text-white px-3 py-1 rounded font-bold text-[11px] uppercase tracking-wide">
            <AlertCircle className="h-3.5 w-3.5" />ยังไม่ตรวจสอบ (Unverified)
          </span>
        );
    }
  };

  // Counting dynamic stats
  const totalBoatsCount = licenses.length;
  const certifiedPassedCount = licenses.filter(l => l.overallStatus === 'Pass').length;
  const certifiedFailedCount = licenses.filter(l => l.overallStatus === 'Fail').length;
  const uninspectedCount = licenses.filter(l => l.overallStatus === 'NeverInspected').length;

  let docTotalCount = 0;
  let docNormalCount = 0;
  let docNearExpiryCount = 0;
  let docExpiredCount = 0;
  let docMissingCount = 0;

  licenses.forEach(l => {
    const docStatuses = [l.vesselLicenseStatus, l.helmsmanLicenseStatus, l.engineerLicenseStatus];
    docStatuses.forEach(st => {
      docTotalCount++;
      if (st === 'Normal') docNormalCount++;
      else if (st === 'NearExpiry') docNearExpiryCount++;
      else if (st === 'Expired') docExpiredCount++;
      else if (st === 'Missing') docMissingCount++;
    });
  });

  // Filter logic
  const filteredLicenses = licenses.filter(boat => {
    // Search filter
    const matchesSearch = 
      boat.boatName.trim().toLowerCase().includes(searchTerm.toLowerCase()) ||
      boat.helmsmanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boat.engineerName.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      boat.overallStatus === statusFilter;

    // License warnings filter
    const hasWarning = 
      boat.vesselLicenseStatus === 'NearExpiry' || 
      boat.helmsmanLicenseStatus === 'NearExpiry' || 
      boat.engineerLicenseStatus === 'NearExpiry';

    const hasExpired = 
      boat.vesselLicenseStatus === 'Expired' || boat.vesselLicenseStatus === 'Missing' ||
      boat.helmsmanLicenseStatus === 'Expired' || boat.helmsmanLicenseStatus === 'Missing' ||
      boat.engineerLicenseStatus === 'Expired' || boat.engineerLicenseStatus === 'Missing';

    const matchesType = 
      licenseTypeFilter === 'all' ||
      (licenseTypeFilter === 'warning' && hasWarning) ||
      (licenseTypeFilter === 'expired' && hasExpired);

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div id="license-workspace" className="space-y-6">
      
      {/* Title Header Block */}
      <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-12 -translate-y-6">
          <Award className="h-44 w-44 text-blue-900" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded tracking-widest uppercase">SECTION 03</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none font-mono">Maritime Compliance Suite</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            🚢 ระบบรายงานการตรวจสอบใบอนุญาตใช้เรือ และใบนายท้าย/ใบช่างเครื่อง
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            บันทึก เฝ้าระวัง และประเมินสถานภาพเอกสารสิทธิ์เรือโดยสาร และประกาศนียบัตรผู้ควบคุมเรือ (นายท้าย/ช่างกลเรือ) ประจำตารางเดินเรือทั้ง 7 ลำ ตามระเบียบข้อบังคับความปลอดภัยการเดินเรือ กรมเจ้าท่า
          </p>
        </div>
      </div>

      {/* Fleet Dashboard Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest font-mono">Fleet Compliance Rate</span>
            <span className="text-2xl font-bold font-mono text-slate-800">
              {totalBoatsCount > 0 ? ((certifiedPassedCount / totalBoatsCount) * 100).toFixed(0) : '0'}%
            </span>
            <span className="block text-[10px] text-green-600 font-bold mt-1">
              🟢 ข้อมูลเรือผ่านเกณฑ์ {certifiedPassedCount} ลำ
            </span>
          </div>
          <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded flex items-center justify-center border border-green-500/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest font-mono">Total Licenses Audited</span>
            <span className="text-2xl font-bold font-mono text-slate-800">
              {docTotalCount} ใบ
            </span>
            <span className="block text-[10px] text-slate-500 font-bold mt-1">
              เรือล่ะ 3 หมวดหมู่หลัก (7 ลำ)
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded flex items-center justify-center border border-blue-500/10">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest font-mono">Warning Checkpoints</span>
            <span className="text-2xl font-bold font-mono text-amber-600">
              {docNearExpiryCount} ใบ
            </span>
            <span className="block text-[10px] text-amber-600 font-bold mt-1">
              ⚠️ ใกล้หมดอายุ (ภายใน 30-90 วัน)
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded flex items-center justify-center border border-amber-500/10">
            <CalendarClock className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-widest font-mono">Critical Failures</span>
            <span className="text-2xl font-bold font-mono text-red-650">
              {docExpiredCount + docMissingCount} ใบ
            </span>
            <span className="block text-[10px] text-red-650 font-bold mt-1 animate-pulse">
              🚨 หมดอายุ {docExpiredCount} / ขาดข้อมูล {docMissingCount}
            </span>
          </div>
          <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded flex items-center justify-center border border-red-500/10">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="ค้นหาชื่อเรือ, นายท้าย, นายช่าง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white outline-hidden font-medium text-slate-700"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
          
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-600 font-bold">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>ฟิลเตอร์:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded text-xs p-1.5 font-bold text-slate-705 cursor-pointer"
          >
            <option value="all">🔍 ทุกสถานะการประเมิน (All status)</option>
            <option value="Pass">🟢 ผ่านการตรวจสอบเอกสารพิจารณา (Pass)</option>
            <option value="Fail">🔴 มีเอกสารหมดอายุ/ชำรุด (Fail)</option>
            <option value="NeverInspected">🔘 ยังไม่ได้บันทึกข้อมูลหลัก (Never audited)</option>
          </select>

          <select
            value={licenseTypeFilter}
            onChange={(e) => setLicenseTypeFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded text-xs p-1.5 font-bold text-slate-705 cursor-pointer"
          >
            <option value="all">⚓ คัดกรองจากระดับการแจ้งเตือนใบอนุญาต</option>
            <option value="warning">🟡 มีเอกสารใกล้หมดอายุความเสี่ยง (Near Expiry)</option>
            <option value="expired">🔴 มีเอกสารสิ้นอายุหรือขาดแคลนข้อมูล (Expired/Missing)</option>
          </select>

          {(searchTerm || statusFilter !== 'all' || licenseTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setLicenseTypeFilter('all');
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2.5 py-1.5 rounded cursor-pointer"
            >
              ล้างตัวกรอง
            </button>
          )}

        </div>
      </div>

      {/* SHIPS LICENSING GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLicenses.length > 0 ? (
          filteredLicenses.map((boat) => {
            const isNeverInspected = boat.overallStatus === 'NeverInspected';
            const isFail = boat.overallStatus === 'Fail';
            
            return (
              <div 
                key={boat.boatId} 
                className={`bg-white rounded-sm border-2 shadow-xs flex flex-col justify-between transition-all duration-200 ${
                  isNeverInspected 
                    ? 'border-slate-200/80 hover:border-slate-300' 
                    : isFail 
                    ? 'border-red-500/40 hover:border-red-500/60' 
                    : 'border-green-500/30 hover:border-green-500/50'
                }`}
              >
                
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded flex items-center justify-center border font-bold text-sm ${
                      isNeverInspected 
                        ? 'bg-slate-100 text-slate-600 border-slate-200' 
                        : isFail 
                        ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' 
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      <BoatIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800">{boat.boatName}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Vessel Crew Compliance</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {getOverallBadge(boat.overallStatus)}
                  </div>
                </div>

                {/* Card Body with Three Parameters */}
                <div className="p-4 space-y-4 flex-1">
                  
                  {/* Parameter 1: Vessel License */}
                  <div className="bg-slate-50/75 p-3 rounded border border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider font-sans block flex items-center gap-1">
                        ⚓ 1. ใบอนุญาตใช้เรือ (Vessel License)
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-600">
                        <span>เลขที่: {boat.vesselLicenseNo || 'ยังไม่ได้บันทึก'}</span>
                        <span className="text-slate-300">|</span>
                        <span>หมดอายุ: {boat.vesselLicenseExpiry ? new Date(boat.vesselLicenseExpiry).toLocaleDateString('th-TH') : '-'}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(boat.vesselLicenseStatus)}
                    </div>
                  </div>

                  {/* Parameter 2: Helmsman */}
                  <div className="bg-slate-50/75 p-3 rounded border border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider font-sans block flex items-center gap-1">
                        👮 2. ใบนายท้ายเรือ (Helmsman Cert.)
                      </span>
                      <div className="text-xs font-bold text-slate-700 font-sans block">
                        นายท้ายเรือ: <span className="text-slate-900 underline decoration-dotted">{boat.helmsmanName || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-500">
                        <span>เลขที่: {boat.helmsmanLicenseNo || '-'}</span>
                        <span className="text-slate-300">|</span>
                        <span>หมดอายุ: {boat.helmsmanLicenseExpiry ? new Date(boat.helmsmanLicenseExpiry).toLocaleDateString('th-TH') : '-'}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(boat.helmsmanLicenseStatus)}
                    </div>
                  </div>

                  {/* Parameter 3: Engineer */}
                  <div className="bg-slate-50/75 p-3 rounded border border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider font-sans block flex items-center gap-1">
                        🔧 3. ใบอนุญาตช่างช่างเครื่องเรือ (Engineer Cert.)
                      </span>
                      <div className="text-xs font-bold text-slate-700 font-sans block">
                        คนคุมเครื่องยนต์: <span className="text-slate-900 underline decoration-dotted">{boat.engineerName || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-500">
                        <span>เลขที่: {boat.engineerLicenseNo || '-'}</span>
                        <span className="text-slate-300">|</span>
                        <span>หมดอายุ: {boat.engineerLicenseExpiry ? new Date(boat.engineerLicenseExpiry).toLocaleDateString('th-TH') : '-'}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(boat.engineerLicenseStatus)}
                    </div>
                  </div>

                  {/* Remarks Alerts if Fail or Custom Note */}
                  {boat.remarks && (
                    <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200 text-[11px] text-amber-800 font-bold flex items-start gap-2 leading-relaxed">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <span className="uppercase font-extrabold font-mono text-[9px] block text-amber-900 tracking-wider">REMARKS / บันทึกกำกับงาน:</span>
                        <span>{boat.remarks}</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Card Footer: Metadata and Action Button */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="flex flex-col text-[10px] text-slate-400 font-bold leading-normal text-center sm:text-left">
                    {boat.lastInspectedDate ? (
                      <>
                        <span>ตรวจสอบล่าสุด: {new Date(boat.lastInspectedDate).toLocaleDateString('th-TH')}</span>
                        <span>โดย: {boat.lastInspector || 'เจ้าหน้าที่จัดประจำเรือ'}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">🚨 ยังไม่มีรายงานการเดินสิทธิ์ตรวจสอบข้อมูล</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleOpenInspect(boat)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    อัปเดต / ตรวจสอบใบอนุญาต
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-1 lg:col-span-2 bg-white p-12 text-center rounded border border-slate-200 shadow-2xs">
            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">ไม่พบคลังรายการเรือที่ค้นหาตามเงื่อนไขที่เลือก</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setLicenseTypeFilter('all');
              }}
              className="mt-4 text-xs bg-blue-50 text-blue-600 font-bold px-3 py-2 rounded hover:bg-blue-100 cursor-pointer"
            >
              ล้างสถานะฟิลเตอร์การค้นหาทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* COMPLIANCE AUDITING CHRONOLOGY LOG */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-6">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          📜 สมุดบันทึกประวัติการตรวจสอบใบอนุญาต (Compliance Log Book)
        </h3>
        
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase font-bold text-[9px] tracking-wider">
                  <th className="p-3">วันที่ได้รับการตรวจ</th>
                  <th className="p-3">ชื่อเรือ</th>
                  <th className="p-3">ผู้บันทึกรายงาน</th>
                  <th className="p-3">ใบใช้เรือ</th>
                  <th className="p-3">ใบนายท้าย</th>
                  <th className="p-3">ใบช่างเครื่อง</th>
                  <th className="p-3">ประเมินรวม</th>
                  <th className="p-3">รูปถ่าย (Photo)</th>
                  <th className="p-3">ดำเนินการ</th>
                  <th className="p-3">บันทึกล่าสุด / รายงานชำรุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
                {history.map((h, index) => (
                  <tr key={h.id || index} className="hover:bg-slate-50">
                    <td className="p-3 font-mono">{h.inspectionDate}</td>
                    <td className="p-3 font-bold text-slate-900">{h.boatName}</td>
                    <td className="p-3">{h.inspectorName}</td>
                    <td className="p-3 font-mono max-w-[120px] truncate" title={h.vesselLicenseNo}>
                      {h.vesselLicenseNo} ({h.vesselLicenseStatus === 'Normal' ? '🟢 ปกติ' : h.vesselLicenseStatus === 'NearExpiry' ? '🟡 ใกล้หมด' : '🔴 หมดอายุ'})
                    </td>
                    <td className="p-3 max-w-[120px] truncate" title={`${h.helmsmanName} (เลขที่: ${h.helmsmanLicenseNo})`}>
                      {h.helmsmanName} ({h.helmsmanLicenseStatus === 'Normal' ? '🟢 ปกติ' : '🔴 หมดอายุ'})
                    </td>
                    <td className="p-3 max-w-[120px] truncate" title={`${h.engineerName} (เลขที่: ${h.engineerLicenseNo})`}>
                      {h.engineerName} ({h.engineerLicenseStatus === 'Normal' ? '🟢' : '🔴'})
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                        h.overallStatus === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {h.overallStatus === 'Pass' ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {h.vesselPhotoUrl && (
                          <div
                            onClick={() => setSelectedLightboxPhoto(h.vesselPhotoUrl || null)}
                            className="relative w-8 h-8 rounded border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 hover:scale-105 transition-all shadow-xs"
                            title="รูปถ่ายใบอนุญาตใช้เรือ"
                          >
                            <img src={h.vesselPhotoUrl} alt="Vessel License" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        {h.helmsmanPhotoUrl && (
                          <div
                            onClick={() => setSelectedLightboxPhoto(h.helmsmanPhotoUrl || null)}
                            className="relative w-8 h-8 rounded border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 hover:scale-105 transition-all shadow-xs"
                            title="รูปถ่ายใบนายท้ายเรือ"
                          >
                            <img src={h.helmsmanPhotoUrl} alt="Helmsman License" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        {h.engineerPhotoUrl && (
                          <div
                            onClick={() => setSelectedLightboxPhoto(h.engineerPhotoUrl || null)}
                            className="relative w-8 h-8 rounded border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 hover:scale-105 transition-all shadow-xs"
                            title="รูปถ่ายใบช่างเครื่อง"
                          >
                            <img src={h.engineerPhotoUrl} alt="Engineer License" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        {!h.vesselPhotoUrl && !h.helmsmanPhotoUrl && !h.engineerPhotoUrl && <span className="text-slate-400 font-mono">-</span>}
                      </div>
                    </td>
                    <td className="p-3">
                        <div className="flex items-center gap-2">
                            <button 
                                className="text-blue-600 hover:text-blue-800 font-bold text-[10px] cursor-pointer"
                                onClick={() => {
                                    const boat = licenses.find(l => l.boatId === h.boatId);
                                    if (boat) handleEditHistoryRecord(h, boat);
                                }}>
                                แก้ไข
                            </button>
                            <button 
                                className="text-red-600 hover:text-red-800 font-bold text-[10px] cursor-pointer"
                                onClick={() => onDeleteInspection(h.id)}>
                                ลบ
                            </button>
                        </div>
                    </td>
                    <td className="p-3 text-slate-500 max-w-[200px] truncate" title={h.remarks || '-'}>
                      {h.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 bg-slate-50 rounded border border-slate-100 border-dashed text-xs font-semibold">
            ยังไม่มีบันทึกประวัติการเดินระบบตรวจสอบใบอนุญาตเรือในเซสชันนี้ บันทึกข้างต้นจะปรากฏในตารางตรงนี้ทันทีเมื่อรายงานได้รับการบันทึก
          </div>
        )}
      </div>

      {/* INSPECT MODAL FORM (OVERLAY) */}
      {inspectingBoat && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-8 p-4 z-50 overflow-hidden animate-fade-in">
          <div className="bg-white rounded-sm border-2 border-slate-950 w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BoatIcon className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase">ตรวจประเมินใบสิทธิ์พนักงานและเรือ: {inspectingBoat.boatName}</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Documentation Audit Portal</p>
                </div>
              </div>
              <button 
                onClick={() => setInspectingBoat(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden h-full">
              
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Row 1: Inspector Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">ชื่อเจ้าหน้าที่ตรวจสอบใบอนุญาต (Auditor Name)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <UserIcon className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="ระบุชื่อเจ้าหน้าที่ผู้ตรวจ"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-700 outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">วันที่ดำเนินการตรวจสอบ (Audit Date)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <input
                      type="date"
                      required
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-1.5 text-xs text-slate-700 font-bold font-mono outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Parameter 1 Form: Vessel License */}
              <div className="border border-slate-200 rounded p-4 space-y-3">
                <div className="border-b border-slate-100 pb-2 mb-2">
                  <span className="text-xs font-extrabold text-blue-900 block uppercase">
                    ⚓ ส่วนที่ 1: ใบอนุญาตใช้เรือท่องเที่ยว (Vessel License)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase">เลขทะเบียนใบใช้เรือ</label>
                    <input
                      type="text"
                      required
                      value={vesselLicenseNo}
                      onChange={(e) => setVesselLicenseNo(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase">วันหมดสิทธิ์ (Expiry Date)</label>
                    <input
                      type="date"
                      required
                      value={vesselLicenseExpiry}
                      onChange={(e) => setVesselLicenseExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase">สถานะใบใช้เรือ</label>
                    <select
                      value={vesselLicenseStatus}
                      onChange={(e) => setVesselLicenseStatus(e.target.value as LicenseItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / เพิ่งต่อใหม่</option>
                      <option value="NearExpiry">🟡 ใกล้หมดสิทธิ์ (เลี่ยงระวัง)</option>
                      <option value="Expired">🔴 หมดสิทธิ์ (Expired)</option>
                      <option value="Missing">🟠 ข้อมูลสูญหาย / ไม่มีข้อมูล</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parameter 2 Form: Helmsman (ใบนายท้าย) */}
              <div className="border border-slate-200 rounded p-4 space-y-3">
                <div className="border-b border-slate-100 pb-2 mb-2">
                  <span className="text-xs font-extrabold text-blue-900 block uppercase">
                    👮 ส่วนที่ 2: ประกาศนียบัตรฝ่ายเดินเรือ / ใบนายท้ายเรือ (Helmsman License)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-0.5 sm:col-span-2">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase">ชื่อ-นามสกุล นายท้ายเรือประจำลำ</label>
                    <input
                      type="text"
                      required
                      placeholder="นาย..."
                      value={helmsmanName}
                      onChange={(e) => setHelmsmanName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-bold"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase">เลขใบนายท้าย</label>
                    <input
                      type="text"
                      required
                      value={helmsmanLicenseNo}
                      onChange={(e) => setHelmsmanLicenseNo(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase">วันอนุญาตหมดเขต</label>
                    <input
                      type="date"
                      required
                      value={helmsmanLicenseExpiry}
                      onChange={(e) => setHelmsmanLicenseExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase">สถานะใบนายท้าย</label>
                    <select
                      value={helmsmanLicenseStatus}
                      onChange={(e) => setHelmsmanLicenseStatus(e.target.value as LicenseItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / ผ่านเกณฑ์การประเมิน</option>
                      <option value="NearExpiry">🟡 เดือนเดียบใกล้หมดสิทธิ์ (Near Expiry)</option>
                      <option value="Expired">🔴 ใบสิ้นประสิทธิภาพ (Expired)</option>
                      <option value="Missing">🟠 คูหาสูญหาย / ขาดนายท้ายประจำเรือ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parameter 3 Form: Engineer */}
              <div className="border border-slate-200 rounded p-4 space-y-3">
                <div className="border-b border-slate-100 pb-2 mb-2">
                  <span className="text-xs font-extrabold text-blue-900 block uppercase">
                    🔧 ส่วนที่ 3: ประกาศนียบัตรฝ่ายจักรกล / ใบช่างเครื่องเรือ (Engineer License)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-0.5 sm:col-span-2">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase">ชื่อ-นามสกุล คนคุมเครื่องยนต์</label>
                    <input
                      type="text"
                      required
                      placeholder="นาย..."
                      value={engineerName}
                      onChange={(e) => setEngineerName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-bold"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase">เลขใบช่างเครื่อง</label>
                    <input
                      type="text"
                      required
                      value={engineerLicenseNo}
                      onChange={(e) => setEngineerLicenseNo(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase">วันอนุญาตหมดเขต</label>
                    <input
                      type="date"
                      required
                      value={engineerLicenseExpiry}
                      onChange={(e) => setEngineerLicenseExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 text-slate-700 font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase">สถานะใบช่างเครื่อง</label>
                    <select
                      value={engineerLicenseStatus}
                      onChange={(e) => setEngineerLicenseStatus(e.target.value as LicenseItemStatus)}
                      className="w-full bg-white border border-slate-300 rounded text-xs p-1.5 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Normal">🟢 ปกติ / ได้รับอนุญาตโดยชอบ</option>
                      <option value="NearExpiry">🟡 เดือนเดียบใกล้หมดสิทธิ์ (Near Expiry)</option>
                      <option value="Expired">🔴 ใบสิ้นประสิทธิภาพ (Expired)</option>
                      <option value="Missing">🟠 ขาดแคลนพนักงานใบสิทธิ์ถาวร</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Photo Upload Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <ImageUpload
                    label="รูปถ่ายใบอนุญาตใช้เรือ"
                    onImageSelected={setVesselPhotoUrl}
                    existingImage={vesselPhotoUrl}
                  />
                </div>
                <div className="space-y-1">
                  <ImageUpload
                    label="รูปถ่ายใบนายท้ายเรือ"
                    onImageSelected={setHelmsmanPhotoUrl}
                    existingImage={helmsmanPhotoUrl}
                  />
                </div>
                <div className="space-y-1">
                  <ImageUpload
                    label="รูปถ่ายใบช่างเครื่อง"
                    onImageSelected={setEngineerPhotoUrl}
                    existingImage={engineerPhotoUrl}
                  />
                </div>
              </div>

              {/* Remarks Area */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">หมายเหตุเพิ่มเติม / ข้อเสนอแนะการแก้ไข (Remarks)</label>
                <textarea
                  rows={2}
                  placeholder="ระบุข้อบกพร่องที่พบ หรือบันทึกเพื่อแจ้งผู้ถือใบสิทธิ์ให้ทราบล่วงหน้า..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded text-xs p-2 text-slate-700 font-medium font-sans outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              </div>
              
              {/* Action Buttons */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex gap-3 justify-end items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setInspectingBoat(null)}
                  className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-bold text-xs px-4  py-2.5 rounded cursor-pointer transition-colors"
                >
                  ยกเลิกการแก้ไข
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-2.5 rounded cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  บันทึกประวัติการตรวจ
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Interactive Lightbox Portal for Zooming License Images */}
      {selectedLightboxPhoto && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedLightboxPhoto(null)}
        >
          <div className="relative bg-white p-2 rounded border border-slate-900 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <button
              onClick={() => setSelectedLightboxPhoto(null)}
              className="absolute top-4 right-4 bg-slate-900/80 text-white p-2 rounded-full cursor-pointer hover:bg-slate-950 transition-colors z-10 font-bold"
              title="Close"
            >
              ✕ CLOSE
            </button>
            <div className="flex-1 bg-slate-950 flex items-center justify-center overflow-hidden rounded">
              <img 
                src={selectedLightboxPhoto} 
                alt="License Zoom" 
                className="max-w-full max-h-[75vh] object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
