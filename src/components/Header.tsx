import React from 'react';
import { Sparkles, Database, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onOpenImport: () => void;
  materialCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenImport, materialCount }) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand logo & title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-slate-700">
            <span className="tracking-tight text-emerald-400">P</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
                Paiho AI Material Finder
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              百和 AI 相似材料搜尋
            </p>
          </div>
        </div>

        {/* Action badges */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenImport}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors"
            title="管理與匯入材料庫 (開發者模式)"
          >
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden xs:inline">材料庫</span>
            <span className="bg-white px-1.5 py-0.2 rounded text-[10px] text-slate-600 border border-slate-200 font-mono">
              {materialCount}
            </span>
          </button>

          <a
            href="https://www.paiho.com/tw/material-hub/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            title="前往 Paiho 官方 Material Hub"
          >
            <span className="hidden sm:inline">Material Hub</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          </a>
        </div>
      </div>

      {/* Tagline banner */}
      <div className="bg-slate-50/80 border-t border-slate-100 px-4 py-2 text-center">
        <p className="text-xs sm:text-sm font-medium text-slate-800 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 inline" />
          <span>拍一張，說一句，找到最接近的百和材料。</span>
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Take a photo. Describe what you need. Find similar Paiho materials.
        </p>
      </div>
    </header>
  );
};
