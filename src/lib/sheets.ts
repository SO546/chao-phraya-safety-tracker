import { FireExtinguisher, InspectionRecord, MedicalKitStation, MedicalInspectionRecord, MaintenanceRecord } from '../types';

/**
 * Creates a new Google Spreadsheet to store safety and health inspection records.
 */
export async function createInspectionSpreadsheet(accessToken: string): Promise<{ id: string; url: string }> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'ระบบรายงานตรวจสอบความปลอดภัยกองเรือและท่าเรือ (Chao Phraya Fleet Safety)',
      },
      sheets: [
        {
          properties: {
            title: 'ถังดับเพลิงปัจจุบัน',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            title: 'ประวัติการตรวจเช็ค',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            title: 'ตู้ยาเวชภัณฑ์ปัจจุบัน',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            title: 'ประวัติการตรวจตู้ยา',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create Google Spreadsheet');
  }

  const data = await response.json();
  return {
    id: data.spreadsheetId,
    url: data.spreadsheetUrl,
  };
}

/**
 * Sets headers and styling for the Created sheets.
 */
export async function setupSpreadsheetHeaders(accessToken: string, spreadsheetId: string): Promise<void> {
  // 1. Verify what sheets exist in the spreadsheet
  let existingSheets: string[] = [];
  try {
    const metaResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      existingSheets = (metaData.sheets || []).map((s: any) => s.properties.title);
    }
  } catch (err) {
    console.error('Error fetching spreadsheet metadata:', err);
  }

  // 2. Add missing sheets if necessary (e.g. up-grading older spreadsheets)
  const addRequests: any[] = [];
  const requiredSheets = [
    { title: 'ถังดับเพลิงปัจจุบัน' },
    { title: 'ประวัติการตรวจเช็ค' },
    { title: 'ตู้ยาเวชภัณฑ์ปัจจุบัน' },
    { title: 'ประวัติการตรวจตู้ยา' },
    { title: 'บันทึกการซ่อมบำรุงเรือ' }
  ];

  requiredSheets.forEach(sheet => {
    if (!existingSheets.includes(sheet.title)) {
      addRequests.push({
        addSheet: {
          properties: {
            title: sheet.title,
            gridProperties: { frozenRowCount: 1 }
          }
        }
      });
    }
  });

  if (addRequests.length > 0) {
    try {
      const batchResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests: addRequests })
      });
      if (!batchResponse.ok) {
        const errDetails = await batchResponse.json().catch(() => ({}));
        console.error('BatchUpdate failed to create missing sheets:', errDetails);
      }
    } catch (err) {
      console.error('Error executing sheet auto-migrations:', err);
    }
  }

  const extHeaders = [
    'รหัสถัง (ID)',
    'ชื่อเรือ (Boat Name)',
    'ชนิด (Type)',
    'ขนาด (Size)',
    'ตำแหน่งติดตั้ง (Location)',
    'สภาพเกจวัดความดัน (Pressure Gauge)',
    'สภาพสลักและซีล (Safety Pin)',
    'สภาพตัวถัง (Tank Body)',
    'สภาพสายและหัวฉีด (Hose)',
    'น้ำหนักถัง (Weight)',
    'วันหมดอายุ (Expiry Date)',
    'วันที่ตรวจล่าสุด (Last Inspected)',
    'ผู้ตรวจล่าสุด (Last Inspector)',
    'สถานะภาพรวม (Overall Status)',
    'หมายเหตุ (Remarks)',
  ];

  const historyHeaders = [
    'รหัสบันทึก (Record ID)',
    'รหัสถัง (ID)',
    'ชื่อเรือ (Boat Name)',
    'ตำแหน่งติดตั้ง (Location)',
    'ชนิด (Type)',
    'วันที่ตรวจ (Inspection Date)',
    'ผู้ตรวจ (Inspector)',
    'เกจวัดความดัน (Pressure Gauge)',
    'สลักและซีล (Safety Pin)',
    'ตัวถัง (Tank Body)',
    'สายและหัวฉีด (Hose)',
    'น้ำหนักถัง (Weight)',
    'สถานะภาพรวม (Overall Status)',
    'หมายเหตุ (Remarks)',
  ];

  const medHeaders = [
    'รหัสตู้ยา (ID)',
    'ประเภท (Type)',
    'ชื่อสถานที่ (Name)',
    'ตำแหน่งที่จัดวาง (Location)',
    'ยาแก้ปวดพาราเซตามอล (Paracetamol Status)',
    'วันหมดอายุยาพาราฯ (Paracetamol Expiry)',
    'ยาแก้เมาเรือ (Motion Sickness Status)',
    'วันหมดอายุยาแก้เมาเรือ (Motion Sickness Expiry)',
    'แอมโมเนียหอม (Ammonia Status)',
    'วันหมดอายุแอมโมเนียหอม (Ammonia Expiry)',
    'พลาสเตอร์ปิดแผล (Bandages Status)',
    'วันหมดอายุพลาสเตอร์ปิดแผล (Bandages Expiry)',
    'ยาธาตุน้ำขาว/ยาลดกรด (Antacid Status)',
    'วันหมดอายุยาลดกรด (Antacid Expiry)',
    'สำลีก้าน (Cotton Buds Status)',
    'วันหมดอายุสำลีก้าน (Cotton Buds Expiry)',
    'ยาเบตาดีนล้างแผล (Betadine Status)',
    'วันหมดอายุยาเบตาดีนล้างแผล (Betadine Expiry)',
    'น้ำเกลือล้างแผล (Saline Status)',
    'วันหมดอายุน้ำเกลือล้างแผล (Saline Expiry)',
    'ผ้าก๊อซปิดแผล (Gauze Status)',
    'วันหมดอายุผ้าก๊อซปิดแผล (Gauze Expiry)',
    'เทปแต่งแผล (Surgical Tape Status)',
    'วันหมดอายุเทปแต่งแผล (Surgical Tape Expiry)',
    'สำลีก้อนสำหรับทาแผล,ซับเลือด (Cotton Balls Status)',
    'วันหมดอายุสำลีก้อนสำหรับทาแผล (Cotton Balls Expiry)',
    'ตัวตู้/กล่องเก็บ (Container Status)',
    'วันที่ตรวจล่าสุด (Last Inspected)',
    'ผู้ตรวจล่าสุด (Last Inspector)',
    'สถานะภาพรวม (Overall Status)',
    'หมายเหตุ (Remarks)',
  ];

  const medHistoryHeaders = [
    'รหัสบันทึก (Record ID)',
    'รหัสตู้ยา (Station ID)',
    'ประเภท (Type)',
    'ชื่อสถานที่ (Name)',
    'ตำแหน่งที่จัดวาง (Location)',
    'วันที่ตรวจ (Inspection Date)',
    'ผู้ตรวจ (Inspector)',
    'ยาแก้ปวดพาราเซตามอล (Paracetamol Status)',
    'วันหมดอายุยาพาราฯ (Paracetamol Expiry)',
    'ยาแก้เมาเรือ (Motion Sickness Status)',
    'วันหมดอายุยาแก้เมาเรือ (Motion Sickness Expiry)',
    'แอมโมเนียหอม (Ammonia Status)',
    'วันหมดอายุแอมโมเนียหอม (Ammonia Expiry)',
    'พลาสเตอร์ปิดแผล (Bandages Status)',
    'วันหมดอายุพลาสเตอร์ปิดแผล (Bandages Expiry)',
    'ยาธาตุน้ำขาว/ยาลดกรด (Antacid Status)',
    'วันหมดอายุยาลดกรด (Antacid Expiry)',
    'สำลีก้าน (Cotton Buds Status)',
    'วันหมดอายุสำลีก้าน (Cotton Buds Expiry)',
    'ยาเบตาดีนล้างแผล (Betadine Status)',
    'วันหมดอายุยาเบตาดีนล้างแผล (Betadine Expiry)',
    'น้ำเกลือล้างแผล (Saline Status)',
    'วันหมดอายุน้ำเกลือล้างแผล (Saline Expiry)',
    'ผ้าก๊อซปิดแผล (Gauze Status)',
    'วันหมดอายุผ้าก๊อซปิดแผล (Gauze Expiry)',
    'เทปแต่งแผล (Surgical Tape Status)',
    'วันหมดอายุเทปแต่งแผล (Surgical Tape Expiry)',
    'สำลีก้อนสำหรับทาแผล,ซับเลือด (Cotton Balls Status)',
    'วันหมดอายุสำลีก้อนสำหรับทาแผล (Cotton Balls Expiry)',
    'ตัวตู้/กล่องเก็บ (Container Status)',
    'สถานะภาพรวม (Overall Status)',
    'หมายเหตุ (Remarks)',
  ];

  const maintenanceHeaders = [
    'รหัสบันทึก (Record ID)',
    'วันที่แจ้ง (Date Reported)',
    'เวลาที่แจ้ง (Time Reported)',
    'ชื่อเรือ (Boat Name)',
    'ประเภท (Type)',
    'ชิ้นส่วน / อุปกรณ์ที่ซ่อม (Equipment Part)',
    'รายละเอียด/สิ่งที่พบ (Details/Findings)',
    'ผลการดำเนินการ (Action Taken/Progress)',
    'ผู้รับผิดชอบ (Responsible Person)',
    'สถานะ (Status)',
  ];

  // We write the headers
  await updateSheetValues(accessToken, spreadsheetId, 'ถังดับเพลิงปัจจุบัน!A1:O1', [extHeaders]);
  await updateSheetValues(accessToken, spreadsheetId, 'ประวัติการตรวจเช็ค!A1:N1', [historyHeaders]);
  await updateSheetValues(accessToken, spreadsheetId, 'ตู้ยาเวชภัณฑ์ปัจจุบัน!A1:AJ1', [medHeaders]);
  await updateSheetValues(accessToken, spreadsheetId, 'ประวัติการตรวจตู้ยา!A1:AK1', [medHistoryHeaders]);
  await updateSheetValues(accessToken, spreadsheetId, 'บันทึกการซ่อมบำรุงเรือ!A1:J1', [maintenanceHeaders]);
}

