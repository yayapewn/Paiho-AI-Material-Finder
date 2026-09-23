import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AnalyzeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  hasImage: boolean;
}

export const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({
  onClick,
  isLoading,
  disabled,
  hasImage,
}) => {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 transition-all shadow-md active:scale-[0.99] ${
          disabled
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-500/20'
        }`}
      >
        <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'text-emerald-300'}`} />
        <span>{isLoading ? '正在分析材料與搜尋資料庫...' : 'AI 搜尋相似材料'}</span>
        {!isLoading && <ArrowRight className="w-5 h-5 ml-1 opacity-80" />}
      </button>

      {!hasImage && !disabled && (
        <p className="text-center text-[11px] text-slate-400 mt-2">
          提示：已提供文字/關鍵字條件。搭配樣品照片可大幅提升外觀與紋理辨識準確度！
        </p>
      )}
    </div>
  );
};
