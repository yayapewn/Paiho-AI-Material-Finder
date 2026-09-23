import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

interface ImagePreviewProps {
  imageUrl: string;
  onRetake: (newDataUrl: string) => void;
  onDelete: () => void;
  info?: { width: number; height: number; originalSize: number; compressedSize: number } | null;
  disabled?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  onRetake,
  onDelete,
  info,
  disabled = false,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await compressImage(file);
      onRetake(res.dataUrl);
    } catch (err) {
      console.error(err);
    }
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
        disabled={disabled}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
        disabled={disabled}
      />

      {/* Image display container */}
      <div className="relative aspect-video sm:aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden group">
        <img
          src={imageUrl}
          alt="上傳的材料預覽"
          className="w-full h-full object-contain"
        />

        {/* Status overlay badge */}
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center space-x-1 border border-white/10 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>材料影像已就緒</span>
        </div>

        {info && (
          <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-white/10">
            {info.width}×{info.height} · {formatSize(info.compressedSize)}
          </div>
        )}
      </div>

      {/* Control Actions Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {/* Retake Camera button */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 active:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5 text-slate-600" />
            <span>重新拍攝</span>
          </button>

          {/* Change photo button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 active:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
            <span>更換照片</span>
          </button>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-50"
          title="刪除這張照片"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">刪除照片</span>
        </button>
      </div>
    </div>
  );
};
