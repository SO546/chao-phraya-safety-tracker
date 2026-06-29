import { Boat, FireExtinguisher, MedicalKitStation, BoatLicenseState, BoatLifeJacketState } from '../types';

export const BOATS: Boat[] = [
  { id: 'boat-1', name: 'CTB1', totalExtinguishers: 5 },
  { id: 'boat-2', name: 'CTB2', totalExtinguishers: 5 },
  { id: 'boat-3', name: 'CTB3', totalExtinguishers: 5 },
  { id: 'boat-4', name: 'R1', totalExtinguishers: 4 },
  { id: 'boat-5', name: 'R2', totalExtinguishers: 4 },
  { id: 'boat-6', name: 'R3', totalExtinguishers: 4 },
  { id: 'boat-7', name: 'R4', totalExtinguishers: 4 },
];

export interface Pier {
  id: string;
  name: string;
  locationSpec: string;
}

export const PIERS: Pier[] = [
  { id: 'pier-7', name: 'ท่าพระอาทิตย์ (Phra Arthit)', locationSpec: 'เคาน์เตอร์รับตั๋วบริเวณทางออกสู่ถนนใหญ่' },
  { id: 'pier-8', name: 'ท่าศิริราช-พรานนก (Prannok)', locationSpec: 'ตู้นายท่าดูแลรักษาความปลอดภัยท่าพรานนก' },
  { id: 'pier-9', name: 'ท่ามหาราช (Maharaj)', locationSpec: 'เคาน์เตอร์จำหน่ายบัตรประจำท่ามหาราช' },
  { id: 'pier-6', name: 'ท่าช้าง (Tha Chang)', locationSpec: 'โต๊ะเจ้าหน้าที่ประสานงานเขตท่าเรือหลัก' },
  { id: 'pier-5', name: 'ท่าเตียน (Tha Tien)', locationSpec: 'จุดแนะแนวนักท่องเที่ยวและจำหน่ายบัตร' },
  { id: 'pier-4', name: 'ท่าวัดอรุณ (Wat Arun)', locationSpec: 'ซุ้มจองตั๋วเรือด่วนใกล้ทางเข้าหลัก' },
  { id: 'pier-10', name: 'ท่าราชินี (Rajinee)', locationSpec: 'ห้องบริการข้อมูลผู้โดยสารสถานีท่าราชินี' },
  { id: 'pier-3', name: 'ท่าราชวงศ์ (Ratchawong)', locationSpec: 'สำนักงานพนักงานควบคุมเรือประจำท่า' },
  { id: 'pier-2', name: 'ท่าไอคอนสยาม (ICONSIAM)', locationSpec: 'เคาน์เตอร์จำหน่ายตั๋วเรือฝั่งไอคอนสยาม' },
  { id: 'pier-1', name: 'ท่าสาทร (Sathorn)', locationSpec: 'ห้องปฐมพยาบาลหลัก / ศูนย์บริการลูกค้า' },
  { id: 'pier-11', name: 'ท่าเอเชียทีค (Asiatique)', locationSpec: 'ตู้จำหน่ายตั๋วเรือท่องเที่ยวบริเวณเอเชียทีค' },
];

