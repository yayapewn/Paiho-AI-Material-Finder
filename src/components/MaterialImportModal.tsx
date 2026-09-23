import React, { useState } from 'react';
import { Material } from '../types/material';
import { materialRepository } from '../services/materialRepository';
import {
  X,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';

interface MaterialImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMaterialCountChange: () => void;
}

export const MaterialImportModal: React.FC<MaterialImportModalProps> = ({
  isOpen,
  onClose,
  onMaterialCountChange,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [mode, setMode] = useState<'replace' | 'append'>('replace');
  const [stats, setStats] = useState<{
    importedCount: number;
    invalidCount: number;
    duplicateCount: number;
    errors: string[];
  } | null>(null);
  const [previewItems, setPreviewItems] = useState<Material[]>([]);

  if (!isOpen) return null;

  const currentCount = materialRepository.getAllMaterials().length;

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setJsonText(text);
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setPreviewItems(parsed.slice(0, 5));
        }
      } catch (err: any) {
        alert(`JSON 解析失敗: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim() !== '');
        if (lines.length < 2) {
          alert('CSV 內容過少');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const items: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          const item: any = {};
          headers.forEach((h, colIdx) => {
            const val = row[colIdx] || '';
            if (['product', 'structure', 'construction', 'feature', 'process', 'function', 'color', 'application'].includes(h)) {
              item[h] = val.split(';').map((v) => v.trim()).filter(Boolean);
            } else {
              item[h] = val;
            }
          });
          item.demo = true;
          items.push(item);
        }

        setJsonText(JSON.stringify(items, null, 2));
        setPreviewItems(items.slice(0, 5));
      } catch (err: any) {
        alert(`CSV 解析失敗: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        alert('請上傳或貼上 JSON 陣列格式 [ { ... }, { ... } ]');
        return;
      }

      const result = materialRepository.importMaterials(parsed, mode);
      setStats(result);
      onMaterialCountChange();
    } catch (err: any) {
      alert(`匯入失敗: ${err.message}`);
    }
  };

  const handleReset = () => {
    if (window.confirm('確定要將材料庫重置回預設的 22 筆 Demo 測試材料嗎？')) {
      materialRepository.resetToDefault();
      setStats(null);
      setJsonText('');
      setPreviewItems([]);
      onMaterialCountChange();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Paiho 材料資料庫管理 (Admin / Dev Import)
              </h3>
              <p className="text-xs text-slate-500">
                目前在庫筆數: {currentCount} 筆 (含欄位校驗與重複 ID 檢核)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Action Choice: File upload or paste */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center justify-center space-x-2 p-3.5 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors">
              <FileCode className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700">上傳 JSON 檔案</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleJsonUpload}
                className="hidden"
              />
            </label>

            <label className="flex items-center justify-center space-x-2 p-3.5 border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-xl cursor-pointer bg-slate-50 hover:bg-emerald-50/50 transition-colors">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700">上傳 CSV 檔案</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Mode Selection */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-700">匯入模式：</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="import-mode"
                  checked={mode === 'replace'}
                  onChange={() => setMode('replace')}
                />
                <span>替換現有全部</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="import-mode"
                  checked={mode === 'append'}
                  onChange={() => setMode('append')}
                />
                <span>附加在現有後方</span>
              </label>
            </div>
          </div>

          {/* Text Area for manual edit/paste */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              JSON 資料預覽 / 貼上區：
            </label>
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="[&#10;  {&#10;    &quot;id&quot;: &quot;MTK999&quot;,&#10;    &quot;name_zh&quot;: &quot;材料名稱&quot;,&#10;    &quot;name_en&quot;: &quot;Material Name&quot;,&#10;    &quot;image_url&quot;: &quot;https://...&quot;,&#10;    &quot;official_url&quot;: &quot;https://www.paiho.com/tw/material-hub/&quot;&#10;  }&#10;]"
              className="w-full font-mono text-[11px] p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Validation Statistics */}
          {stats && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>匯入處理結果報告</span>
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">成功匯入</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {stats.importedCount}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">格式無效</span>
                  <span className="font-bold text-red-500 text-sm">
                    {stats.invalidCount}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">重複 ID</span>
                  <span className="font-bold text-amber-500 text-sm">
                    {stats.duplicateCount}
                  </span>
                </div>
              </div>

              {stats.errors.length > 0 && (
                <div className="max-h-24 overflow-y-auto bg-white p-2 rounded border border-slate-100 text-[10px] text-slate-600 font-mono space-y-0.5">
                  {stats.errors.map((e, idx) => (
                    <div key={idx} className="text-red-600">
                      ⚠ {e}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preview cards if items parsed */}
          {previewItems.length > 0 && (
            <div>
              <span className="font-semibold text-slate-700 block mb-1">
                預覽前 {previewItems.length} 筆資料：
              </span>
              <div className="space-y-1">
                {previewItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-[11px]"
                  >
                    <span className="font-mono font-bold text-slate-800">
                      {item.id}
                    </span>
                    <span className="text-slate-600">{item.name_zh}</span>
                    <span className="text-slate-400 font-mono">
                      {item.product?.join?.(', ') || item.product}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置為預設資料</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
            >
              關閉
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={!jsonText.trim()}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>執行匯入</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
