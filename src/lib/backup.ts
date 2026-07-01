/**
 * Backup & Restore Module
 * ใช้สำหรับบันทึกและดึงข้อมูลเป็นไฟล์ JSON
 */

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    extinguishers?: any[];
    boats?: any[];
    lifeJackets?: any[];
    licenses?: any[];
    medicalStations?: any[];
    [key: string]: any;
  };
}

/**
 * สร้างไฟล์ backup JSON จากข้อมูลทั้งหมด
 */
export function createBackup(data: any): BackupData {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: {
      ...data
    }
  };
}

/**
 * ดาวน์โหลดข้อมูลเป็นไฟล์ JSON
 */
export function downloadBackup(backupData: BackupData, filename?: string): void {
  const defaultFilename = `backup-${new Date().toISOString().split('T')[0]}.json`;
  const finalFilename = filename || defaultFilename;

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * อ่านไฟล์ JSON จากการอัปโหลด
 */
export function readBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const backupData = JSON.parse(content) as BackupData;
        resolve(backupData);
      } catch (error) {
        reject(new Error('ไม่สามารถอ่านไฟล์ JSON ได้: รูปแบบไฟล์ไม่ถูกต้อง'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * ตรวจสอบความถูกต้องของไฟล์ backup
 */
export function validateBackup(backupData: any): backupData is BackupData {
  return (
    backupData &&
    typeof backupData === 'object' &&
    backupData.version &&
    backupData.timestamp &&
    backupData.data &&
    typeof backupData.data === 'object'
  );
}

/**
 * ดึงข้อมูลจาก backup
 */
export function extractBackupData(backupData: BackupData): any {
  return backupData.data;
}