export const generateInitialMedicalStations = (): MedicalKitStation[] => {
  const stations: MedicalKitStation[] = [];

  // Seed Boat Medical Stations (7 boats)
  BOATS.forEach((boat, idx) => {
    let paracetamolStatus: any = 'Normal';
    let paracetamolExpiry = '2027-12-31';
    let motionSicknessStatus: any = 'Normal';
    let motionSicknessExpiry = '2027-10-15';
    let ammoniaStatus: any = 'Normal';
    let ammoniaExpiry = '2027-08-30';
    let bandagesStatus: any = 'Normal';
    let bandagesExpiry = '2028-05-01';
    let antacidStatus: any = 'Normal';
    let antacidExpiry = '2027-11-15';
    let cottonBudsStatus: any = 'Normal';
    let cottonBudsExpiry = '2028-02-10';
    let betadineStatus: any = 'Normal';
    let betadineExpiry = '2027-11-20';
    let salineStatus: any = 'Normal';
    let salineExpiry = '2028-01-15';
    let gauzeStatus: any = 'Normal';
    let gauzeExpiry = '2028-06-30';
    let surgicalTapeStatus: any = 'Normal';
    let surgicalTapeExpiry = '2028-04-20';
    let cottonBallsStatus: any = 'Normal';
    let cottonBallsExpiry = '2028-03-15';

    let containerStatus: any = 'Normal';
    let overallStatus: any = 'NeverInspected';
    let lastInspectedDate: string | null = null;
    let lastInspector: string | null = null;
    let remarks = '';

    // Seed some inspections
    if (idx === 0) { // CTB1
      lastInspectedDate = '2026-06-20';
      lastInspector = 'สมชาย นาวาดี';
      overallStatus = 'Pass';
    } else if (idx === 1) { // CTB2
      lastInspectedDate = '2026-06-19';
      lastInspector = 'วิชัย รักเรือ';
      paracetamolStatus = 'LowStock';
      paracetamolExpiry = '2026-12-31';
      overallStatus = 'Fail';
      remarks = 'พาราเซตามอลหมดคลังชั่วคราว ดำเนินการจัดเก็บและรอเบิกชิ้นถัดไป';
    }

    stations.push({
      id: `MED-BOAT-${boat.id.replace('boat-', '')}`,
      stationType: 'boat',
      targetId: boat.id,
      targetName: boat.name,
      location: 'เคาน์เตอร์บริการผู้โดยสาร / ชั้นล่าง',
      paracetamolStatus,
      paracetamolExpiry,
      motionSicknessStatus,
      motionSicknessExpiry,
      ammoniaStatus,
      ammoniaExpiry,
      bandagesStatus,
      bandagesExpiry,
      antacidStatus,
      antacidExpiry,
      cottonBudsStatus,
      cottonBudsExpiry,
      betadineStatus,
      betadineExpiry,
      salineStatus,
      salineExpiry,
      gauzeStatus,
      gauzeExpiry,
      surgicalTapeStatus,
      surgicalTapeExpiry,
      cottonBallsStatus,
      cottonBallsExpiry,
      containerStatus,
      lastInspectedDate,
      lastInspector,
      overallStatus,
      remarks,
    });
  });

  // Seed Pier Medical Stations (11 piers)
  PIERS.forEach((pier) => {
    let paracetamolStatus: any = 'Normal';
    let paracetamolExpiry = '2027-12-31';
    let motionSicknessStatus: any = 'Normal';
    let motionSicknessExpiry = '2027-10-15';
    let ammoniaStatus: any = 'Normal';
    let ammoniaExpiry = '2027-08-30';
    let bandagesStatus: any = 'Normal';
    let bandagesExpiry = '2028-05-01';
    let antacidStatus: any = 'Normal';
    let antacidExpiry = '2027-11-15';
    let cottonBudsStatus: any = 'Normal';
    let cottonBudsExpiry = '2028-02-10';
    let betadineStatus: any = 'Normal';
    let betadineExpiry = '2027-11-20';
    let salineStatus: any = 'Normal';
    let salineExpiry = '2028-01-15';
    let gauzeStatus: any = 'Normal';
    let gauzeExpiry = '2028-06-30';
    let surgicalTapeStatus: any = 'Normal';
    let surgicalTapeExpiry = '2028-04-20';
    let cottonBallsStatus: any = 'Normal';
    let cottonBallsExpiry = '2028-03-15';

    let containerStatus: any = 'Normal';
    let overallStatus: any = 'NeverInspected';
    let lastInspectedDate: string | null = null;
    let lastInspector: string | null = null;
    let remarks = '';

    // Seed some inspections based on pier ID
    if (pier.id === 'pier-1') { // Sathorn
      lastInspectedDate = '2026-06-22';
      lastInspector = 'อนุรักษ์ ล้อมแก้ว';
      overallStatus = 'Pass';
    } else if (pier.id === 'pier-5') { // Tha Tien
      lastInspectedDate = '2026-06-21';
      lastInspector = 'พิมลพา สุขสะอาด';
      betadineStatus = 'Expired';
      betadineExpiry = '2026-05-20'; // Expired in the past!
      overallStatus = 'Fail';
      remarks = 'ยาเบตาดีนหมดอายุรอบเดือนที่ผ่านมา เตรียมเปลี่ยนขวดใหม่';
    }

    stations.push({
      id: `MED-PIER-${pier.id.replace('pier-', '')}`,
      stationType: 'pier',
      targetId: pier.id,
      targetName: pier.name,
      location: pier.locationSpec,
      paracetamolStatus,
      paracetamolExpiry,
      motionSicknessStatus,
      motionSicknessExpiry,
      ammoniaStatus,
      ammoniaExpiry,
      bandagesStatus,
      bandagesExpiry,
      antacidStatus,
      antacidExpiry,
      cottonBudsStatus,
      cottonBudsExpiry,
      betadineStatus,
      betadineExpiry,
      salineStatus,
      salineExpiry,
      gauzeStatus,
      gauzeExpiry,
      surgicalTapeStatus,
      surgicalTapeExpiry,
      cottonBallsStatus,
      cottonBallsExpiry,
      containerStatus,
      lastInspectedDate,
      lastInspector,
      overallStatus,
      remarks,
    });
  });

  return stations;
};

