export interface Boat {
  id: string;
  name: string;
  totalExtinguishers: number;
}

export type ExtinguisherType = 'Dry Chemical' | 'CO2' | 'Clean Agent' | 'Foam';
export type PressureStatus = 'Normal' | 'Low' | 'High';
export type SafetyPinStatus = 'Normal' | 'Damaged' | 'Missing';
export type TankPhysicalStatus = 'Normal' | 'Rusted' | 'Dented' | 'Corroded';
export type HosePhysicalStatus = 'Normal' | 'Cracked' | 'Blocked' | 'Damaged';
export type WeightStatus = 'Normal' | 'Low';
export type OverallStatus = 'Pass' | 'Fail' | 'NeverInspected';

export interface FireExtinguisher {
  id: string; // e.g. "CP1-01"
  boatId: string;
  boatName: string;
  type: ExtinguisherType;
  size: string; // e.g., "10 lbs", "15 lbs"
  location: string; // installation location on the boat
  pressureStatus: PressureStatus;
  safetyPinStatus: SafetyPinStatus;
  tankStatus: TankPhysicalStatus;
  hoseStatus: HosePhysicalStatus;
  weightStatus: WeightStatus;
  lastInspectedDate: string | null; // e.g. "2026-06-20"
  lastInspector: string | null;
  overallStatus: OverallStatus;
  expiryDate: string; // "YYYY-MM-DD"
  remarks?: string;
  lastPhotoUrl?: string; // photo attached from the last inspection
}

export interface InspectionRecord {
  id: string;
  extinguisherId: string;
  boatId: string;
  boatName: string;
  location: string;
  type: ExtinguisherType;
  inspectionDate: string; // "YYYY-MM-DD"
  expiryDate: string; // "YYYY-MM-DD"
  inspectorName: string;
  pressureStatus: PressureStatus;
  safetyPinStatus: SafetyPinStatus;
  tankStatus: TankPhysicalStatus;
  hoseStatus: HosePhysicalStatus;
  weightStatus: WeightStatus;
  overallStatus: 'Pass' | 'Fail';
  remarks: string;
  photoUrl?: string; // Base64 or image url
  rectificationPhotoUrl?: string; // รูปภาพแนบสำหรับการแก้ไขแล้ว
}

export interface SheetsConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  webhookUrl?: string;
  lastSyncedAt: string | null;
}

// --- Medical Kits / First Aid Supplies ---
export type MedicalStationType = 'boat' | 'pier';

export type MedicalItemStatus = 'Normal' | 'LowStock' | 'Expired' | 'Missing' | 'Damaged';

export interface MedicalKitStation {
  id: string; // e.g., "MED-BOAT-1", "MED-PIER-5"
  stationType: MedicalStationType; // 'boat' | 'pier'
  targetId: string; // boat-id or pier-id
  targetName: string; // e.g., "CTB1", "ท่าสาทร"
  location: string; // e.g., "เคาน์เตอร์บริการบนเรือ", "ห้องจำหน่ายบัตรโดยสาร"
  
  // Inspection parameters (split medicines and supplies individually, matching requested 11 items)
  paracetamolStatus: MedicalItemStatus;
  paracetamolExpiry: string; // "YYYY-MM-DD"
  motionSicknessStatus: MedicalItemStatus;
  motionSicknessExpiry: string;
  ammoniaStatus: MedicalItemStatus;
  ammoniaExpiry: string;
  bandagesStatus: MedicalItemStatus;
  bandagesExpiry: string;
  antacidStatus: MedicalItemStatus;
  antacidExpiry: string;
  cottonBudsStatus: MedicalItemStatus;
  cottonBudsExpiry: string;
  betadineStatus: MedicalItemStatus;
  betadineExpiry: string;
  salineStatus: MedicalItemStatus;
  salineExpiry: string;
  gauzeStatus: MedicalItemStatus;
  gauzeExpiry: string;
  surgicalTapeStatus: MedicalItemStatus;
  surgicalTapeExpiry: string;
  cottonBallsStatus: MedicalItemStatus;
  cottonBallsExpiry: string;

  containerStatus: MedicalItemStatus; // สภาพตู้ยาเวชภัณฑ์ (แห้ง, ปิดสนิท, สะอาด)
  
  lastInspectedDate: string | null;
  lastInspector: string | null;
  overallStatus: OverallStatus;
  remarks?: string;
  lastPhotoUrl?: string;
}

export interface MedicalInspectionRecord {
  id: string;
  stationId: string;
  stationType: MedicalStationType;
  targetName: string;
  location: string;
  inspectionDate: string; // YYYY-MM-DD
  inspectorName: string;

  paracetamolStatus: MedicalItemStatus;
  paracetamolExpiry: string;
  motionSicknessStatus: MedicalItemStatus;
  motionSicknessExpiry: string;
  ammoniaStatus: MedicalItemStatus;
  ammoniaExpiry: string;
  bandagesStatus: MedicalItemStatus;
  bandagesExpiry: string;
  antacidStatus: MedicalItemStatus;
  antacidExpiry: string;
  cottonBudsStatus: MedicalItemStatus;
  cottonBudsExpiry: string;
  betadineStatus: MedicalItemStatus;
  betadineExpiry: string;
  salineStatus: MedicalItemStatus;
  salineExpiry: string;
  gauzeStatus: MedicalItemStatus;
  gauzeExpiry: string;
  surgicalTapeStatus: MedicalItemStatus;
  surgicalTapeExpiry: string;
  cottonBallsStatus: MedicalItemStatus;
  cottonBallsExpiry: string;

  containerStatus: MedicalItemStatus;

