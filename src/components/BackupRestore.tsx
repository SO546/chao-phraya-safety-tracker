import React, { useRef } from 'react';
import { Download, Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import { createBackup, downloadBackup, readBackupFile, validateBackup, extractBackupData, BackupData } from '../lib/backup';

interface BackupRestoreProps {
  data: any;
  onRestore: (data: any) => void;
}

export default function BackupRestore({ data, onRestore }: BackupRestoreProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState('');

  const handleBackup = () => {
    try {
      const backupData = createBackup(data);
      downloadBackup(backupData);
      setStatus('success');
      setMessage('บันทึกข้อมูลสำเร็จ');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage('บันทึกข้อมูลไม่สำเร็จ');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const backupData = await readBackupFile(file);
      
      if (!validateBackup(backupData)) {
        setStatus('error');
        setMessage('รูปแบบไฟล์ไม่ถูกต้อง');
        setTimeout(() => setStatus('idle'), 3000);
        return;
      }

      const restoredData = extractBackupData(backupData);
      onRestore(restoredData);
      
      setStatus('success');
      setMessage(`กู้คืนข้อมูลสำเร็จ (${backupData.timestamp})`);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage('ไม่สามารถกู้คืนข้อมูลได้');
      setTimeout(() => setStatus('idle'), 3000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <FileJson className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900">สำรองและกู้คืนข้อมูล (Backup & Restore)</h3>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleBackup}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Download className="h-4 w-4" />
          สำรองข้อมูล (Backup)
        </button>

        <button
          onClick={handleRestoreClick}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          <Upload className="h-4 w-4" />
          กู้คืนข้อมูล (Restore)
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {status !== 'idle' && (
        <div className={`mt-3 flex items-center gap-2 text-sm ${
          status === 'success' ? 'text-green-600' : 'text-red-600'
        }`}>
          {status === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        ข้อมูลจะถูกบันทึกเป็นไฟล์ JSON สามารถใช้กู้คืนข้อมูลเดิมได้
      </p>
    </div>
  );
}
