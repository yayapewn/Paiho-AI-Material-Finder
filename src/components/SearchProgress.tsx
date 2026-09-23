import React from 'react';
import { SearchStep } from '../types/search';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface SearchProgressProps {
  currentStep: SearchStep;
}

interface StepItem {
  id: SearchStep;
  label: string;
  en: string;
}

const STEPS: StepItem[] = [
  { id: 'analyzing_image', label: '正在分析圖片...', en: 'Analyzing visual texture...' },
  { id: 'extracting_features', label: '正在理解材料特徵...', en: 'Extracting normalized attributes...' },
  { id: 'searching_library', label: '正在搜尋 Paiho Material Library...', en: 'Querying Paiho database...' },
  { id: 'calculating_similarity', label: '正在計算相似度...', en: 'Hybrid similarity weighting...' },
  { id: 'compiling_results', label: '正在整理最佳結果...', en: 'Ranking Top 5 matches...' },
];

export const SearchProgress: React.FC<SearchProgressProps> = ({ currentStep }) => {
  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const activeIndex = stepIndex === -1 ? 0 : stepIndex;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <h3 className="text-sm font-bold text-slate-800">
            AI 智慧材料搜尋進行中
          </h3>
        </div>
        <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          階段 {Math.min(5, activeIndex + 1)} / 5
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-5">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 ease-out"
          style={{ width: `${((activeIndex + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Stage list */}
      <div className="space-y-3">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={step.id}
              className={`flex items-start space-x-3 transition-opacity ${
                isDone
                  ? 'opacity-85'
                  : isCurrent
                  ? 'opacity-100'
                  : 'opacity-35'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-blue-600'
                      : isDone
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {step.en}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
