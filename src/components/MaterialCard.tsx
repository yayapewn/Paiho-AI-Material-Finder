import React, { useState } from 'react';
import { MaterialSearchResult } from '../types/search';
import { MatchReasons } from './MatchReasons';
import { SpecSheetModal } from './SpecSheetModal';
import {
  ExternalLink,
  Layers,
  Box,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Search,
  ZoomIn,
} from 'lucide-react';

interface MaterialCardProps {
  result: MaterialSearchResult;
  rank: number;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ result, rank }) => {
  const { material, similarity, match_reasons, score_breakdown } = result;
  const [showDetails, setShowDetails] = useState(false);
  const [isSpecOpen, setIsSpecOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Determine similarity color badge
  const getBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-600 text-white border-emerald-500';
    if (score >= 70) return 'bg-blue-600 text-white border-blue-500';
    if (score >= 50) return 'bg-amber-600 text-white border-amber-500';
    return 'bg-slate-600 text-white border-slate-500';
  };

  const searchPaihoUrl = `https://paiho-usa.com/?s=${encodeURIComponent(
    material.name_en
  )}`;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Top Header Row with ID, Rank & Similarity Match */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              #{rank}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-base text-slate-900">
                  {material.id}
                </span>
                {material.demo && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    Paiho 材料庫
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-800 leading-snug">
                {material.name_zh}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {material.name_en}
              </p>
            </div>
          </div>

          {/* Similarity Match Badge */}
          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">
                Similarity Match
              </span>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold border shadow-sm ${getBadgeColor(
                  similarity
                )}`}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-white/90" />
                <span>{similarity}% 相似度</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Image & Attributes */}
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Material Image with click-to-zoom */}
          <div
            onClick={() => setIsSpecOpen(true)}
            className="sm:col-span-4 aspect-square sm:aspect-auto sm:h-full min-h-[170px] bg-slate-900 rounded-xl overflow-hidden relative border border-slate-200 group cursor-pointer"
            title="點擊查看材料高清大圖與規格書"
          >
            {imgError ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <span className="text-xs font-mono font-bold text-blue-400 mb-1">
                  {material.id}
                </span>
                <span className="text-[11px] font-medium text-slate-200">
                  {material.name_zh}
                </span>
                <span className="text-[10px] text-slate-400 mt-2 px-2 py-0.5 bg-slate-800 rounded">
                  {material.structure.join('/')} · {material.construction.join('/')}
                </span>
              </div>
            ) : (
              <img
                src={material.image_url}
                alt={material.name_zh}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                loading="lazy"
              />
            )}

            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-white/95 backdrop-blur text-slate-900 text-xs px-2.5 py-1 rounded-full font-bold flex items-center shadow-lg">
                <ZoomIn className="w-3.5 h-3.5 mr-1 text-blue-600" />
                查看大圖與規格
              </span>
            </div>

            <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur text-[10px] text-white px-2 py-0.5 rounded font-mono">
              {material.product.join(', ')}
            </div>
          </div>

          {/* Material Specs and Reasons */}
          <div className="sm:col-span-8 flex flex-col justify-between space-y-3">
            {/* Match Reasons Component */}
            <MatchReasons reasons={match_reasons} />

            {/* Quick Attribute Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">
                  結構 Structure
                </span>
                <span className="font-semibold text-slate-700">
                  {material.structure.join(', ')}
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">
                  組織 Construction
                </span>
                <span className="font-semibold text-slate-700">
                  {material.construction.join(', ')}
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">
                  機能 Function
                </span>
                <span className="font-semibold text-slate-700 line-clamp-1">
                  {material.function.join(', ')}
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">
                  應用 Application
                </span>
                <span className="font-semibold text-slate-700 line-clamp-1">
                  {material.application.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Accordion detail toggle for breakdown */}
        <div className="px-4 sm:px-5 pb-2">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-700 py-1.5 border-t border-slate-100"
          >
            <span className="flex items-center space-x-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>查看混合權重計分細節 (Weight Breakdown)</span>
            </span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showDetails && (
            <div className="py-2 px-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 grid grid-cols-3 sm:grid-cols-6 gap-2 my-2 border border-slate-200/60 font-mono">
              <div>
                <span className="text-slate-400 block">外觀紋理 (45%)</span>
                <span className="font-bold text-slate-800">
                  {score_breakdown.visual}分
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">產品品類 (15%)</span>
                <span className="font-bold text-slate-800">
                  {score_breakdown.product}分
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">結構製程 (15%)</span>
                <span className="font-bold text-slate-800">
                  {score_breakdown.structure}分
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">組織特徵 (10%)</span>
                <span className="font-bold text-slate-800">
                  {score_breakdown.feature}分
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">文字意圖 (10%)</span>
                <span className="font-bold text-slate-800">
                  {score_breakdown.intent}分
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">色系比對 (5%)</span>
                <span className="font-bold text-slate-800">
                  {score_breakdown.color}分
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Card Action Buttons */}
        <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* View Spec Sheet Modal */}
            <button
              type="button"
              onClick={() => setIsSpecOpen(true)}
              className="inline-flex items-center justify-center space-x-1 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-blue-400" />
              <span>規格書 (Spec Sheet)</span>
            </button>

            {/* Official Category Page Link */}
            <a
              href={material.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <span>百和官方品類專區</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>

            {/* Official Search on Paiho */}
            <a
              href={searchPaihoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-1 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 transition-all shadow-sm"
              title="前往 Paiho 官網搜尋此品名"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
              <span>官網搜尋</span>
              <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
            </a>
          </div>

          {/* Try in 3D Button - Phase 1 placeholder */}
          <div className="flex items-center">
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-medium rounded-xl cursor-not-allowed border border-slate-200"
              title="Paiho 3D 即時換色預覽平台（即將推出）"
            >
              <Box className="w-3.5 h-3.5 text-slate-400" />
              <span>Try in 3D</span>
              <span className="text-[10px] bg-slate-200 text-slate-500 px-1 py-0.2 rounded font-sans">
                即將推出
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Technical Spec Sheet Modal */}
      <SpecSheetModal
        material={material}
        isOpen={isSpecOpen}
        onClose={() => setIsSpecOpen(false)}
      />
    </>
  );
};
