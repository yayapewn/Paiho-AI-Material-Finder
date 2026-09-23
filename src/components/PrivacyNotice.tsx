import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyNotice: React.FC = () => {
  return (
    <footer className="w-full max-w-3xl mx-auto px-4 py-6 mt-8 border-t border-slate-200/80 text-center">
      <div className="inline-flex items-center justify-center space-x-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200/60 px-3.5 py-1.5 rounded-full mb-3">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>上傳圖片僅用於本次材料搜尋。Prototype 預設不永久保存使用者圖片。</span>
      </div>

      <p className="text-[11px] text-slate-400">
        © Paiho Material Finder Prototype · 台灣百和工業股份有限公司 (Paiho Group)
      </p>
      <p className="text-[10px] text-slate-400 mt-1">
        所有規格資料以 Paiho 官方 Material Hub 即時發布為準。
      </p>
    </footer>
  );
};
