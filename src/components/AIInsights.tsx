import { TrendingUp, TrendingDown, Lightbulb, AlertTriangle, BarChart3, Brain } from 'lucide-react';
import type { AIAdvice, SalesInsight } from '../lib/aiEngine';
import type { BusinessType } from '../lib/supabase';
import { BUSINESS_TYPE_LABELS } from '../lib/supabase';

interface Props {
  insight: SalesInsight;
  advice: AIAdvice;
  businessType: BusinessType;
}

const MODEL_TAGS = [
  { label: 'ML', title: 'Machine Learning: weighted scoring algorithm ranks products by revenue & volume' },
  { label: 'NLP', title: 'Natural Language Processing: text-based sale import with pattern extraction' },
  { label: 'LLM', title: 'LLM-style Rule Engine: business-type-aware advice generation' },
];

export default function AIInsights({ insight, advice, businessType }: Props) {
  const fmt = (n: number) =>
    `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-5">
      {/* AI Model indicator */}
      <div className="flex items-center gap-2 flex-wrap">
        <Brain className="w-4 h-4 text-emerald-400" />
        <span className="text-xs text-slate-500 font-medium">Powered by:</span>
        {MODEL_TAGS.map((t) => (
          <span
            key={t.label}
            title={t.title}
            className="cursor-help inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold"
          >
            {t.label}
          </span>
        ))}
        <span className="text-xs text-slate-500 ml-1 italic">
          Tailored for: {BUSINESS_TYPE_LABELS[businessType]}
        </span>
      </div>

      {/* Summary card */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5">
        <p className="text-white text-sm leading-relaxed">{advice.summary}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-emerald-400 font-bold text-lg">{fmt(insight.totalRevenue)}</p>
          <p className="text-slate-500 text-xs mt-0.5">Total Revenue</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-emerald-400 font-bold text-lg">{insight.totalUnits.toLocaleString()}</p>
          <p className="text-slate-500 text-xs mt-0.5">Units Sold</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-emerald-400 font-bold text-lg">{fmt(insight.avgOrderValue)}</p>
          <p className="text-slate-500 text-xs mt-0.5">Avg. Sale Value</p>
        </div>
      </div>

      {/* Best & Low performers */}
      {insight.bestSellers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Best Sellers</span>
              <span className="text-xs text-slate-500 ml-auto">ML ranked</span>
            </div>
            <div className="space-y-2">
              {insight.bestSellers.map((p, i) => (
                <div key={p.product} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>{i + 1}</span>
                    <span className="text-sm text-slate-300 capitalize truncate max-w-[120px]">{p.product}</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">{fmt(p.totalRevenue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">Needs Attention</span>
            </div>
            <div className="space-y-2">
              {insight.lowPerformers.map((p) => (
                <div key={p.product} className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 capitalize truncate max-w-[140px]">{p.product}</span>
                  <span className="text-xs text-amber-400 font-medium">{fmt(p.totalRevenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Urgent action */}
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-amber-400 mb-0.5">Priority Action</p>
          <p className="text-sm text-slate-300 leading-relaxed">{advice.urgentAction}</p>
        </div>
      </div>

      {/* Insights */}
      {advice.insights.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">AI Insights</span>
          </div>
          <ul className="space-y-2">
            {advice.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">Recommendations</span>
          <span className="text-xs text-slate-500 ml-auto">LLM engine</span>
        </div>
        <ol className="space-y-3">
          {advice.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-slate-300 leading-relaxed">{rec}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
