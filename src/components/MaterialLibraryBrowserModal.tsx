import React, { useState, useMemo } from 'react';
import { Material } from '../types/material';
import { materialRepository } from '../services/materialRepository';
import { SpecSheetModal } from './SpecSheetModal';
import {
  X,
  Search,
  ExternalLink,
  Layers,
  FileText,
  Filter,
  Sparkles,
  ZoomIn,
} from 'lucide-react';

interface MaterialLibraryBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMaterialToSearch?: (material: Material) => void;
}

export const MaterialLibraryBrowserModal: React.FC<
  MaterialLibraryBrowserModalProps
> = ({ isOpen, onClose, onSelectMaterialToSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectMaterial, setInspectMaterial] = useState<Material | null>(null);

  const materials = useMemo(() => materialRepository.getAllMaterials(), [isOpen]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    materials.forEach((m) => {
      m.product.forEach((p) => set.add(p));
    });
    return ['all', ...Array.from(set)];
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesCat =
        selectedCategory === 'all' || m.product.includes(selectedCategory);
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        m.id.toLowerCase().includes(query) ||
        m.name_zh.toLowerCase().includes(query) ||
        m.name_en.toLowerCase().includes(query) ||
        m.structure.some((s) => s.toLowerCase().includes(query)) ||
        m.construction.some((c) => c.toLowerCase().includes(query)) ||
        m.function.some((f) => f.toLowerCase().includes(query));

      return matchesCat && matchesQuery;
    });
  }, [materials, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-bold text-slate-900 text-base sm:text-lg">
                    百和材料圖書館 (Material Library)
                  </h2>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                    共 {materials.length} 款樣品
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  收錄百和鞋面針織、立體緹花織帶、反光鞋帶、止滑彈力帶與射出勾樣品庫
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="p-3 sm:p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋材料編號 (如 MTK341)、品名、透氣、針織、反光..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Badges */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const label =
                  cat === 'all'
                    ? '全部'
                    : cat === 'Knit Upper'
                    ? '鞋面網布'
                    : cat === 'Webbing'
                    ? '織帶'
                    : cat === 'Shoelace'
                    ? '鞋帶'
                    : cat === 'Elastic Band'
                    ? '彈力帶'
                    : cat === 'Hook & Loop'
                    ? '黏扣帶'
                    : cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material Grid with Real High-Res Swatch Photos */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/40">
            {filteredMaterials.map((m) => {
              const searchPaihoUrl = `https://paiho-usa.com/?s=${encodeURIComponent(
                m.name_en
              )}`;

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Material Image */}
                    <div
                      onClick={() => setInspectMaterial(m)}
                      className="aspect-4/3 bg-slate-900 relative overflow-hidden cursor-pointer"
                      title="點擊查看材料高清大圖與規格書"
                    >
                      <img
                        src={m.image_url}
                        alt={m.name_zh}
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur text-white text-[11px] font-mono px-2 py-0.5 rounded font-bold">
                        {m.id}
                      </div>

                      <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/95 backdrop-blur text-slate-900 text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center shadow">
                          <ZoomIn className="w-3 h-3 mr-1 text-blue-600" />
                          查看規格書
                        </span>
                      </div>

                      <div className="absolute bottom-2 right-2 bg-slate-900/85 backdrop-blur text-slate-200 text-[10px] px-2 py-0.5 rounded">
                        {m.structure.join('/')}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3.5 space-y-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">
                          {m.name_zh}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                          {m.name_en}
                        </p>
                      </div>

                      {/* Attribute Pills */}
                      <div className="flex flex-wrap gap-1">
                        {m.function.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium border border-emerald-100"
                          >
                            {f}
                          </span>
                        ))}
                        {m.construction.slice(0, 1).map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setInspectMaterial(m)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] transition-colors"
                    >
                      <FileText className="w-3 h-3 text-blue-400 mr-0.5" />
                      <span>規格書</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <a
                        href={m.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] transition-colors"
                        title="前往百和官方品類專區"
                      >
                        <span>品類頁</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <a
                        href={searchPaihoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        title="於 Paiho 官網搜尋此品名"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="p-3.5 sm:p-4 bg-slate-100/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                每筆材料均附有百和材料編號、實體高解析纖維特寫與官方品類導航。
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300 transition-colors shadow-xs"
            >
              關閉視窗
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Spec Sheet Modal */}
      {inspectMaterial && (
        <SpecSheetModal
          material={inspectMaterial}
          isOpen={!!inspectMaterial}
          onClose={() => setInspectMaterial(null)}
        />
      )}
    </>
  );
};