export const generateInitialExtinguishers = (): FireExtinguisher[] => {
  const list: FireExtinguisher[] = [];

  BOATS.forEach((boat, index) => {
    const isFive = boat.totalExtinguishers === 5;
    const locations = isFive
      ? [
          { loc: 'หน้าทางเข้า-ออกฝั่งซ้าย', type: 'Dry Chemical', size: '15 lbs' },
          { loc: 'หน้าห้องนายท้ายฝั่งซ้าย', type: 'Dry Chemical', size: '15 lbs' },
          { loc: 'หน้าห้องนายท้ายฝั่งขวา', type: 'Dry Chemical', size: '15 lbs' },
          { loc: 'หน้าทางเข้า-ออกฝั่งขวา', type: 'Dry Chemical', size: '15 lbs' },
          { loc: 'ในห้องนายท้าย', type: 'CO2', size: '10 lbs' },
        ]
      : [
          { loc: 'หน้าทางเข้า-ออกฝั่งซ้าย', type: 'Dry Chemical', size: '15 lbs' },
          { loc: 'หน้าห้องนายท้ายฝั่งซ้าย', type: 'Dry Chemical', size: '15 lbs' },
          { loc: 'หน้าห้องนายท้ายฝั่งขวา', type: 'Dry Chemical', size: '15 lbs' },
          { loc: 'หน้าทางเข้า-ออกฝั่งขวา', type: 'Dry Chemical', size: '15 lbs' },
        ];

    locations.forEach((item, lIdx) => {
      const extId = `${boat.name}-ถังที่ ${lIdx + 1}`;
      
      // Let's seed some realistic demo data:
      // Most are normal, some are never inspected, 1 or 2 have some issues.
      let pressureStatus: any = 'Normal';
      let safetyPinStatus: any = 'Normal';
      let tankStatus: any = 'Normal';
      let hoseStatus: any = 'Normal';
      let weightStatus: any = 'Normal';
      let overallStatus: any = 'NeverInspected';
      let lastInspectedDate: string | null = null;
      let lastInspector: string | null = null;
      let remarks = '';

      // Boat 1 has some completed normal inspections
      if (boat.id === 'boat-1') {
        lastInspectedDate = '2026-06-15';
        lastInspector = 'สมชาย นาวาดี';
        overallStatus = 'Pass';
      }
      
      // Boat 2 is inspected, but one extinguisher has low pressure!
      if (boat.id === 'boat-2') {
        if (lIdx === 3) {
          // Engine room extinguisher
          pressureStatus = 'Low';
          overallStatus = 'Fail';
          lastInspectedDate = '2026-06-18';
          lastInspector = 'วิชัย รักเรือ';
          remarks = 'เกจวัดแรงดันตก ต้องรีบชาร์จใหม่หรือเปลี่ยนถังสำรอง';
        } else {
          lastInspectedDate = '2026-06-18';
          lastInspector = 'วิชัย รักเรือ';
          overallStatus = 'Pass';
        }
      }

      // Boat 4 is partly inspected
      if (boat.id === 'boat-4' && lIdx < 2) {
        lastInspectedDate = '2026-06-20';
        lastInspector = 'สมพงษ์ ทะเลไทย';
        overallStatus = 'Pass';
      }

      // Create extinguisher object
      list.push({
        id: extId,
        boatId: boat.id,
        boatName: boat.name,
        type: item.type as any,
        size: item.size,
        location: item.loc,
        pressureStatus,
        safetyPinStatus,
        tankStatus,
        hoseStatus,
        weightStatus,
        lastInspectedDate,
        lastInspector,
        overallStatus,
        expiryDate: '2029-06-30', // expiry roughly 3 years from now
        remarks,
      });
    });
  });

  return list;
};

