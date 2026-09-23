import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, UploadCloud, AlertCircle } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

interface CameraUploadProps {
  onImageSelected: (dataUrl: string, info: { width: number; height: number; originalSize: number; compressedSize: number }) => void;
  onError: (errorMessage: string) => void;
  isLoading?: boolean;
}

export const CameraUpload: React.FC<CameraUploadProps> = ({
  onImageSelected,
  onError,
  isLoading = false,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (isLoading || isProcessing) return;

    // Check size limit: max 20MB raw file before client resize
    if (file.size > 20 * 1024 * 1024) {
      onError('圖片檔案過大（超過 20MB），請選擇較小尺寸的圖片。');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await compressImage(file);
      onImageSelected(result.dataUrl, {
        width: result.width,
        height: result.height,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
      });
    } catch (err: any) {
      onError(err?.message || '圖片載入失敗，請確認檔案格式是否正確。');
    } finally {
      setIsProcessing(false);
      // Reset input value so same file can be selected again
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full">
      {/* Hidden inputs */}
      {/* Camera input with capture="environment" */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading || isProcessing}
      />

      {/* Standard file picker input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading || isProcessing}
      />

      {/* Main Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-5 transition-all text-center ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/60'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 mb-3 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-slate-800">
            拍照搜尋材料
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            支援手機直接拍攝後鏡頭，或由裝置相簿上傳織帶、鞋面、扣具等樣品
          </p>

          {/* Action buttons: Camera & Upload */}
          <div className="grid grid-cols-2 gap-3 w-full mt-4 max-w-sm">
            {/* Camera button */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isLoading || isProcessing}
              className="flex items-center justify-center space-x-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-medium text-sm rounded-xl shadow-sm transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>開啟相機</span>
            </button>

            {/* Gallery upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isProcessing}
              className="flex items-center justify-center space-x-2 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-medium text-sm rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 border border-slate-200"
            >
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>上傳照片</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 font-normal">
            支援 JPG, PNG, WEBP（自動最佳化至 1600px）
          </p>

          {isProcessing && (
            <div className="mt-3 flex items-center space-x-1.5 text-xs text-blue-600 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>正在壓縮並最佳化圖片尺寸...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
