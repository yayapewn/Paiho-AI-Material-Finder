import React from 'react';
import { Tag, Check } from 'lucide-react';

interface QuickTagsProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags?: () => void;
  disabled?: boolean;
}

export const AVAILABLE_QUICK_TAGS = [
  '透氣 Breathable',
  '彈性 Stretch',
  '輕量 Lightweight',
  '反光 Reflective',
  '耐磨 Abrasion Resistant',
  '柔軟 Soft',
  '網孔 Mesh',
  '針織 Knit',
  '梭織 Woven',
  '緹花 Jacquard',
  '鞋面 Footwear Upper',
  '鞋帶 Shoelace',
  '織帶 Webbing',
  '黑色 Black',
  '白色 White',
  '回收材料 Recycled',
];

export const QuickTags: React.FC<QuickTagsProps> = ({
  selectedTags,
  onToggleTag,
  onClearTags,
  disabled = false,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-1.5">
          <Tag className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            快速關鍵字 Quick Tags
          </h3>
          {selectedTags.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
              {selectedTags.length}
            </span>
          )}
        </div>
        {selectedTags.length > 0 && onClearTags && (
          <button
            type="button"
            onClick={onClearTags}
            disabled={disabled}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            重設標籤
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-3">
        點選核心機能、結構或應用（可多選，將結合自然語言與圖片進行 AI 分析）
      </p>

      {/* Tags grid / flex wrap */}
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_QUICK_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              disabled={disabled}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all transform active:scale-95 disabled:opacity-50 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30 font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5" />}
              <span>{tag}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