export const generateInitialBoatLicenses = (): BoatLicenseState[] => {
  const licenses: BoatLicenseState[] = [];
  
  BOATS.forEach((boat, idx) => {
    let vesselLicenseNo = `V-69-${1000 + idx}`;
    let vesselLicenseIssue = '2025-01-10';
    let vesselLicenseExpiry = '2027-01-10';
    let vesselLicenseStatus: any = 'Normal';

    let helmsmanName = idx === 0 ? 'นายกิตติพงษ์ ทองดี' : idx === 1 ? 'นายอาทิตย์ นาวากิจ' : idx === 2 ? 'นายสมเกียรติ ยิ้มหวาน' : 'นายสมศักดิ์ รักทะเล';
    let helmsmanLicenseNo = `C-67-${3000 + idx}`;
    let helmsmanLicenseIssue = '2024-06-15';
    let helmsmanLicenseExpiry = '2029-06-15';
    let helmsmanLicenseStatus: any = 'Normal';

    let engineerName = idx === 0 ? 'นายประสิทธิ์ พละงาน' : idx === 1 ? 'นายวิบูลย์ ชลนิธิ' : idx === 2 ? 'นายธวัช ม้าแก้ว' : 'นายอำนาจ พึ่งกลอง';
    let engineerLicenseNo = `M-68-${5000 + idx}`;
    let engineerLicenseIssue = '2025-03-20';
    let engineerLicenseExpiry = '2030-03-20';
    let engineerLicenseStatus: any = 'Normal';

    let overallStatus: any = 'NeverInspected';
    let lastInspectedDate: string | null = null;
    let lastInspector: string | null = null;
    let remarks = '';

    // Seed some specific statuses to demonstrate the dashboard features
    if (idx === 0) { // CTB1 - Perfect
      lastInspectedDate = '2026-06-20';
      lastInspector = 'สมชาย นาวาดี';
      overallStatus = 'Pass';
    } else if (idx === 1) { // CTB2 - Captain License expires soon (30 days from T-date)
      helmsmanLicenseExpiry = '2026-07-15'; // Very closely expired!
      helmsmanLicenseStatus = 'NearExpiry';
      lastInspectedDate = '2026-06-18';
      lastInspector = 'วิชัย รักเรือ';
      overallStatus = 'Pass'; // Still pass but has pending warning
      remarks = 'ใบนายท้ายเรือหมดอายุในวันที่ 15 ก.ค. 2569 เจ้าหน้าที่แจ้งดำเนินแจ้งสิทธิ์ต่ออายุเรียบร้อยแล้ว';
    } else if (idx === 2) { // CTB3 - Vessel expired in the past!
      vesselLicenseExpiry = '2026-06-10'; // Already expired
      vesselLicenseStatus = 'Expired';
      lastInspectedDate = '2026-06-21';
      lastInspector = 'อนุรักษ์ ล้อมแก้ว';
      overallStatus = 'Fail';
      remarks = 'ใบอนุญาตใช้เรือหมดอายุตั้งแต่วันที่ 10 มิถุนายน อยู่ระหว่างขั้นตอนต่ออายุทางกฎหมาย';
    } else if (idx === 3) { // R1 - Mechanic file is missing
      engineerName = 'รอนายช่างคนใหม่เข้างาน';
      engineerLicenseNo = '-';
      engineerLicenseStatus = 'Missing';
      lastInspectedDate = '2026-06-22';
      lastInspector = 'อรรถพล กองกลาง';
      overallStatus = 'Fail';
      remarks = 'ขาดแคลนช่างเครื่องถาวร ได้จัดให้นายช่างจากเรือ R2 หมุนเวียนมาตรวจและสแตนด์บายชั่วคราว';
    }

    licenses.push({
      boatId: boat.id,
      boatName: boat.name,
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
      lastInspectedDate,
      lastInspector,
      overallStatus,
      remarks,
    });
  });

  return licenses;
};

