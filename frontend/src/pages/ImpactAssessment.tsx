import React, { useState } from 'react';
import {
  Sparkles, Download, ArrowRight, RotateCcw, AlertTriangle, ShieldCheck,
  Thermometer, CloudRain, Droplets, Sun, CheckCircle2, FileText
} from 'lucide-react';
import { api } from '../services/api';
import { ClimateInput, AssessmentResponse } from '../types';
import { useApp, DEFAULT_DEMO_INPUT } from '../context/AppContext';
import { DemoBadge } from '../components/DemoBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RiskIndicatorBadge } from '../components/RiskIndicatorBadge';
import { ShapWaterfallChart } from '../components/ShapWaterfallChart';

const PUNJAB_DISTRICTS = [
  "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib",
  "Fazilka", "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar",
  "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar",
  "Nawanshahr", "Pathankot", "Patiala", "Rupnagar", "S.A.S Nagar",
  "Sangrur", "Tarn Taran"
];

export const ImpactAssessment: React.FC = () => {
  const { demoMode, currentAssessment, setCurrentAssessment, isBackendOnline } = useApp();
  
  const [formData, setFormData] = useState<ClimateInput>({
    country: "India",
    state: "Punjab",
    district: "Ludhiana",
    crop: "Wheat (Rabi)",
    growing_season: "Rabi (Nov - Apr)",
    assessment_year: 2024,
    irrigation_type: "Canal & Tubewell (Assured)",
    avg_temperature: 17.3,
    max_temperature: 36.6,
    rainfall_mm: 78.3,
    humidity_pct: 37.7,
    soil_moisture_pct: 38.6,
    heat_wave_days: 18
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ClimateInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoadDemoScenario = () => {
    setFormData({
      ...DEFAULT_DEMO_INPUT,
      district: "Ludhiana",
      avg_temperature: 18.6,
      max_temperature: 33.2,
      rainfall_mm: 55.0,
      humidity_pct: 46.0,
      soil_moisture_pct: 32.0,
      heat_wave_days: 10
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.assessImpact(formData, demoMode);
      setCurrentAssessment(response);
    } catch (err: any) {
      setError(err.message || 'Assessment computation encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!currentAssessment) return;
    setDownloadingPdf(true);
    try {
      const blob = await api.downloadReportPdf(currentAssessment);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KrishiExplain_Assessment_${currentAssessment.assessment_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Could not download PDF report: ' + (err.message || 'Unknown error'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sage/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-forest">Crop Impact Analysis</span>
            <DemoBadge isDemo={demoMode || !isBackendOnline} />
          </div>
          <h1 className="text-3xl font-extrabold text-forest-dark tracking-tight">
            Agricultural Climate Impact Assessment
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Estimate yield from the selected climate conditions and district. This is a conditional estimate, not a crop-year trend forecast; see how each factor relates to the result.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadDemoScenario}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-cream border border-sage/60 text-forest-dark shadow-subtle transition-all"
        >
          <Sparkles className="w-4 h-4 text-warning" />
          <span>Load Demo Scenario (Terminal Heat Event)</span>
        </button>
      </div>

      {/* Main Assessment Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-sage/40 shadow-card space-y-8">
        
        {/* Section 1: Geographical & Agronomic Context */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-forest-dark border-b border-gray-100 pb-2">
            <span className="w-6 h-6 rounded-full bg-forest text-white text-xs flex items-center justify-center">1</span>
            <h3>Geographical & Agronomic Context</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Country</label>
              <input
                type="text"
                disabled
                value={formData.country}
                className="w-full px-3 py-2 rounded-xl bg-cream border border-sage/40 text-xs font-semibold text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">State / Province</label>
              <input
                type="text"
                disabled
                value={formData.state}
                className="w-full px-3 py-2 rounded-xl bg-cream border border-sage/40 text-xs font-semibold text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">District</label>
              <select
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-sage/50 text-xs font-semibold text-charcoal focus:ring-2 focus:ring-forest"
              >
                {PUNJAB_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">Irrigation Infrastructure</label>
              <select
                value={formData.irrigation_type}
                onChange={(e) => handleInputChange('irrigation_type', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-sage/50 text-xs font-semibold text-charcoal focus:ring-2 focus:ring-forest"
              >
                <option value="Canal & Tubewell (Assured)">Canal & Tubewell (Assured)</option>
                <option value="Tubewell Intensive">Tubewell Intensive</option>
                <option value="Rainfed (Kandi Zone)">Rainfed (Kandi Zone)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Climate Input Parameters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-forest-dark border-b border-gray-100 pb-2">
            <span className="w-6 h-6 rounded-full bg-forest text-white text-xs flex items-center justify-center">2</span>
            <h3>Agro-Meteorological Features (Growing Season Nov–Apr)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Average Temperature */}
            <div className="p-4 rounded-2xl bg-cream/70 border border-sage/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-forest" />
                  <span>Mean Rabi Temp (°C)</span>
                </span>
                <span className="text-xs font-extrabold text-forest-dark px-2 py-0.5 rounded bg-white border border-sage/40">
                  {formData.avg_temperature} °C
                </span>
              </div>
              <input
                type="range"
                min={13.0}
                max={25.0}
                step={0.1}
                value={formData.avg_temperature}
                onChange={(e) => handleInputChange('avg_temperature', parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted">
                <span>13.0°C (Cold)</span>
                <span className="font-semibold text-forest">Optimal: 16–18°C</span>
                <span>25.0°C (Warm)</span>
              </div>
            </div>

            {/* Max / Terminal Heat Temperature */}
            <div className="p-4 rounded-2xl bg-cream/70 border border-sage/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-warning" />
                  <span>Peak / Terminal Temp (°C)</span>
                </span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded border ${
                  formData.max_temperature >= 31.0 ? 'bg-red-50 text-risk border-red-300' : 'bg-white text-forest-dark border-sage/40'
                }`}>
                  {formData.max_temperature} °C
                </span>
              </div>
              <input
                type="range"
                min={22.0}
                max={42.0}
                step={0.1}
                value={formData.max_temperature}
                onChange={(e) => handleInputChange('max_temperature', parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted">
                <span>22.0°C</span>
                <span className="font-semibold text-risk">Critical Stress: &gt;31°C</span>
                <span>38.0°C (Extreme)</span>
              </div>
            </div>

            {/* Cumulative Rabi Rainfall */}
            <div className="p-4 rounded-2xl bg-cream/70 border border-sage/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-forest" />
                  <span>Cumulative Rainfall (mm)</span>
                </span>
                <span className="text-xs font-extrabold text-forest-dark px-2 py-0.5 rounded bg-white border border-sage/40">
                  {formData.rainfall_mm} mm
                </span>
              </div>
              <input
                type="range"
                min={15.0}
                max={300.0}
                step={1.0}
                value={formData.rainfall_mm}
                onChange={(e) => handleInputChange('rainfall_mm', parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted">
                <span>15 mm (Deficit)</span>
                <span className="font-semibold text-forest">Optimal: 75–140 mm</span>
                <span>250 mm (Excess)</span>
              </div>
            </div>

            {/* Relative Humidity */}
            <div className="p-4 rounded-2xl bg-cream/70 border border-sage/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-forest" />
                  <span>Relative Humidity (%)</span>
                </span>
                <span className="text-xs font-extrabold text-forest-dark px-2 py-0.5 rounded bg-white border border-sage/40">
                  {formData.humidity_pct} %
                </span>
              </div>
              <input
                type="range"
                min={20.0}
                max={60.0}
                step={1.0}
                value={formData.humidity_pct}
                onChange={(e) => handleInputChange('humidity_pct', parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted">
                <span>25% (Dry)</span>
                <span>Normal: 45–65%</span>
                <span>85% (Humid)</span>
              </div>
            </div>

            {/* Soil Moisture */}
            <div className="p-4 rounded-2xl bg-cream/70 border border-sage/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-forest" />
                  <span>Soil Moisture Index (%)</span>
                </span>
                <span className="text-xs font-extrabold text-forest-dark px-2 py-0.5 rounded bg-white border border-sage/40">
                  {formData.soil_moisture_pct} %
                </span>
              </div>
              <input
                type="range"
                min={18.0}
                max={65.0}
                step={1.0}
                value={formData.soil_moisture_pct}
                onChange={(e) => handleInputChange('soil_moisture_pct', parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted">
                <span>18% (Water Stress)</span>
                <span className="font-semibold text-forest">Optimal: 35–55%</span>
                <span>65% (Wet)</span>
              </div>
            </div>

            {/* Heat Wave Days */}
            <div className="p-4 rounded-2xl bg-cream/70 border border-sage/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-warning" />
                  <span>Terminal Heat Days (&gt;31°C)</span>
                </span>
                <span className="text-xs font-extrabold text-forest-dark px-2 py-0.5 rounded bg-white border border-sage/40">
                  {formData.heat_wave_days} days
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={59}
                step={1}
                value={formData.heat_wave_days}
                onChange={(e) => handleInputChange('heat_wave_days', parseInt(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted">
                <span>0 days</span>
                <span>Threshold: &gt;6 days</span>
                <span>25 days</span>
              </div>
            </div>

          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            Check that the selected values reflect the climate conditions you want to explore.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-forest hover:bg-forest-dark shadow-card hover:shadow-elevated transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            <span>Analyze Agricultural Impact</span>
            <ArrowRight className="w-5 h-5 text-sage-light" />
          </button>
        </div>

      </form>

      {/* Loading & Error States */}
      {loading && <LoadingSpinner message="Estimating yield and comparing climate factors..." size="lg" />}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-risk text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Assessment Results Section */}
      {currentAssessment && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Results Header Banner */}
          <div className="p-6 rounded-3xl bg-white border border-sage/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-muted uppercase">Assessment Result: {currentAssessment.assessment_id}</span>
                <DemoBadge isDemo={currentAssessment.is_demo} />
              </div>
              <h2 className="text-2xl font-extrabold text-forest-dark">
                Yield Estimate & Climate Factor Insights
              </h2>
              <p className="text-xs text-muted">
                Evaluated for {currentAssessment.prediction.crop} in {currentAssessment.prediction.region} ({currentAssessment.prediction.prediction_period}).
              </p>
            </div>

            <button
              onClick={handleDownloadReport}
              disabled={downloadingPdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-forest hover:bg-forest-dark text-white shadow-card transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-sage-light" />
              <span>{downloadingPdf ? 'Exporting PDF...' : 'Download Official PDF Report'}</span>
            </button>
          </div>

          {/* KPI Prediction Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-white border border-sage/40 shadow-subtle flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-muted uppercase">Predicted Wheat Yield</span>
                <div className="text-3xl font-extrabold text-forest-dark mt-2">
                  {currentAssessment.prediction.predicted_yield.toFixed(2)}{" "}
                  <span className="text-sm font-normal text-muted">{currentAssessment.prediction.yield_unit}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-muted flex items-center justify-between">
                <span>
                  {currentAssessment.base_value !== null
                    ? `Regional baseline: ${currentAssessment.base_value.toFixed(2)} t/ha`
                    : 'Baseline unavailable for demo estimate'}
                </span>
                <span className={`font-bold ${currentAssessment.prediction.yield_change_pct >= 0 ? 'text-green-600' : 'text-risk'}`}>
                  {currentAssessment.prediction.yield_change_pct >= 0 ? `+${currentAssessment.prediction.yield_change_pct}` : currentAssessment.prediction.yield_change_pct}%
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sage/40 shadow-subtle flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-muted uppercase">Regional Historical Benchmark</span>
                <div className="text-3xl font-extrabold text-charcoal mt-2">
                  {currentAssessment.prediction.baseline_yield.toFixed(2)}{" "}
                  <span className="text-sm font-normal text-muted">t/ha</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-muted">
                Mean of observed 1997–2012 training and validation records
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sage/40 shadow-subtle flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-muted uppercase">Past Evaluation Results</span>
                <div className="text-base font-bold text-forest-dark mt-2">
                  Punjab Rabi wheat
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-muted flex items-center justify-between">
                <span>Historical fit: {currentAssessment.prediction.r2_score ?? 'N/A'}</span>
                <span>Average error: {currentAssessment.prediction.mae ?? 'N/A'} t/ha</span>
              </div>
            </div>

          </div>

          {/* Section: Risk Assessment Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-forest-dark">Agro-Climatic Vulnerability Indicators</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentAssessment.risk_assessment.map((indicator, idx) => (
                <RiskIndicatorBadge key={idx} indicator={indicator} />
              ))}
            </div>
          </div>

          {/* Section: Yield Factor Contributions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-forest-dark">How Climate Factors Relate to Yield</h3>
            {currentAssessment.base_value !== null && currentAssessment.key_contributors.length > 0 ? (
              <ShapWaterfallChart
                baseValue={currentAssessment.base_value}
                finalPrediction={currentAssessment.prediction.predicted_yield}
                contributions={currentAssessment.key_contributors}
                unit="t/ha"
              />
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-warning text-sm">
                Factor explanations are unavailable for demonstration estimates.
              </div>
            )}
          </div>

          {/* Plain-Language Explanation */}
          <div className="p-6 rounded-2xl bg-mint/40 border border-sage/50 space-y-2">
            <h4 className="text-sm font-bold text-forest-dark uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-forest" />
              <span>Plain-Language Synthesis</span>
            </h4>
            <p className="text-xs sm:text-sm text-charcoal/90 leading-relaxed font-normal">
              {currentAssessment.plain_language_explanation}
            </p>
          </div>

          {/* Detailed Feature Contribution Table */}
          <div className="bg-white p-6 rounded-2xl border border-sage/40 shadow-card space-y-4">
            <h4 className="text-base font-bold text-forest-dark">Climate Factor Contributions</h4>
            {currentAssessment.key_contributors.length > 0 ? <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-muted uppercase text-[11px]">
                    <th className="pb-2">Feature</th>
                    <th className="pb-2">Observed Input</th>
                    <th className="pb-2">Contribution</th>
                    <th className="pb-2">Direction</th>
                    <th className="pb-2">Magnitude</th>
                    <th className="pb-2">Agronomic Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentAssessment.key_contributors.map((c, i) => (
                    <tr key={i} className="hover:bg-cream/40 transition-colors">
                      <td className="py-2.5 font-bold text-charcoal">{c.feature_label}</td>
                      <td className="py-2.5 text-muted">{c.observed_value} {c.unit}</td>
                      <td className={`py-2.5 font-bold ${c.direction === 'positive' ? 'text-green-600' : 'text-risk'}`}>
                        {c.shap_value >= 0 ? `+${c.shap_value.toFixed(2)}` : c.shap_value.toFixed(2)} t/ha
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.direction === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {c.direction === 'positive' ? 'Favorable (+)' : 'Adverse (-)'}
                        </span>
                      </td>
                      <td className="py-2.5 uppercase text-[10px] font-semibold text-muted">{c.impact_magnitude}</td>
                      <td className="py-2.5 text-gray-700 leading-tight pr-2">{c.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> : (
              <p className="text-sm text-muted">No factor contributions are available for this demonstration estimate.</p>
            )}
          </div>

          {/* Section: Evidence-Based Adaptation Insights */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-forest-dark">Evidence-Based Adaptation Options</h3>
              <span className="text-xs text-muted">Curated from PAU & ICAR-IIWBR Technical Guidelines</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentAssessment.adaptation_insights.map((strat, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-forest px-2 py-0.5 rounded bg-mint border border-sage/40">
                        {strat.risk_factor}
                      </span>
                      <span className="text-muted italic">Rule-Based</span>
                    </div>
                    <h4 className="font-bold text-sm text-forest-dark">{strat.strategy_title}</h4>
                    <p className="text-xs text-charcoal/90 leading-relaxed font-medium">{strat.action_summary}</p>
                    <p className="text-xs text-muted leading-relaxed"><b>Why Relevant:</b> {strat.why_relevant}</p>
                    <p className="text-xs text-muted leading-relaxed"><b>Limitations:</b> {strat.practical_limitations}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 italic">
                    Source: {strat.credible_source}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer Box */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-muted leading-relaxed">
            <b>Scientific & Operational Disclaimer:</b> {currentAssessment.scientific_disclaimer}
          </div>

        </div>
      )}

    </div>
  );
};
