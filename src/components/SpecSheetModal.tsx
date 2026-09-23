import React from 'react';
import { Material } from '../types/material';
import { X, ExternalLink, Search, CheckCircle2, ShieldCheck, Layers, FileText, ZoomIn } from 'lucide-react';

interface SpecSheetModalProps {
  material: Material;
  isOpen: boolean;
  onClose: () => void;
}

export const SpecSheetModal: React.FC<SpecSheetModalProps> = ({
  material,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const searchPaihoUrl = `https://paiho-usa.com/?s=${encodeURIComponent(
    material.name_en
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center space-x-2.5">
            <span className="px-2.5 py-1 bg-blue-600 text-white font-mono font-bold text-xs rounded-md shadow-sm">
              {material.id}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {material.name_zh}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {material.name_en}
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

        {/* Modal Body */}
        <div className="p-5 space-y-6">
          {/* Swatch & Quick Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            <div className="sm:col-span-5 aspect-square rounded-xl overflow-hidden bg-slate-950 relative border border-slate-200 shadow-inner group">
              <img
                src={material.image_url}
                alt={material.name_zh}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] text-white/90 flex items-center space-x-1 font-medium">
                  <ZoomIn className="w-3.5 h-3.5 text-blue-400 mr-1" />
                  百和材料庫實體樣品特寫
                </span>
              </div>
            </div>

            <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>核心物理與織造規格</span>
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">產品系列</span>
                    <span className="font-semibold text-slate-800">
                      {material.product.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">織造結構</span>
                    <span className="font-semibold text-slate-800">
                      {material.structure.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">組織紋理</span>
                    <span className="font-semibold text-slate-800">
                      {material.construction.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">標準色系</span>
                    <span className="font-semibold text-slate-800">
                      {material.color.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {material.composition && material.composition.length > 0 && (
                <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100">
                  <span className="text-[10px] text-blue-600 font-bold block mb-0.5">
                    纖維成分 Composition
                  </span>
                  <p className="text-xs text-blue-900 font-medium">
                    {material.composition.join(' / ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Visual Description */}
          {material.visual_description && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                外觀結構與表面肌理 (Visual Profile)
              </span>
              <p className="text-slate-700 leading-relaxed">
                {material.visual_description}
              </p>
            </div>
          )}

          {/* Functional & Application Tags */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>機能特性 Features & Functions</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {material.function.map((f, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>推薦終端應用 Application</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {material.application.map((app, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>

            {material.sustainability && material.sustainability.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>環保永續與認證 Sustainability</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {material.sustainability.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200/80 rounded-lg font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer: Real Official Links */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 sticky bottom-0">
          <a
            href={material.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <span>前往百和官方品類專區</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </a>

          <a
            href={searchPaihoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <span>於 Paiho 官網搜尋此規格</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
