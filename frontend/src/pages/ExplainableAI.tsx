import React, { useState, useEffect } from 'react';
import {
  HelpCircle, Cpu, AlertCircle, Info, Sparkles,
  BarChart2, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { ExplanationResponse } from '../types';
import { useApp } from '../context/AppContext';
import { DemoBadge } from '../components/DemoBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { GlobalImportanceChart } from '../components/GlobalImportanceChart';
import { ShapWaterfallChart } from '../components/ShapWaterfallChart';

export const ExplainableAI: React.FC = () => {
  const { demoMode, isBackendOnline } = useApp();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ExplanationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExplanation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getExplanation(undefined, demoMode);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load crop factor insights.');
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [demoMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sage/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-forest">Crop Factor Insights</span>
            <DemoBadge isDemo={demoMode || !isBackendOnline} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest-dark tracking-tight">
            Not Just a Prediction. An Explanation.
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            See how climate conditions relate to each yield estimate, including factors that raise or lower it.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 rounded-2xl bg-white border border-sage/40 shadow-subtle text-xs text-charcoal">
            <span className="font-bold text-forest block">Study Area:</span>
            <span>Punjab Rabi wheat</span>
          </div>
        </div>
      </div>

      {/* Demo Warning if Demo Mode */}
      {data?.is_demo && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-warning text-xs flex items-center gap-3 shadow-subtle">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-warning" />
          <span>
            <b>Demonstration estimate</b>: individual factor details are unavailable. Overall historical patterns, if shown, do not describe this specific estimate.
          </span>
        </div>
      )}

      {loading && <LoadingSpinner message="Comparing climate factors across historical observations..." size="lg" />}
      {error && <div className="p-4 rounded-xl bg-red-50 text-risk text-sm">{error}</div>}

      {!loading && data && (
        <div className="space-y-10">
          
          {/* Visualizations Grid: Global Importance & Sample Waterfall */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Left: Global Feature Importance */}
            <div className="space-y-3">
              <GlobalImportanceChart importances={data.global_importances} />
            </div>

            {/* Right: Individual Sample Prediction Waterfall */}
            {data.base_value !== null && data.sample_individual_contributions.length > 0 ? <div className="space-y-3">
              <ShapWaterfallChart
                baseValue={data.base_value}
                finalPrediction={
                  data.base_value +
                  data.sample_individual_contributions.reduce((acc, c) => acc + c.shap_value, 0)
                }
                contributions={data.sample_individual_contributions}
                unit="t/ha"
              />
            </div> : (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-warning text-sm">
                Individual factor details are unavailable for demonstration estimates.
              </div>
            )}

          </div>

          {/* Natural Language Explanation Box */}
          <div className="p-6 rounded-2xl bg-mint/50 border border-sage/60 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-forest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest" />
              <span>Automated Explanation Summary</span>
            </h3>
            <p className="text-xs sm:text-sm text-charcoal/90 leading-relaxed font-normal">
              {data.plain_language_summary}
            </p>
            <div className="text-[11px] text-muted italic pt-2 border-t border-sage/30">
              {data.methodology_note}
            </div>
          </div>

          {/* Feature Information Cards Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-forest-dark">Detailed Feature Contribution Breakdown</h3>
              {data.base_value !== null && (
                <span className="text-xs text-muted">Baseline: {data.base_value.toFixed(2)} {data.units}</span>
              )}
            </div>

            {data.sample_individual_contributions.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.sample_individual_contributions.map((c, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border shadow-subtle bg-white space-y-3 transition-all hover:shadow-card ${
                    c.direction === 'positive' ? 'border-green-200' : 'border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-forest-dark">{c.feature_label}</h4>
                      <span className="text-xs text-muted font-medium">Observed: {c.observed_value} {c.unit}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      c.direction === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-risk'
                    }`}>
                      {c.shap_value >= 0 ? `+${c.shap_value.toFixed(2)}` : c.shap_value.toFixed(2)} t/ha
                    </span>
                  </div>

                  <p className="text-xs text-charcoal/80 leading-relaxed">
                    {c.interpretation}
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-muted">
                    <span className="uppercase">Magnitude: <b className="text-charcoal">{c.impact_magnitude}</b></span>
                    <span className="capitalize">{c.direction} contribution</span>
                  </div>
                </div>
              ))}
            </div> : (
              <p className="text-sm text-muted">No individual factor details are available for this demonstration estimate.</p>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
