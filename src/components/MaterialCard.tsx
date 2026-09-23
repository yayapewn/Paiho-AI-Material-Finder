import React, { useState } from 'react';
import { MaterialSearchResult } from '../types/search';
import { MatchReasons } from './MatchReasons';
import { ExternalLink, Layers, Box, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface MaterialCardProps {
  result: MaterialSearchResult;
  rank: number;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ result, rank }) => {
  const { material, similarity, match_reasons, score_breakdown } = result;
  const [showDetails, setShowDetails] = useState(false);

  // Determine similarity color badge
  const getBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-600 text-white border-emerald-500';
    if (score >= 70) return 'bg-blue-600 text-white border-blue-500';
    if (score >= 50) return 'bg-amber-600 text-white border-amber-500';
    return 'bg-slate-600 text-white border-slate-500';
  };

  return (
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
                  Demo 樣品庫
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
        {/* Material Image */}
        <div className="sm:col-span-4 aspect-square sm:aspect-auto sm:h-full min-h-[160px] bg-slate-950 rounded-xl overflow-hidden relative border border-slate-200/80 group">
          <img
            src={material.image_url}
            alt={material.name_zh}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-[10px] text-white px-2 py-0.5 rounded font-mono">
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
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
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
      <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <a
          href={material.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          <span>查看官方材料資料</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
        </a>

        {/* Try in 3D Button - disabled as planned for Phase 1 */}
        <div className="w-full sm:w-auto flex items-center justify-center">
          <button
            type="button"
            disabled
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-200 text-slate-400 text-xs font-medium rounded-xl cursor-not-allowed border border-slate-200"
            title="Paiho 3D 即時換色預覽平台（即將推出）"
          >
            <Box className="w-3.5 h-3.5 text-slate-400" />
            <span>Try in 3D</span>
            <span className="text-[10px] bg-slate-300 text-slate-600 px-1 py-0.2 rounded font-sans">
              即將推出
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