export const generateInitialMaintenanceRecords = () => {
  return [
    {
      id: 'MAINREC-001',
      dateReported: '2026-05-07',
      timeReported: '15:38',
      boatId: 'boat-5',
      boatName: 'R2', // Riva Express 2
      type: 'ตรวจสอบเรือ',
      details: 'แอร์ห้องนายท้ายไม่เย็น',
      actionTaken: 'Riva express 2 (R2) เรือเข้ามาจอดเช็คเครื่องปรับอากาศห้องนายท้าย ผู้แทนเหมาตรวจเช็คแล้ว ส่งมอบเรือแล้ว เข้าอู่ ตรวจเช็ค ส่งมอบ 7/5/69',
      responsiblePerson: 'อู่เรือ (ช่างแอร์)',
      status: 'ดำเนินการแล้ว' as const,
      photos: ['https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/cabin_ac_maintenance.jpg'],
      partRepaired: 'เครื่องปรับอากาศ'
    },
    {
      id: 'MAINREC-002',
      dateReported: '2026-05-08',
      timeReported: '16:24',
      boatId: 'boat-2',
      boatName: 'CTB 2',
      type: 'ตรวจสอบเรือ',
      details: 'ห้องน้ำใช้งานไม่ได้ 2 ห้อง, ไดชาร์จและยอยซ้ายชำรุด',
      actionTaken: 'CTB 2 ตรวจเช็คเรือประจำวันและแก้ไขห้องน้ำใช้ไม่ได้ 2 ห้อง ช่างกลจักรซ่อมทำแล้ว และเปลี่ยนไดชาร์จไดสตาร์ทและเปลี่ยนยอยข้างซ้าย ตัวท้ายข้างซ้าย เบิกของจากพัสดุ ส่งมอบเรือแล้ว เข้าอู่ - ซ่อมทำ - ส่งมอบ 8/5/69',
      responsiblePerson: 'อู่เรือ (ช่างกล)',
      status: 'ดำเนินการแล้ว' as const,
      photos: [
        'https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/boat_engine_repair.jpg', 
        'https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/marine_alternator_coupling.jpg'
      ],
      partRepaired: 'ไดชาร์จ / ไดสตาร์ท'
    },
    {
      id: 'MAINREC-003',
      dateReported: '2026-05-08',
      timeReported: '16:29',
      boatId: 'boat-1',
      boatName: 'CTB 1',
      type: 'ส่งซ่อม',
      details: 'ตั้งศูนย์แท่นเครื่องและเปลี่ยนยอยเครื่องขวา',
      actionTaken: 'CTB1 เรือเข้ามาเพื่อแก้แท่นเครื่อง ช่างกลจักรเทียบศูนย์ แก้ไขแท่นเครื่อง เปลี่ยนยอยส้มฟ้าเครื่องข้างขวา เปลี่ยนน็อตเบลล่าห์ตัวท้ายแบบปรับได้ เครื่องขวา ตัวท้ายข้างซ้าย เบิกของจากพัสดุ ส่งมอบเรือแล้ว เข้าอู่ - ซ่อมทำ - ส่งมอบ 8/5/69',
      responsiblePerson: 'อู่เรือ (ช่างกล)',
      status: 'ดำเนินการแล้ว' as const,
      photos: [
        'https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/marine_alternator_coupling.jpg', 
        'https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/boat_engine_repair.jpg'
      ],
      partRepaired: 'ยอยและแท่นเครื่อง'
    },
    {
      id: 'MAINREC-004',
      dateReported: '2026-05-09',
      timeReported: '08:36',
      boatId: 'boat-1',
      boatName: 'CTB 1',
      type: 'ตรวจสอบเรือ',
      details: 'ตรวจเช็คเรือประจำวันตามปกติ',
      actionTaken: 'CTB 1 ตรวจเช็คเรือประจำวัน เรียบร้อยดี',
      responsiblePerson: 'ช่างประจำเรือ',
      status: 'ดำเนินการแล้ว' as const,
      photos: [],
      partRepaired: 'ทั่วไป (ตรวจเช็ค)'
    },
    {
      id: 'MAINREC-005',
      dateReported: '2026-05-09',
      timeReported: '08:57',
      boatId: 'boat-1',
      boatName: 'CTB 1',
      type: 'ส่งซ่อม',
      details: 'น้ำรั่วเข้าห้องนายท้าย CTB 1',
      actionTaken: 'CTB 1 หลังคารั่ว ช่างตัวเรือซ่อมทำ แก้ไขเสร็จแล้ว 9-5-69',
      responsiblePerson: 'อู่เรือ (ช่างตัวเรือ)',
      status: 'ดำเนินการแล้ว' as const,
      photos: ['https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/shipyard_hull_work.jpg'],
      partRepaired: 'ตัวเรือ / โครงสร้างหลังคา'
    },
    {
      id: 'MAINREC-006',
      dateReported: '2026-05-11',
      timeReported: '08:59',
      boatId: 'boat-2',
      boatName: 'CTB 2',
      type: 'ตรวจสอบเรือ',
      details: 'ตรวจเช็คความปลอดภัยเรือประจำวัน',
      actionTaken: 'CTB 2 ตรวจเช็คเรือประจำวัน ระบบทั่วไปพร้อมใช้งาน',
      responsiblePerson: 'ช่างประจำเรือ',
      status: 'ดำเนินการแล้ว' as const,
      photos: [],
      partRepaired: 'ทั่วไป (ตรวจเช็ค)'
    },
    {
      id: 'MAINREC-007',
      dateReported: '2026-05-11',
      timeReported: '09:25',
      boatId: 'boat-3',
      boatName: 'CTB 3',
      type: 'ส่งซ่อม',
      details: 'ยอยข้างขวาเรือ CTB 3 ชำรุด',
      actionTaken: 'CTB 3 เรือเข้ามาเพื่อเปลี่ยนยอยเกียร์เหล็ก เครื่องข้างขวา ช่างกลจักรกำลังซ่อมทำ เข้าอู่ 11/5/69',
      responsiblePerson: 'อู่เรือ',
      status: 'กำลังดำเนินการ' as const,
      photos: ['https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/boat_engine_repair.jpg'],
      partRepaired: 'ยอยและแท่นเครื่อง'
    },
    {
      id: 'MAINREC-008',
      dateReported: '2026-04-12',
      timeReported: '10:15',
      boatId: 'boat-1',
      boatName: 'CTB 1',
      type: 'ส่งซ่อม',
      details: 'มอเตอร์แอร์คอยล์ร้อนชำรุดเสียงดัง',
      actionTaken: 'ช่างแอร์ดำเนินการเปลี่ยนมอเตอร์คอยล์ร้อนยี่ห้อ Carrier ใหม่เสร็จสิ้น แอร์ทำงานได้ปกติเย็นฉ่ำ',
      responsiblePerson: 'อู่เรือ (ช่างแอร์)',
      status: 'ดำเนินการแล้ว' as const,
      photos: ['https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/cabin_ac_maintenance.jpg'],
      partRepaired: 'เครื่องปรับอากาศ'
    },
    {
      id: 'MAINREC-009',
      dateReported: '2026-04-18',
      timeReported: '14:30',
      boatId: 'boat-4',
      boatName: 'CTB 4',
      type: 'ส่งซ่อม',
      details: 'หัวฉีดเครื่องยนต์ฝั่งขวาตัน มีควันดำ',
      actionTaken: 'ส่งล้างหัวฉีดเครื่องยนต์ และดำเนินการประกอบกลับ เปลี่ยนแหวนทองแดงหัวฉีด ทดสอบวิ่งควันเป็นปกติ',
      responsiblePerson: 'อู่เรือ (ช่างกล)',
      status: 'ดำเนินการแล้ว' as const,
      photos: ['https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/boat_engine_repair.jpg'],
      partRepaired: 'เครื่องยนต์'
    },
    {
      id: 'MAINREC-010',
      dateReported: '2026-06-02',
      timeReported: '09:00',
      boatId: 'boat-2',
      boatName: 'CTB 2',
      type: 'ส่งซ่อม',
      details: 'เปลี่ยนลูกปืนปั๊มน้ำระบายความร้อนแอร์',
      actionTaken: 'ช่างไฟฟ้าถอดปั๊มน้ำระบายความร้อนออกมาเปลี่ยนตลับลูกปืนเบอร์ 6204 สองตลับและซีลกันน้ำ ประกอบกลับและทดลองรัน น้ำไหลดี ปกติ',
      responsiblePerson: 'อู่เรือ (ช่างไฟฟ้า)',
      status: 'ดำเนินการแล้ว' as const,
      photos: ['https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/marine_alternator_coupling.jpg'],
      partRepaired: 'ระบบสุขาภิบาล / ปั๊มน้ำ'
    },
    {
      id: 'MAINREC-011',
      dateReported: '2026-06-14',
      timeReported: '11:20',
      boatId: 'boat-5',
      boatName: 'R2',
      type: 'ส่งซ่อม',
      details: 'สีทากันเพรียงบริเวณกราบเรือหลุดร่อน',
      actionTaken: 'เรือจอดแห้ง ขัดลอกสีเก่า ทารองพื้นกันสนิม และพ่นสีกันเพรียงกราบเรือใหม่ 2 รอบเสร็จเรียบร้อย',
      responsiblePerson: 'อู่เรือ (ช่างสี)',
      status: 'ดำเนินการแล้ว' as const,
      photos: ['https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/shipyard_hull_work.jpg'],
      partRepaired: 'ตัวเรือ / โครงสร้างหลังคา'
    },
    {
      id: 'MAINREC-012',
      dateReported: '2026-06-20',
      timeReported: '16:45',
      boatId: 'boat-1',
      boatName: 'CTB 1',
      type: 'ส่งซ่อม',
      details: 'ไดชาร์จเครื่องยนต์ซ้ายไม่ชาร์จไฟเข้าแบตเตอรี่',
      actionTaken: 'ช่างตรวจสอบพบไดโอดและคัทเอาท์ในตัวชำรุด เปลี่ยนไดชาร์จสำรองขนาด 24V 85A เข้าแทนที่ ชาร์จไฟได้ปกติ 27.4V',
      responsiblePerson: 'ช่างประจำเรือ',
      status: 'ดำเนินการแล้ว' as const,
      photos: ['https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/marine_alternator_coupling.jpg'],
      partRepaired: 'ไดชาร์จ / ไดสตาร์ท'
    },
    {
      id: 'MAINREC-013',
      dateReported: '2026-06-23',
      timeReported: '10:30',
      boatId: 'boat-3',
      boatName: 'CTB 3',
      type: 'ตรวจสอบเรือ',
      details: 'แอร์ห้องโดยสารกลางเรือไม่เย็น มีน้ำหยดลงพื้น',
      actionTaken: 'กำลังดำเนินการเป่าล้างท่อน้ำทิ้งและล้างคอยล์เย็น ล้างแผ่นกรองอากาศ ช่างแอร์กำลังดำเนินงานซ่อมทำ',
      responsiblePerson: 'อู่เรือ (ช่างแอร์)',
      status: 'กำลังดำเนินการ' as const,
      photos: ['https://ais-pre-mo3pir7chh5cim3ds2rnna-198914928716.asia-east1.run.app/cabin_ac_maintenance.jpg'],
      partRepaired: 'เครื่องปรับอากาศ'
    }
  ];
};

