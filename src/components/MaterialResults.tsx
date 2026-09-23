import React, { useState } from 'react';
import { MaterialSearchResult, NormalizedSearchFeatures } from '../types/search';
import { MaterialCard } from './MaterialCard';
import {
  Sparkles,
  AlertCircle,
  RotateCcw,
  SlidersHorizontal,
  X,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

interface MaterialResultsProps {
  results: MaterialSearchResult[];
  features: NormalizedSearchFeatures;
  userQuery: string;
  quickTags: string[];
  onReSearchWithModifiedFeatures: (modifiedFeatures: NormalizedSearchFeatures) => void;
  onResetSearch: () => void;
}

export const MaterialResults: React.FC<MaterialResultsProps> = ({
  results,
  features,
  userQuery,
  quickTags,
  onReSearchWithModifiedFeatures,
  onResetSearch,
}) => {
  // Local editable tags for refinement
  const [editableTags, setEditableTags] = useState<string[]>(() => {
    const tags: string[] = [];
    if (features.structure_candidates?.[0]?.value) {
      tags.push(features.structure_candidates[0].value);
    }
    if (features.surface?.pattern) {
      tags.push(features.surface.pattern);
    }
    if (features.color?.primary) {
      tags.push(features.color.primary);
    }
    for (const vf of features.visual_features || []) {
      if (!tags.includes(vf)) tags.push(vf);
    }
    for (const pf of features.possible_functions || []) {
      const label = `Possible ${pf.value}`;
      if (!tags.includes(label)) tags.push(label);
    }
    return tags;
  });

  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const highestScore = results[0]?.similarity || 0;
  const isLowSimilarity = highestScore < 50;

  const handleRemoveTag = (tagToRemove: string) => {
    setEditableTags(editableTags.filter((t) => t !== tagToRemove));
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !editableTags.includes(trimmed)) {
      setEditableTags([...editableTags, trimmed]);
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleTriggerReSearch = () => {
    // Construct modified features based on editableTags
    const modified: NormalizedSearchFeatures = {
      ...features,
      visual_features: editableTags.filter((t) => !t.startsWith('Possible ')),
      search_keywords: [...editableTags],
    };
    onReSearchWithModifiedFeatures(modified);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner: AI Extracted Attributes & Refinement */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              AI 識別特徵修正 (Refine Tags)
            </h3>
          </div>
          <button
            type="button"
            onClick={onResetSearch}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重新拍照</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2 mb-3">
          可在此移除、增加或修正 AI 判斷特徵，點選「重新搜尋」將以新條件重排，毋須重新上傳照片。
        </p>

        {/* Editable Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {editableTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/80 group"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-600 p-0.5 rounded transition-colors"
                title="移除此特徵"
              >
                <X className="w-3 h-3 text-slate-400 group-hover:text-red-500" />
              </button>
            </span>
          ))}

          {isAddingTag ? (
            <div className="inline-flex items-center space-x-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="輸入特徵..."
                className="text-xs px-2 py-1 border border-blue-400 rounded-lg focus:outline-none ring-1 ring-blue-400 w-28"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg font-medium"
              >
                加入
              </button>
              <button
                type="button"
                onClick={() => setIsAddingTag(false)}
                className="text-xs text-slate-400 p-1"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingTag(true)}
              className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>新增條件</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleTriggerReSearch}
            className="ml-auto inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>重新搜尋</span>
          </button>
        </div>
      </div>

      {/* Low Similarity Warning State (< 50%) */}
      {isLowSimilarity && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-900 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-sm text-amber-900">
              目前沒有找到高度相似的材料
            </h4>
            <p className="mt-1 text-amber-800">
              資料庫中未匹配到超過 50% 相似度的精確款式。以下為
              <strong>最接近的候選材料（僅供參考）</strong>
              。建議微調上方特徵標籤或拍攝更清晰的微距特寫。
            </p>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>找到以下相似材料</span>
            <span className="text-xs font-normal text-slate-500">
              (依相似度由高至低排列，顯示 Top 5)
            </span>
          </h2>
          {(userQuery || quickTags.length > 0) && (
            <p className="text-xs text-slate-500 mt-0.5">
              已套用條件：
              {userQuery && <span className="font-medium text-slate-700">"{userQuery}" </span>}
              {quickTags.length > 0 && (
                <span className="text-blue-600">[{quickTags.join(', ')}]</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Top 5 Material Cards List */}
      <div className="space-y-4">
        {results.map((item, index) => (
          <MaterialCard key={item.material.id} result={item} rank={index + 1} />
        ))}
      </div>

      {/* Official Hub Link Footer CTA */}
      <div className="p-4 bg-slate-100 rounded-2xl text-center border border-slate-200">
        <p className="text-xs text-slate-600">
          找不到合適的規格？歡迎直接造訪百和完整官方資料庫：
        </p>
        <a
          href="https://www.paiho.com/tw/material-hub/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
        >
          <span>瀏覽 Paiho 官方 Material Hub</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
