/**
 * สคริปต์สำหรับย้ายข้อมูลไปยัง Google Apps Script (Google Sheets)
 * 
 * วิธีใช้งาน:
 * 1. ไปที่ https://script.google.com/ แล้วสร้างโครงการใหม่ (New Project)
 * 2. ลบโค้ดเดิมทั้งหมด และคัดลอกโค้ดทั้งหมดในไฟล์นี้ไปวาง
 * 3. กด "Deploy" (การทำให้ใช้งานได้) -> "New deployment" (การทำให้ใช้งานได้รายการใหม่)
 * 4. เลือกประเภท (Select type): "Web app" (เว็บแอป)
 * 5. สิทธิ์การเข้าถึง (Who has access): เลือก "Anyone" (ทุกคน)
 * 6. กด Deploy แล้วคัดลอก URL ที่ได้ กลับมาใส่ในระบบ (หรือใช้ Postman / Webhook เพื่อส่งข้อมูลเข้าไป)
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    
    // สร้างหรือใช้ Spreadsheet ปัจจุบัน
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.create('Chao Phraya Tourist Boat - Master Data Backup');
    }
    
    var data = payload.data;
    
    // 1. ถังดับเพลิง
    if (data.fleet_extinguishers) writeSheet(ss, '🧯 ข้อมูลถังดับเพลิง', data.fleet_extinguishers);
    if (data.extinguisher_history) writeSheet(ss, 'ประวัติถังดับเพลิง', data.extinguisher_history);
    
    // 2. ยาเวชภัณฑ์
    if (data.medical_stations) writeSheet(ss, '🏥 ข้อมูลยาเวชภัณฑ์', data.medical_stations);
    if (data.medical_history) writeSheet(ss, 'ประวัติยาเวชภัณฑ์', data.medical_history);
    
    // 3. เสื้อชูชีพ
    if (data.life_jackets) writeSheet(ss, '🧡 ข้อมูลเสื้อชูชีพ', data.life_jackets);
    if (data.life_jacket_history) writeSheet(ss, 'ประวัติเสื้อชูชีพ', data.life_jacket_history);
    
    // 4. ใบอนุญาตใช้เรือ
    if (data.vessel_licenses) writeSheet(ss, '🚢 ใบอนุญาตใช้เรือ', data.vessel_licenses);
    if (data.license_history) writeSheet(ss, 'ประวัติใบอนุญาต', data.license_history);
    
    // 5. ซ่อมบำรุง
    if (data.maintenance_history) writeSheet(ss, '🔧 ประวัติซ่อมบำรุง', data.maintenance_history);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'ย้ายข้อมูลสำเร็จเรียบร้อย',
      spreadsheetUrl: ss.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function writeSheet(ss, sheetName, dataArray) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  if (!dataArray || dataArray.length === 0) return;
  
  var keys = Object.keys(dataArray[0]);
  var rows = dataArray.map(function(obj) {
    return keys.map(function(key) {
      var val = obj[key];
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val);
      }
      return val;
    });
  });
  
  sheet.getRange(1, 1, 1, keys.length).setValues([keys]).setFontWeight('bold').setBackground('#f3f4f6');
  sheet.getRange(2, 1, rows.length, keys.length).setValues(rows);
  
  // ปรับความกว้างคอลัมน์อัตโนมัติ
  for (var i = 1; i <= keys.length; i++) {
    sheet.autoResizeColumn(i);
  }
}
