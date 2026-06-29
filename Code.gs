/**
 * ระบบรายงานตรวจสอบความปลอดภัยเรือ (Chao Phraya Safety Tracker)
 * พัฒนาสำหรับรันบน Google Apps Script (Web App) โดยเฉพาะ
 */

function doGet() {
  var template;
  try {
    // 1. ลองโหลดจากไฟล์ชื่อ 'Index' (ชื่อมาตรฐานที่แนะนำใน Google Apps Script)
    template = HtmlService.createTemplateFromFile('Index');
  } catch (e) {
    try {
      // 2. หากไม่มี ให้ลองโหลดจากไฟล์ชื่อ 'appscript-index' (ตามชื่อไฟล์ที่บิวด์จากระบบ)
      template = HtmlService.createTemplateFromFile('appscript-index');
    } catch (err) {
      // 3. หากไม่พบไฟล์ใดๆ เลย จะแสดงข้อแนะนำการติดตั้งและแก้ไขปัญหาแบบละเอียดและสวยงาม
      return HtmlService.createHtmlOutput(
        "<div style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; padding: 40px; text-align: center; color: #1e293b; background: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center;'>" +
        "  <div style='background: #ffffff; padding: 40px; border-radius: 16px; max-width: 650px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; text-align: left;'>" +
        "    <div style='display: flex; align-items: center; margin-bottom: 24px; color: #e11d48;'>" +
        "      <svg style='width: 36px; height: 36px; margin-right: 12px;' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'></path></svg>" +
        "      <h2 style='margin: 0; font-size: 22px; font-weight: 700;'>ยังไม่ได้ติดตั้งซอร์สโค้ดของแอปพลิเคชัน (HTML)</h2>" +
        "    </div>" +
        "    <p style='font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px;'>" +
        "      ไม่พบไฟล์ <b>Index.html</b> หรือ <b>appscript-index.html</b> ในโครงการ Google Apps Script ของคุณ กรุณาทำการตั้งค่าและติดตั้งโค้ดตามขั้นตอนด้านล่างนี้:" +
        "    </p>" +
        "    <div style='background: #f1f5f9; padding: 24px; border-radius: 12px; font-size: 14px; color: #334155; border: 1px solid #cbd5e1; line-height: 1.6;'>" +
        "      <b style='color: #0f172a; font-size: 15px; display: block; margin-bottom: 12px;'>ขั้นตอนการตั้งค่าให้ใช้งานได้ทันที:</b>" +
        "      <ol style='margin: 0; padding-left: 20px;'>" +
        "        <li style='margin-bottom: 10px;'>ในหน้าต่างตัวแก้ไข Google Apps Script (แถบด้านซ้าย) ให้กดที่ปุ่ม <b>+ (บวก)</b> ถัดจากคำว่า <b>ไฟล์ (Files)</b></li>" +
        "        <li style='margin-bottom: 10px;'>เลือกสร้างไฟล์ประเภท <b>HTML</b></li>" +
        "        <li style='margin-bottom: 10px;'>พิมพ์ชื่อไฟล์ว่า <code style='background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: bold;'>Index</code> (ไม่ต้องใส่ .html เพราะระบบจะเติมให้เอง)</li>" +
        "        <li style='margin-bottom: 10px;'>คัดลอกโค้ดทั้งหมดที่อยู่ในไฟล์ <b>appscript-index.txt</b> หรือ <b>appscript-index.html</b> จากบิวด์ของระบบไปวางแทนที่เนื้อหาเดิมทั้งหมด</li>" +
        "        <li style='margin-bottom: 10px;'>กดปุ่ม <b>บันทึกโครงการ (Save Project)</b> (รูปแผ่นดิสก์ด้านบน)</li>" +
        "        <li>กดสร้างการเปิดใช้งานแอปใหม่ (New Deployment) หรือกดทดสอบเพื่อเปิดใช้งานอีกครั้ง</li>" +
        "      </ol>" +
        "    </div>" +
        "    <div style='margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;'>" +
        "      รายละเอียดทางเทคนิค: " + e.toString() + " | " + err.toString() + "" +
        "    </div>" +
        "  </div>" +
        "</div>"
      )
      .setTitle('ระบบรายงานตรวจสอบความปลอดภัยเรือ (ข้อแนะนำการติดตั้ง)')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    }
  }

  // ส่งผ่าน Access Token และ Email ของผู้ใช้ปัจจุบันเพื่อทำ SSO Auto-Login เข้าสู่ชีตโดยอัตโนมัติ
  template.accessToken = ScriptApp.getOAuthToken();
  template.userEmail = Session.getActiveUser().getEmail() || "user@chaophrayatouristboat.com";

  return template.evaluate()
    .setTitle('ระบบรายงานตรวจสอบความปลอดภัยเรือ (Chao Phraya Safety Tracker)')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ฟังก์ชันสำหรับรับข้อมูลจาก Web App หากมีการส่งข้อมูลแบบ POST
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) ss = SpreadsheetApp.create('Chao Phraya Tourist Boat - Master Data Backup');
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'เชื่อมต่อและดำเนินการสำเร็จเรียบร้อย'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
