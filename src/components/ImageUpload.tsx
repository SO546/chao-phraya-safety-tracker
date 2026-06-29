import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, Trash2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  onImageSelected: (base64Data: string | undefined) => void;
  existingImage?: string;
}

export default function ImageUpload({
  label,
  onImageSelected,
  existingImage,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(existingImage);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to downscale and process image using canvas
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์ประเภทรูปภาพเท่านั้น');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // High quality compact downscaling using canvas
        const maxDim = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to jpeg at 0.75 quality - ultra compact base64
          const base64 = canvas.toDataURL('image/jpeg', 0.75);
          setPreviewUrl(base64);
          onImageSelected(base64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(undefined);
    onImageSelected(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider font-sans">
        📷 {label}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-sm p-4 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center min-h-[140px] select-none ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/50'
            : previewUrl
            ? 'border-slate-300 bg-slate-50 hover:bg-slate-100/50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          capture="environment" // direct command for mobile camera capture
        />

        {previewUrl ? (
          <div className="relative w-full max-w-[200px] aspect-video sm:aspect-[4/3] rounded overflow-hidden border border-slate-200 group">
            <img
              src={previewUrl}
              alt="Uploaded Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Delete button overlay */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all transform hover:scale-110 shadow"
                title="ลบรูปถ่าย"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {/* Tag indicator on thumb */}
            <div className="absolute bottom-1 right-1 bg-slate-950/75 text-white px-1.5 py-0.5 rounded text-[8px] font-bold font-mono">
              COMPRESSED
            </div>
          </div>
        ) : (
          <div className="space-y-2 pointer-events-none text-slate-400 flex flex-col items-center">
            <div className="p-2.5 bg-slate-100 rounded-full text-slate-500">
              <Camera className="h-5 w-5" />
            </div>
            <div className="text-xs">
              <span className="font-extrabold text-blue-600">คลิกเพื่อถ่ายภาพ / อัปโหลด</span> หรือ ลากไฟล์วางที่นี่
            </div>
            <p className="text-[10px] text-slate-400 font-medium">รองรับไฟล์ภาพ JPEG, PNG จากมือถือและเว็บ</p>
          </div>
        )}
      </div>
    </div>
  );
}
