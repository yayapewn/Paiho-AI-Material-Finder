import React from 'react';
import { MatchReasons as MatchReasonsType } from '../types/search';
import { Check, AlertTriangle, X, HelpCircle } from 'lucide-react';

interface MatchReasonsProps {
  reasons: MatchReasonsType;
}

export const MatchReasons: React.FC<MatchReasonsProps> = ({ reasons }) => {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2.5 text-xs">
      <div className="text-[11px] font-bold text-slate-700 tracking-wider uppercase flex items-center justify-between">
        <span>為什麼推薦推薦原因 (Match Reasons)</span>
      </div>

      {/* Highly matched items */}
      {reasons.high.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-emerald-700 font-medium text-[11px]">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>高度符合 (High Match)：</span>
          </div>
          <div className="flex flex-wrap gap-1 pl-4.5">
            {reasons.high.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 text-[11px] font-medium border border-emerald-200"
              >
                ✓ {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inferred items */}
      {reasons.inferred.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-amber-700 font-medium text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>AI 推測機能 (Inferred)：</span>
          </div>
          <div className="flex flex-wrap gap-1 pl-4.5">
            {reasons.inferred.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100/70 text-amber-800 text-[11px] font-medium border border-amber-200"
              >
                △ {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Partially matched */}
      {reasons.partial.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-blue-700 font-medium text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>部分符合 (Partial Match)：</span>
          </div>
          <div className="flex flex-wrap gap-1 pl-4.5">
            {reasons.partial.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100/60 text-blue-800 text-[11px] font-medium border border-blue-200"
              >
                ~ {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Different */}
      {reasons.different.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-slate-500 font-medium text-[11px]">
            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>差異注意 (Different)：</span>
          </div>
          <div className="flex flex-wrap gap-1 pl-4.5">
            {reasons.different.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded bg-slate-200/70 text-slate-600 text-[11px] font-medium border border-slate-300/80"
              >
                ✗ {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