export const generateInitialLifeJackets = (): BoatLifeJacketState[] => {
  const jackets: BoatLifeJacketState[] = [];

  BOATS.forEach((boat, idx) => {
    let totalAdults = idx < 3 ? 80 : 60;
    let totalKids = idx < 3 ? 15 : 10;
    
    let adultsStatus: any = 'Normal';
    let kidsStatus: any = 'Normal';
    let whistleStatus: any = 'Normal';
    let lightStatus: any = 'Normal';
    let cabinetStatus: any = 'Normal';
    
    let lastInspectedDate: string | null = null;
    let lastInspector: string | null = null;
    let overallStatus: any = 'NeverInspected';
    let remarks = '';

    if (idx === 0) { // CTB1
      lastInspectedDate = '2026-06-20';
      lastInspector = 'สมชาย นาวาดี';
      overallStatus = 'Pass';
    } else if (idx === 1) { // CTB2 - Whistles missing
      lastInspectedDate = '2026-06-19';
      lastInspector = 'วิชัย รักเรือ';
      whistleStatus = 'Missing';
      overallStatus = 'Fail';
      remarks = 'พบนกหวีดประจำเสื้อชูชีพสูญหายไป 3 ตัว ดำเนินการเตรียมเบิกเพื่อติดตั้งทดแทน';
    } else if (idx === 2) { // CTB3
      lastInspectedDate = '2026-06-21';
      lastInspector = 'อนุรักษ์ ล้อมแก้ว';
      overallStatus = 'Pass';
    } else if (idx === 3) { // R1 - Kid jackets low stock
      lastInspectedDate = '2026-06-22';
      lastInspector = 'อรรถพล กองกลาง';
      kidsStatus = 'LowStock';
      overallStatus = 'Fail';
      remarks = 'เสื้อชูชีพสำหรับเด็กบนเรือมีไม่เพียงพอต่อปริมาณผู้โดยสารเด็กขั้นต่ำ (ต้องการเพิ่มอีก 5 ตัว)';
    } else if (idx === 4) { // R2
      lastInspectedDate = '2026-06-23';
      lastInspector = 'พิมลพา สุขสะอาด';
      overallStatus = 'Pass';
    } else if (idx === 6) { // R4 - Lights damaged
      lastInspectedDate = '2026-06-22';
      lastInspector = 'สมชาย นาวาดี';
      lightStatus = 'Damaged';
      overallStatus = 'Fail';
      remarks = 'พบไฟกะพริบแจ้งตำแหน่งชูชีพถ่านเสื่อมสภาพ/ชำรุด 2 ชิ้น รอการซ่อมบำรุงหรือเปลี่ยนใหม่';
    }

    // Generate beautiful 6-column dynamic seat layouts for passenger life jackets
    const seats: { id: string; status: 'green' | 'red' | 'orange' }[] = [];
    const isCTB = boat.name.toUpperCase().startsWith('CTB');
    const maxRows = isCTB ? 22 : 21;
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    for (let r = 1; r <= maxRows; r++) {
      cols.forEach(c => {
        // Skip last two columns of the 22nd row on CTB boats to get exactly 130 seats (21 * 6 + 4 = 130)
        if (isCTB && r === 22 && (c === 'E' || c === 'F')) {
          return;
        }
        
        let status: 'green' | 'red' | 'orange' = 'green';
        if (idx === 1) { // CTB2
          if (r === 3 && c === 'A') status = 'red';
          if (r === 5 && c === 'C') status = 'orange';
          if (r === 8 && c === 'D') status = 'red';
        } else if (idx === 3) { // R1
          if (r === 2 && c === 'B') status = 'red';
          if (r === 4 && c === 'D') status = 'red';
          if (r === 7 && c === 'A') status = 'orange';
        } else if (idx === 6) { // R4
          if (r === 1 && c === 'C') status = 'orange';
          if (r === 5 && c === 'B') status = 'orange';
          if (r === 9 && c === 'D') status = 'orange';
        }
        seats.push({ id: `${r}${c}`, status });
      });
    }

    jackets.push({
      boatId: boat.id,
      boatName: boat.name,
      totalAdults,
      totalKids,
      adultsStatus,
      kidsStatus,
      whistleStatus,
      lightStatus,
      cabinetStatus,
      lastInspectedDate,
      lastInspector,
      overallStatus,
      remarks,
      seats,
    });
  });

  return jackets;
};



