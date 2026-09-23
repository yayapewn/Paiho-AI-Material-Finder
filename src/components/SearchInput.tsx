import React from 'react';
import { MessageSquareText, Lightbulb } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const suggestions = [
    '我要鞋面用，透氣，有一點彈性',
    '跟照片很像，但我要白色',
    '我要鞋帶用，而且要有反光',
    '找相似結構，不限制顏色',
    '我要環保回收材料',
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="natural-query"
          className="text-sm font-bold text-slate-900 flex items-center space-x-1.5"
        >
          <MessageSquareText className="w-4 h-4 text-blue-600" />
          <span>描述你的需求（選填）</span>
        </label>
        <span className="text-[11px] text-slate-400 font-medium">
          自然語言理解
        </span>
      </div>

      <div className="relative">
        <textarea
          id="natural-query"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="例如：鞋面使用、黑色、透氣、有彈性、不要太厚"
          className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none disabled:bg-slate-50"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded"
          >
            清空
          </button>
        )}
      </div>

      {/* Suggested prompts chips */}
      <div className="mt-3">
        <div className="flex items-center space-x-1 text-slate-500 text-xs mb-1.5 font-medium">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>常見需求範例（點選代入）：</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(s)}
              disabled={disabled}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors border border-slate-200/70 text-left active:scale-[0.98]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