  overallStatus: 'Pass' | 'Fail';
  remarks: string;
  photoUrl?: string; // photo attached
  rectificationPhotoUrl?: string; // รูปภาพแนบสำหรับการแก้ไขแล้ว
}

// --- Vessel Crew & Boat Licenses ---
export type LicenseItemStatus = 'Normal' | 'NearExpiry' | 'Expired' | 'Missing';

export interface BoatLicenseState {
  boatId: string;
  boatName: string;
  
  // 1. Vessel License (ใบอนุญาตใช้เรือ)
  vesselLicenseNo: string;
  vesselLicenseIssue: string; // YYYY-MM-DD
  vesselLicenseExpiry: string; // YYYY-MM-DD
  vesselLicenseStatus: LicenseItemStatus;

  // 2. Helmsman License (ใบนายท้าย)
  helmsmanName: string;
  helmsmanLicenseNo: string;
  helmsmanLicenseIssue: string; // YYYY-MM-DD
  helmsmanLicenseExpiry: string; // YYYY-MM-DD
  helmsmanLicenseStatus: LicenseItemStatus;

  // 3. Engineer License (ใบช่างเครื่อง)
  engineerName: string;
  engineerLicenseNo: string;
  engineerLicenseIssue: string; // YYYY-MM-DD
  engineerLicenseExpiry: string; // YYYY-MM-DD
  engineerLicenseStatus: LicenseItemStatus;

  lastInspectedDate: string | null;
  lastInspector: string | null;
  overallStatus: OverallStatus;
  remarks?: string;
  vesselPhotoUrl?: string;
  helmsmanPhotoUrl?: string;
  engineerPhotoUrl?: string;
}

export interface LicenseInspectionRecord {
  id: string;
  boatId: string;
  boatName: string;
  inspectionDate: string; // YYYY-MM-DD
  inspectorName: string;

  vesselLicenseNo: string;
  vesselLicenseIssue: string;
  vesselLicenseExpiry: string;
  vesselLicenseStatus: LicenseItemStatus;

  helmsmanName: string;
  helmsmanLicenseNo: string;
  helmsmanLicenseIssue: string;
  helmsmanLicenseExpiry: string;
  helmsmanLicenseStatus: LicenseItemStatus;

  engineerName: string;
  engineerLicenseNo: string;
  engineerLicenseIssue: string;
  engineerLicenseExpiry: string;
  engineerLicenseStatus: LicenseItemStatus;

  overallStatus: 'Pass' | 'Fail';
  remarks: string;
  vesselPhotoUrl?: string;
  helmsmanPhotoUrl?: string;
  engineerPhotoUrl?: string;
  rectificationPhotoUrl?: string; // รูปภาพแนบสำหรับการแก้ไขแล้ว
}

// --- Boat Maintenance Logs ---
export type MaintenanceStatus = 'ดำเนินการแล้ว' | 'กำลังดำเนินการ' | 'รอคิว' | 'ยกเลิก';

export interface MaintenanceRecord {
  id: string;
  dateReported: string; // YYYY-MM-DD
  timeReported: string; // HH:MM
  boatId: string;
  boatName: string;
  type: string; // e.g., 'ตรวจสอบเรือ' | 'ส่งซ่อม' | 'อื่นๆ'
  details: string;
  actionTaken: string;
  responsiblePerson: string;
  status: MaintenanceStatus;
  photos: string[]; // array of base64 images or urls
  partRepaired?: string; // name of the repaired component/device, e.g. "เครื่องปรับอากาศ", "ไดชาร์จ", "ยอย", "แท่นเครื่อง"
  cost?: number; // maintenance cost in THB
}

// --- Boat Life Jackets (เสื้อชูชีพภายในเรือ) ---
export type LifeJacketItemStatus = 'Normal' | 'Damaged' | 'LowStock' | 'Missing';

export interface BoatSeatLifeJacket {
  id: string; // e.g., "1A"
  status: 'green' | 'red' | 'orange';
}

export interface BoatLifeJacketState {
  boatId: string;
  boatName: string;
  totalAdults: number; // จำนวนชูชีพผู้ใหญ่ที่ติดตั้ง
  totalKids: number; // จำนวนชูชีพเด็กที่ติดตั้ง
  adultsStatus: LifeJacketItemStatus;
  kidsStatus: LifeJacketItemStatus;
  whistleStatus: LifeJacketItemStatus; // สถานะนกหวีดประจำเสื้อ
  lightStatus: LifeJacketItemStatus; // สถานะไฟสัญญาณ/ไฟกะพริบประจำเสื้อ
  cabinetStatus: LifeJacketItemStatus; // สภาพสถานที่จัดเก็บ/กล่อง/ตู้
  lastInspectedDate: string | null;
  lastInspector: string | null;
  overallStatus: OverallStatus;
  remarks?: string;
  photoUrl?: string;
  seats?: BoatSeatLifeJacket[]; // แผนผังที่นั่งเสื้อชูชีพ
}

export interface LifeJacketInspectionRecord {
  id: string;
  boatId: string;
  boatName: string;
  inspectionDate: string; // YYYY-MM-DD
  inspectorName: string;
  totalAdults: number;
  totalKids: number;
  adultsStatus: LifeJacketItemStatus;
  kidsStatus: LifeJacketItemStatus;
  whistleStatus: LifeJacketItemStatus;
  lightStatus: LifeJacketItemStatus;
  cabinetStatus: LifeJacketItemStatus;
  overallStatus: 'Pass' | 'Fail';
  remarks: string;
  photoUrl?: string;
  seats?: BoatSeatLifeJacket[]; // แผนผังที่นั่งเสื้อชูชีพตอนตรวจสอบ
  rectificationPhotoUrl?: string; // รูปภาพแนบสำหรับการแก้ไขแล้ว
}




