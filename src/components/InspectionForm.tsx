import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, HelpCircle, Save, AlertTriangle } from 'lucide-react';
import { FireExtinguisher, InspectionRecord, PressureStatus, SafetyPinStatus, TankPhysicalStatus, HosePhysicalStatus, WeightStatus, ExtinguisherType } from '../types';
import ImageUpload from './ImageUpload';

interface InspectionFormProps {
  extinguisher: FireExtinguisher;
  onSave: (record: Omit<InspectionRecord, 'id'>, updatedType?: ExtinguisherType, updatedSize?: string) => void;
  onCancel: () => void;
  defaultInspectorName: string;
}

export default function InspectionForm({
  extinguisher,
  onSave,
  onCancel,
  defaultInspectorName,
}: InspectionFormProps) {
  // Local state for type and size
  const [extinguisherType, setExtinguisherType] = useState<ExtinguisherType>(extinguisher.type);
  const [extinguisherSize, setExtinguisherSize] = useState<string>(extinguisher.size);
  const [isCustomSize, setIsCustomSize] = useState<boolean>(!['5 lbs', '10 lbs', '15 lbs', '20 lbs'].includes(extinguisher.size));

  // Local state for photo
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(extinguisher.lastPhotoUrl);

  // Local state for inspecting parameters, initialized to existing state or 'Normal'
  const [pressureStatus, setPressureStatus] = useState<PressureStatus>(extinguisher.pressureStatus === 'NeverInspected' as any ? 'Normal' : extinguisher.pressureStatus);
  const [safetyPinStatus, setSafetyPinStatus] = useState<SafetyPinStatus>(extinguisher.safetyPinStatus === 'NeverInspected' as any ? 'Normal' : extinguisher.safetyPinStatus);
  const [tankStatus, setTankStatus] = useState<TankPhysicalStatus>(extinguisher.tankStatus === 'NeverInspected' as any ? 'Normal' : extinguisher.tankStatus);
  const [hoseStatus, setHoseStatus] = useState<HosePhysicalStatus>(extinguisher.hoseStatus === 'NeverInspected' as any ? 'Normal' : extinguisher.hoseStatus);
  const [weightStatus, setWeightStatus] = useState<WeightStatus>(extinguisher.weightStatus === 'NeverInspected' as any ? 'Normal' : extinguisher.weightStatus);
  
  const [inspectorName, setInspectorName] = useState(defaultInspectorName || '');
  const [remarks, setRemarks] = useState(extinguisher.remarks || '');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().substring(0, 10)); // default to today
  const [expiryDate, setExpiryDate] = useState(extinguisher.expiryDate || '');

  // Automatically sync inspectorName when default changes
  useEffect(() => {
    if (defaultInspectorName && !inspectorName) {
      setInspectorName(defaultInspectorName);
    }
  }, [defaultInspectorName]);

  // Derived overall status
  const overallStatus: 'Pass' | 'Fail' =
    pressureStatus === 'Normal' &&
    safetyPinStatus === 'Normal' &&
    tankStatus === 'Normal' &&
    hoseStatus === 'Normal' &&
    weightStatus === 'Normal'
      ? 'Pass'
      : 'Fail';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectorName.trim()) {
      alert('กรุณากรอกชื่อผู้ตรวจเช็ค');
      return;
    }
    if (isCustomSize && !extinguisherSize.trim()) {
      alert('กรุณาระบุขนาดบรรจุ');
      return;
    }

    onSave({
      extinguisherId: extinguisher.id,
      boatId: extinguisher.boatId,
      boatName: extinguisher.boatName,
      location: extinguisher.location,
      type: extinguisherType,
      inspectionDate,
      expiryDate,
      inspectorName,
      pressureStatus,
      safetyPinStatus,
      tankStatus,
      hoseStatus,
      weightStatus,
      overallStatus,
      remarks,
      photoUrl,
    }, extinguisherType, extinguisherSize);
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
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
      <div 
        className="bg-white rounded border-2 border-slate-900 shadow-2xl max-w-xl w-full max-h-[95vh] flex flex-col overflow-hidden animate-fade-in"
        id="inspection-modal"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b-2 border-slate-950">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest bg-red-600 text-white px-2 py-0.5 rounded-sm font-mono border border-red-500">
              AUDIT ID: {extinguisher.id}
            </span>
            <h3 className="text-base font-bold uppercase mt-1.5 tracking-tight">
              บันทึกผลตรวจสอบ: {extinguisher.boatName}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white rounded transition-colors"
            id="close-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Static Details Info */}
          <div className="p-4 bg-slate-50 border border-slate-300 rounded text-xs space-y-4">
            <div>
              <span className="text-slate-500 block uppercase font-extrabold text-[9px] tracking-wider font-mono">ตำแหน่งจัดวาง (Physical Location)</span>
              <span className="font-bold text-slate-800 block mt-1 underline decoration-dotted">{extinguisher.location}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
              {/* Type Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider font-mono">ชนิดถังดับเพลิง (Tank Type)</label>
                <select
                  value={extinguisherType}
                  onChange={(e) => setExtinguisherType(e.target.value as ExtinguisherType)}
                  className="w-full bg-white text-slate-800 text-xs border border-slate-300 rounded-sm p-2 font-bold focus:outline-none focus:border-slate-900 cursor-pointer"
                >
                  <option value="Dry Chemical">เคมีแห้ง (Dry Chemical)</option>
                  <option value="CO2">คาร์บอนไดออกไซด์ (CO2)</option>
                  <option value="Clean Agent">สารเคมีสะอาด (Clean Agent)</option>
                  <option value="Foam">ถังโฟม (Foam)</option>
                </select>
              </div>

              {/* Size Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider font-mono">ขนาดบรรจุ (Capacity Size)</label>
                <div className="flex gap-2">
                  <select
                    value={isCustomSize ? 'custom' : extinguisherSize}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomSize(true);
                      } else {
                        setIsCustomSize(false);
                        setExtinguisherSize(e.target.value);
                      }
                    }}
                    className="flex-1 bg-white text-slate-800 text-xs border border-slate-300 rounded-sm p-2 font-bold focus:outline-none focus:border-slate-900 cursor-pointer"
                  >
                    <option value="5 lbs">5 lbs</option>
                    <option value="10 lbs">10 lbs</option>
                    <option value="15 lbs">15 lbs</option>
                    <option value="20 lbs">20 lbs</option>
                    <option value="custom">ระบุเอง (Custom Size)...</option>
                  </select>
                  
                  {isCustomSize && (
                    <input
                      type="text"
                      value={extinguisherSize}
                      onChange={(e) => setExtinguisherSize(e.target.value)}
                      placeholder="เช่น 12 lbs"
                      className="w-28 bg-white text-slate-800 text-xs border border-slate-300 rounded-sm p-2 font-bold focus:outline-none focus:border-slate-900 font-mono"
                      required
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">รายการตรวจสอบสู้ภัยประจำเครื่อง</h4>

            {/* 1. Pressure Gauge */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex justify-between uppercase tracking-wider">
                <span>1. มาตรวัดเกจแรงดันแก๊ส (Pressure Gauge)</span>
                <span className="text-[10px] font-mono text-slate-400">(ปกติคือสีเขียวตรงตำแหน่ง)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setPressureStatus('Normal')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${pressureStatus === 'Normal' ? 'bg-green-700 text-white border-green-800 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  ปกติ (Normal)
                  {pressureStatus === 'Normal' && <div className="text-[8px] font-normal mt-1">มาตรวัดปกติ</div>}
                </button>
                <button type="button" onClick={() => setPressureStatus('Low')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${pressureStatus === 'Low' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  แรงดันตก (Low)
                  {pressureStatus === 'Low' && <div className="text-[8px] font-normal mt-1">แรงดันต่ำ</div>}
                </button>
                <button type="button" onClick={() => setPressureStatus('High')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${pressureStatus === 'High' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  แรงดันเกิน (High)
                  {pressureStatus === 'High' && <div className="text-[8px] font-normal mt-1">แรงดันสูง</div>}
                </button>
              </div>
            </div>

            {/* 2. Safety Pin & Seal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">2. สลักวาล์วและซีลพลาสติก (Safety Pin & Seal)</label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setSafetyPinStatus('Normal')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${safetyPinStatus === 'Normal' ? 'bg-green-700 text-white border-green-800 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  ปกติและรัดแน่น
                  {safetyPinStatus === 'Normal' && <div className="text-[8px] font-normal mt-1">ซีลสมบูรณ์</div>}
                </button>
                <button type="button" onClick={() => setSafetyPinStatus('Missing')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${safetyPinStatus === 'Missing' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  สูญหาย (Missing)
                  {safetyPinStatus === 'Missing' && <div className="text-[8px] font-normal mt-1">แจ้งซ่อม/เปลี่ยน</div>}
                </button>
                <button type="button" onClick={() => setSafetyPinStatus('Damaged')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${safetyPinStatus === 'Damaged' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  ชำรุดเสียหาย
                  {safetyPinStatus === 'Damaged' && <div className="text-[8px] font-normal mt-1">แจ้งซ่อม/เปลี่ยน</div>}
                </button>
              </div>
            </div>

            {/* 3. Tank Body */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">3. โครงสร้างถังภายนอกและสีผิวเคลือบ (Tank Body)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button type="button" onClick={() => setTankStatus('Normal')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${tankStatus === 'Normal' ? 'bg-green-700 text-white border-green-800 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  ปกติสมบูรณ์
                  {tankStatus === 'Normal' && <div className="text-[8px] font-normal mt-1">สภาพดี</div>}
                </button>
                <button type="button" onClick={() => setTankStatus('Rusted')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${tankStatus === 'Rusted' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  เกิดคราบสนิม
                  {tankStatus === 'Rusted' && <div className="text-[8px] font-normal mt-1">แจ้งทำความสะอาด</div>}
                </button>
                <button type="button" onClick={() => setTankStatus('Dented')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${tankStatus === 'Dented' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  ตัวถังมีรอยบุบ
                  {tankStatus === 'Dented' && <div className="text-[8px] font-normal mt-1">แจ้งตรวจสอบ</div>}
                </button>
                <button type="button" onClick={() => setTankStatus('Corroded')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${tankStatus === 'Corroded' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  สนิมผุกร่อน
                  {tankStatus === 'Corroded' && <div className="text-[8px] font-normal mt-1">แจ้งซ่อม/เปลี่ยน</div>}
                </button>
              </div>
            </div>

            {/* 4. Hose & Nozzle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">4. ท่อส่งสายยางและปลายหัวฉีดพ่น (Hose & Nozzle)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button type="button" onClick={() => setHoseStatus('Normal')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${hoseStatus === 'Normal' ? 'bg-green-700 text-white border-green-800 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  ปกติสมบูรณ์
                  {hoseStatus === 'Normal' && <div className="text-[8px] font-normal mt-1">พร้อมใช้งาน</div>}
                </button>
                <button type="button" onClick={() => setHoseStatus('Cracked')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${hoseStatus === 'Cracked' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  แห้งแตกกรอบ
                  {hoseStatus === 'Cracked' && <div className="text-[8px] font-normal mt-1">แจ้งเปลี่ยนสาย</div>}
                </button>
                <button type="button" onClick={() => setHoseStatus('Blocked')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${hoseStatus === 'Blocked' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  ท่อสายอุดตัน
                  {hoseStatus === 'Blocked' && <div className="text-[8px] font-normal mt-1">แจ้งทำความสะอาด</div>}
                </button>
                <button type="button" onClick={() => setHoseStatus('Damaged')} className={`py-2 px-1 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${hoseStatus === 'Damaged' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  ชำรุดเสียหาย
                  {hoseStatus === 'Damaged' && <div className="text-[8px] font-normal mt-1">แจ้งเปลี่ยนสาย</div>}
                </button>
              </div>
            </div>

            {/* 5. Weight status */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">5. ชั่งน้ำหนักสุทธิเครื่องดับสารเคมี (Weight Status)</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setWeightStatus('Normal')} className={`py-2.5 px-2 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${weightStatus === 'Normal' ? 'bg-green-700 text-white border-green-800 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  น้ำหนักได้เกณฑ์ (Normal)
                  {weightStatus === 'Normal' && <div className="text-[8px] font-normal mt-1">ปกติ</div>}
                </button>
                <button type="button" onClick={() => setWeightStatus('Low')} className={`py-2.5 px-2 text-xs font-bold rounded-sm border text-center transition-all cursor-pointer font-mono ${weightStatus === 'Low' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                  แรงดันทดต่ำ รั่วซึมพร่อง
                  {weightStatus === 'Low' && <div className="text-[8px] font-normal mt-1">แจ้งเติมน้ำยา</div>}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t-2 border-slate-200">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ข้อมูลลงนามตรวจรายงาน</h4>
            
            {/* Date & Inspector fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">วันที่ตรวจตราตรวจความปลอดภัย</label>
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-300 rounded-sm p-2.5 focus:outline-none focus:border-slate-900 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">วันหมดอายุของถัง (Expiry Date)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-300 rounded-sm p-2.5 focus:outline-none focus:border-slate-900 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">เจ้าหน้าที่ลงทะเบียนตรวจเช็ค</label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  placeholder="เช่น สมชาย มีสุข หรืออีเมลผู้เช็ค"
                  className="w-full bg-slate-50 text-slate-850 text-xs border border-slate-300 rounded-sm p-2.5 focus:outline-none focus:border-slate-900 font-sans"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <ImageUpload
                label="แนบรูปถ่ายถังดับเพลิงประกอบการตรวจสอบ"
                onImageSelected={setPhotoUrl}
                existingImage={photoUrl}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">หมายเหตุและเงื่อนไขเฉพาะหน้า (Remarks)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                placeholder="ระบุข้อบกพร่องเสริม หรือลักษณะสนิมที่ต้องขูดเกลา (ถ้ามี)"
                className="w-full bg-slate-50 text-slate-850 text-xs border border-slate-300 rounded-sm p-2.5 focus:outline-none focus:border-slate-900 font-sans"
              />
            </div>
          </div>

          {/* Computed overall status status banner */}
          <div className={`p-4 rounded border flex items-center justify-between ${
            overallStatus === 'Pass'
              ? 'bg-green-50 border-green-300 text-green-900'
              : 'bg-red-50 border-red-350 text-red-900'
          }`}>
            <div className="flex items-center gap-2.5">
              {overallStatus === 'Pass' ? (
                <ShieldCheck className="h-5 w-5 text-green-700" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
              )}
              <div className="text-[11px] flex flex-col justify-center">
                <span className="font-bold text-slate-900 uppercase">
                  สรุปเกณฑ์ความปลอดภัย: {overallStatus === 'Pass' ? 'ผ่านเกณฑ์ตรวจสอบ' : 'พบบกพร่องสะสม'}
                </span>
                <span className="text-[10px] text-slate-650 mt-0.5">
                  {overallStatus === 'Pass' ? 'ถังเคมีแห้ง/Co2 พร้อมใช้ระงับเหตุอัคคีภัยทันที' : 'จำเป็นต้องมีการเติมแก๊ส หรือซ่อมสลักท่อนำส่ง'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-sm font-mono border ${
              overallStatus === 'Pass' ? 'bg-green-700 text-white border-green-800' : 'bg-red-600 text-white border-red-700'
            }`}>
              {overallStatus === 'Pass' ? 'SECURE' : 'DEFECT'}
            </span>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t-2 border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded font-mono uppercase tracking-wide cursor-pointer"
          >
            ยกเลิก (CANCEL)
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-950 rounded border border-slate-950 transition-all flex items-center gap-2 shadow-sm font-mono uppercase tracking-wide cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            บันทึกรายงาน (SAVE AUDIT)
          </button>
        </div>
      </div>
    </div>
  );
}