/**
 * Updates a specific range in Google Sheets.
 */
async function updateSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<void> {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to update sheet range ${range}`);
  }
}

/**
 * Syncs the entire current status of fire extinguishers to Google Sheets
 */
export async function syncCurrentExtinguishersToSheets(
  accessToken: string,
  spreadsheetId: string,
  extinguishers: FireExtinguisher[]
): Promise<void> {
  // Translate status to Thai for display in Sheets
  const mapType = (t: string) => {
    if (t === 'Dry Chemical') return 'ถังเคมีแห้ง (Dry Chemical)';
    if (t === 'CO2') return 'คาร์บอนไดออกไซด์ (CO2)';
    if (t === 'Clean Agent') return 'สารเคมีสะอาด (Clean Agent)';
    if (t === 'Foam') return 'ถังโฟม (Foam)';
    return t;
  };

  const mapStatus = (val: string) => {
    if (val === 'Normal') return 'ปกติ (Normal)';
    if (val === 'Low') return 'ต่ำกว่าเกณฑ์ (Low)';
    if (val === 'High') return 'สูงกว่าเกณฑ์ (High)';
    if (val === 'Damaged') return 'ชำรุด (Damaged)';
    if (val === 'Missing') return 'สูญหาย/ไม่มี (Missing)';
    if (val === 'Rusted') return 'เกิดสนิม (Rusted)';
    if (val === 'Dented') return 'ตัวถังบุบ (Dented)';
    if (val === 'Corroded') return 'ผุกร่อน (Corroded)';
    if (val === 'Cracked') return 'สายแตก/ร้าว (Cracked)';
    if (val === 'Blocked') return 'อุดตัน (Blocked)';
    return val;
  };

  const mapOverall = (val: string) => {
    if (val === 'Pass') return 'ผ่านเกณฑ์ (Pass)';
    if (val === 'Fail') return 'ไม่ผ่านเกณฑ์ (Fail)';
    return 'ยังไม่ได้ตรวจเช็ค (Never Inspected)';
  };

  const rows = extinguishers.map((e) => [
    e.id,
    e.boatName,
    mapType(e.type),
    e.size,
    e.location,
    mapStatus(e.pressureStatus),
    mapStatus(e.safetyPinStatus),
    mapStatus(e.tankStatus),
    mapStatus(e.hoseStatus),
    mapStatus(e.weightStatus),
    e.expiryDate,
    e.lastInspectedDate || 'ยังไม่ได้ระบุ',
    e.lastInspector || 'ยังไม่ได้ระบุ',
    mapOverall(e.overallStatus),
    e.remarks || '-',
  ]);

  // First, clear the existing data under the header (rows 2 to 100) before writing new data
  await clearSheetRange(accessToken, spreadsheetId, 'ถังดับเพลิงปัจจุบัน!A2:O100');

  // Then write the new data
  await updateSheetValues(accessToken, spreadsheetId, 'ถังดับเพลิงปัจจุบัน!A2:O' + (rows.length + 1), rows);
}

/**
 * Appends multiple inspection history records to the history sheet
 */
export async function appendInspectionsToHistorySheet(
  accessToken: string,
  spreadsheetId: string,
  records: InspectionRecord[]
): Promise<void> {
  const mapType = (t: string) => {
    if (t === 'Dry Chemical') return 'ถังเคมีแห้ง (Dry Chemical)';
    if (t === 'CO2') return 'คาร์บอนไดออกไซด์ (CO2)';
    if (t === 'Clean Agent') return 'สารเคมีสะอาด (Clean Agent)';
    if (t === 'Foam') return 'ถังโฟม (Foam)';
    return t;
  };

  const mapStatus = (val: string) => {
    if (val === 'Normal') return 'ปกติ (Normal)';
    if (val === 'Low') return 'ต่ำกว่าเกณฑ์ (Low)';
    if (val === 'High') return 'สูงกว่าเกณฑ์ (High)';
    if (val === 'Damaged') return 'ชำรุด (Damaged)';
    if (val === 'Missing') return 'สูญหาย/ไม่มี (Missing)';
    if (val === 'Rusted') return 'เกิดสนิม (Rusted)';
    if (val === 'Dented') return 'ตัวถังบุบ (Dented)';
    if (val === 'Corroded') return 'ผุกร่อน (Corroded)';
    if (val === 'Cracked') return 'สายแตก/ร้าว (Cracked)';
    if (val === 'Blocked') return 'อุดตัน (Blocked)';
    return val;
  };

  const mapOverall = (val: string) => {
    if (val === 'Pass') return 'ผ่านเกณฑ์ (Pass)';
    if (val === 'Fail') return 'ไม่ผ่านเกณฑ์ (Fail)';
    return val;
  };

  const rows = records.map((r) => [
    r.id,
    r.extinguisherId,
    r.boatName,
    r.location,
    mapType(r.type),
    r.inspectionDate,
    r.inspectorName,
    mapStatus(r.pressureStatus),
    mapStatus(r.safetyPinStatus),
    mapStatus(r.tankStatus),
    mapStatus(r.hoseStatus),
    mapStatus(r.weightStatus),
    mapOverall(r.overallStatus),
    r.remarks || '-',
  ]);

  if (rows.length === 0) return;

  const range = 'ประวัติการตรวจเช็ค!A2';
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to append records to Google Sheets');
  }
}

/**
 * Syncs the entire current status of medical kit stations to Google Sheets
 */
export async function syncCurrentMedicalKitsToSheets(
  accessToken: string,
  spreadsheetId: string,
  stations: MedicalKitStation[]
): Promise<void> {
  const mapStatus = (val: string) => {
    if (val === 'Normal') return 'ปกติ (Normal)';
    if (val === 'LowStock') return 'ยาพร่อง (LowStock)';
    if (val === 'Expired') return 'ยาหมดอายุ (Expired)';
    if (val === 'Missing') return 'สูญหาย (Missing)';
    if (val === 'Damaged') return 'ชำรุด (Damaged)';
    return val;
  };

  const mapOverall = (val: string) => {
    if (val === 'Pass') return 'ผ่านเกณฑ์ (Pass)';
    if (val === 'Fail') return 'ไม่ผ่านเกณฑ์ (Fail)';
    return 'ยังไม่ได้ตรวจเช็ค (Never Inspected)';
  };

  const rows = stations.map((s) => [
    s.id,
    s.stationType === 'boat' ? 'เรือท่องเที่ยว (Boat)' : 'ท่าเทียบเรือ (Pier)',
    s.targetName,
    s.location,
    mapStatus(s.paracetamolStatus),
    s.paracetamolExpiry || '-',
    mapStatus(s.motionSicknessStatus),
    s.motionSicknessExpiry || '-',
    mapStatus(s.ammoniaStatus),
    s.ammoniaExpiry || '-',
    mapStatus(s.bandagesStatus),
    s.bandagesExpiry || '-',
    mapStatus(s.antacidStatus),
    s.antacidExpiry || '-',
    mapStatus(s.cottonBudsStatus),
    s.cottonBudsExpiry || '-',
    mapStatus(s.betadineStatus),
    s.betadineExpiry || '-',
    mapStatus(s.salineStatus),
    s.salineExpiry || '-',
    mapStatus(s.gauzeStatus),
    s.gauzeExpiry || '-',
    mapStatus(s.surgicalTapeStatus),
    s.surgicalTapeExpiry || '-',
    mapStatus(s.cottonBallsStatus),
    s.cottonBallsExpiry || '-',
    mapStatus(s.containerStatus),
    s.lastInspectedDate || 'ยังไม่ได้ระบุ',
    s.lastInspector || 'ยังไม่ได้ระบุ',
    mapOverall(s.overallStatus),
    s.remarks || '-',
  ]);

  // First, clear the existing data under the header (rows 2 to 250, columns A to AP) before writing new data
  await clearSheetRange(accessToken, spreadsheetId, 'ตู้ยาเวชภัณฑ์ปัจจุบัน!A2:AP250');

  // Then write the new data
  await updateSheetValues(accessToken, spreadsheetId, 'ตู้ยาเวชภัณฑ์ปัจจุบัน!A2:AP' + (rows.length + 1), rows);
}

/**
 * Appends multiple medical kit inspections to the medical history sheet
 */
export async function appendMedicalInspectionsToHistorySheet(
  accessToken: string,
  spreadsheetId: string,
  records: MedicalInspectionRecord[]
): Promise<void> {
  const mapStatus = (val: string) => {
    if (val === 'Normal') return 'ปกติ (Normal)';
    if (val === 'LowStock') return 'ยาพร่อง (LowStock)';
    if (val === 'Expired') return 'ยาหมดอายุ (Expired)';
    if (val === 'Missing') return 'สูญหาย (Missing)';
    if (val === 'Damaged') return 'ชำรุด (Damaged)';
    return val;
  };

  const mapOverall = (val: string) => {
    if (val === 'Pass') return 'ผ่านเกณฑ์ (Pass)';
    if (val === 'Fail') return 'ไม่ผ่านเกณฑ์ (Fail)';
    return val;
  };

  const rows = records.map((r) => [
    r.id,
    r.stationId,
    r.stationType === 'boat' ? 'เรือท่องเที่ยว (Boat)' : 'ท่าเทียบเรือ (Pier)',
    r.targetName,
    r.location,
    r.inspectionDate,
    r.inspectorName,
    mapStatus(r.paracetamolStatus),
    r.paracetamolExpiry || '-',
    mapStatus(r.motionSicknessStatus),
    r.motionSicknessExpiry || '-',
    mapStatus(r.ammoniaStatus),
    r.ammoniaExpiry || '-',
    mapStatus(r.bandagesStatus),
    r.bandagesExpiry || '-',
    mapStatus(r.antacidStatus),
    r.antacidExpiry || '-',
    mapStatus(r.cottonBudsStatus),
    r.cottonBudsExpiry || '-',
    mapStatus(r.betadineStatus),
    r.betadineExpiry || '-',
    mapStatus(r.salineStatus),
    r.salineExpiry || '-',
    mapStatus(r.gauzeStatus),
    r.gauzeExpiry || '-',
    mapStatus(r.surgicalTapeStatus),
    r.surgicalTapeExpiry || '-',
    mapStatus(r.cottonBallsStatus),
    r.cottonBallsExpiry || '-',
    mapStatus(r.containerStatus),
    mapOverall(r.overallStatus),
    r.remarks || '-',
  ]);

  if (rows.length === 0) return;

  const range = 'ประวัติการตรวจตู้ยา!A2';
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to append medical records to Google Sheets');
  }
}

/**
 * Clears values in a sheet range
 */
async function clearSheetRange(accessToken: string, spreadsheetId: string, range: string): Promise<void> {
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Fetches all data from spreadsheet to restore local state if the user connects an existing sheet.
 */
export async function fetchSpreadsheetData(
  accessToken: string,
  spreadsheetId: string
): Promise<{ extinguishers: FireExtinguisher[]; history: InspectionRecord[] } | null> {
  try {
    const extResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('ถังดับเพลิงปัจจุบัน!A2:O100')}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const histResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('ประวัติการตรวจเช็ค!A2:N1000')}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!extResponse.ok || !histResponse.ok) {
      return null;
    }

    const extData = await extResponse.json();
    const histData = await histResponse.json();

    const extinguishers: FireExtinguisher[] = [];
    const history: InspectionRecord[] = [];

    const parseType = (t: string): any => {
      if (t.includes('เคมีแห้ง')) return 'Dry Chemical';
      if (t.includes('คาร์บอน')) return 'CO2';
      if (t.includes('สะอาด')) return 'Clean Agent';
      if (t.includes('โฟม')) return 'Foam';
      return 'Dry Chemical';
    };

    const parseStatus = (val: string): any => {
      if (val.includes('ปกติ') || val.includes('Normal')) return 'Normal';
      if (val.includes('ต่ำ') || val.includes('Low')) return 'Low';
      if (val.includes('สูง') || val.includes('High')) return 'High';
      if (val.includes('ชำรุด') || val.includes('Damaged')) return 'Damaged';
      if (val.includes('สูญหาย') || val.includes('Missing')) return 'Missing';
      if (val.includes('สนิม') || val.includes('Rusted')) return 'Rusted';
      if (val.includes('บุบ') || val.includes('Dented')) return 'Dented';
      if (val.includes('ผุกร่อน') || val.includes('Corroded')) return 'Corroded';
      if (val.includes('แตก') || val.includes('Cracked')) return 'Cracked';
      if (val.includes('อุดตัน') || val.includes('Blocked')) return 'Blocked';
      return 'Normal';
    };

    const parseOverall = (val: string): any => {
      if (val.includes('ผ่านเกณฑ์') || val.includes('Pass')) return 'Pass';
      if (val.includes('ไม่ผ่านเกณฑ์') || val.includes('Fail')) return 'Fail';
      return 'NeverInspected';
    };

    // Helper to extract boat ID from boat name
    const getBoatId = (name: string): string => {
      const upperName = name.trim().toUpperCase();
      if (upperName.includes('CTB1')) return 'boat-1';
      if (upperName.includes('CTB2')) return 'boat-2';
      if (upperName.includes('CTB3')) return 'boat-3';
      if (upperName.includes('R1')) return 'boat-4';
      if (upperName.includes('R2')) return 'boat-5';
      if (upperName.includes('R3')) return 'boat-6';
      if (upperName.includes('R4')) return 'boat-7';
      
      // Fallbacks for older names
      if (upperName.includes('เจ้าพระยา 1')) return 'boat-1';
      if (upperName.includes('เจ้าพระยา 2')) return 'boat-2';
      if (upperName.includes('เจ้าพระยา 3')) return 'boat-3';
      if (upperName.includes('เจ้าพระยา 4')) return 'boat-4';
      if (upperName.includes('เจ้าพระยา 5')) return 'boat-5';
      if (upperName.includes('เจ้าพระยา 6')) return 'boat-6';
      if (upperName.includes('เจ้าพระยา 7')) return 'boat-7';

      const match = name.match(/\d+/);
      return match ? `boat-${match[0]}` : 'boat-1';
    };

    if (extData.values && extData.values.length > 0) {
      extData.values.forEach((row: any[]) => {
        if (!row[0]) return; // Skip empty
        extinguishers.push({
          id: row[0],
          boatId: getBoatId(row[1] || 'CTB1'),
          boatName: row[1] || 'CTB1',
          type: parseType(row[2] || ''),
          size: row[3] || '10 lbs',
          location: row[4] || 'ห้องเครื่องยนต์',
          pressureStatus: parseStatus(row[5] || ''),
          safetyPinStatus: parseStatus(row[6] || ''),
          tankStatus: parseStatus(row[7] || ''),
          hoseStatus: parseStatus(row[8] || ''),
          weightStatus: parseStatus(row[9] || ''),
          expiryDate: row[10] || '2028-12-31',
          lastInspectedDate: row[11] === 'ยังไม่ได้ระบุ' ? null : row[11] || null,
          lastInspector: row[12] === 'ยังไม่ได้ระบุ' ? null : row[12] || null,
          overallStatus: parseOverall(row[13] || ''),
          remarks: row[14] === '-' ? '' : row[14] || '',
        });
      });
    }

    if (histData.values && histData.values.length > 0) {
      histData.values.forEach((row: any[]) => {
        if (!row[0]) return;
        history.push({
          id: row[0],
          extinguisherId: row[1],
          boatId: getBoatId(row[2]),
          boatName: row[2],
          location: row[3],
          type: parseType(row[4]),
          inspectionDate: row[5],
          expiryDate: row[5] || '2028-12-31',
          inspectorName: row[6],
          pressureStatus: parseStatus(row[7]),
          safetyPinStatus: parseStatus(row[8]),
          tankStatus: parseStatus(row[9]),
          hoseStatus: parseStatus(row[10]),
          weightStatus: parseStatus(row[11]),
          overallStatus: row[12].includes('ไม่ผ่านเกณฑ์') ? 'Fail' : 'Pass',
          remarks: row[13] === '-' ? '' : row[13] || '',
        });
      });
    }

    return { extinguishers, history };
  } catch (err) {
    console.error('Error fetching/parsing spreadsheet data:', err);
    return null;
  }
}

/**
 * Syncs the entire maintenance records to Google Sheets
 */
export async function syncMaintenanceToSheets(
  accessToken: string,
  spreadsheetId: string,
  records: MaintenanceRecord[]
): Promise<void> {
  const rows = records.map((r) => [
    r.id,
    r.dateReported,
    r.timeReported,
    r.boatName,
    r.type,
    r.partRepaired || 'ทั่วไป (ตรวจเช็ค)',
    r.details,
    r.actionTaken,
    r.responsiblePerson,
    r.status,
  ]);

  // First, clear existing data under the header (rows 2 to 1000)
  await clearSheetRange(accessToken, spreadsheetId, 'บันทึกการซ่อมบำรุงเรือ!A2:J1000');

  if (rows.length === 0) return;

  // Then write the new data
  await updateSheetValues(accessToken, spreadsheetId, 'บันทึกการซ่อมบำรุงเรือ!A2:J' + (rows.length + 1), rows);
}

