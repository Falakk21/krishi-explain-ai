import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell
} from 'recharts';
import {
  Sliders, RotateCcw, ArrowRight, AlertTriangle, TrendingDown,
  TrendingUp, Thermometer, CloudRain, ShieldAlert, Sparkles, Check
} from 'lucide-react';
import { api } from '../services/api';
import { ScenarioInput, SimulationResult } from '../types';
import { useApp, DEFAULT_DEMO_INPUT } from '../context/AppContext';
import { DemoBadge } from '../components/DemoBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

const SCENARIO_PRESETS = [
  {
    name: "Representative Conditions",
    temp: 0.0,
    rain: 0.0,
    heatDays: 0,
    desc: "Representative mean conditions from the collected Punjab records; not a single observed season."
  },
  {
    name: "Warmer Rabi (+2.0°C)",
    temp: 2.0,
    rain: 0.0,
    heatDays: 5,
    desc: "Projected moderate mid-century warming under IPCC SSP2-4.5."
  },
  {
    name: "Reduced Rainfall (-25%)",
    temp: 0.0,
    rain: -25.0,
    heatDays: 0,
    desc: "Weak Western Disturbances causing winter rainfall deficit."
  },
  {
    name: "Combined Heat & Drought (+3.0°C, -30% Rain)",
    temp: 3.0,
    rain: -30.0,
    heatDays: 9,
    desc: "Severe dual-stress analog resembling March 2022 heat shock."
  },
  {
    name: "Extreme Heat Shock (+4.5°C, -40% Rain)",
    temp: 4.5,
    rain: -40.0,
    heatDays: 16,
    desc: "High-emissions scenario testing crop physiological limits."
  }
];

export const ClimateSimulator: React.FC = () => {
  const { demoMode, isBackendOnline } = useApp();

  const [scenarioName, setScenarioName] = useState<string>("Custom Climate Scenario");
  const [deltaTemp, setDeltaTemp] = useState<number>(2.0);
  const [deltaRain, setDeltaRain] = useState<number>(-20.0);
  const [deltaHeatDays, setDeltaHeatDays] = useState<number>(5);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async (
    name = scenarioName,
    t = deltaTemp,
    r = deltaRain,
    h = deltaHeatDays
  ) => {
    setLoading(true);
    setError(null);
    try {
      const payload: ScenarioInput = {
        baseline_input: DEFAULT_DEMO_INPUT,
        delta_temperature: t,
        delta_rainfall_pct: r,
        delta_heat_wave_days: h,
        scenario_name: name
      };
      const res = await api.simulateScenario(payload, demoMode);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Simulation encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [demoMode]);

  const handleApplyPreset = (preset: typeof SCENARIO_PRESETS[0]) => {
    setScenarioName(preset.name);
    setDeltaTemp(preset.temp);
    setDeltaRain(preset.rain);
    setDeltaHeatDays(preset.heatDays);
    runSimulation(preset.name, preset.temp, preset.rain, preset.heatDays);
  };

  const handleReset = () => {
    handleApplyPreset(SCENARIO_PRESETS[0]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sage/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-forest">What-If Climate Scenarios</span>
            <DemoBadge isDemo={demoMode || !isBackendOnline} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest-dark tracking-tight">
            What If the Climate Changes?
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Explore hypothetical climate conditions, not weather forecasts, and compare how estimated yield and contributing factors change.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-cream border border-sage/60 text-forest-dark shadow-subtle transition-all"
        >
          <RotateCcw className="w-4 h-4 text-forest" />
          <span>Reset to Representative Conditions (0°C, 0% Rain)</span>
        </button>
      </div>

      {/* Preset Pills */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted">Scenario Presets</label>
        <div className="flex flex-wrap gap-2">
          {SCENARIO_PRESETS.map((p, idx) => {
            const isSelected = scenarioName === p.name;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-forest text-white border-forest shadow-card'
                    : 'bg-white hover:bg-cream text-charcoal border-sage/40 shadow-subtle'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-sage-light" />}
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Sliders Panel */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sage/40 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-bold text-base text-forest-dark flex items-center gap-2">
            <Sliders className="w-5 h-5 text-forest" />
            <span>Simulate Climate Perturbations</span>
          </h3>
          <span className="text-xs text-muted">Crop: Rabi Wheat • Region: Ludhiana, Punjab</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Temperature Perturbation */}
          <div className="space-y-3 p-4 rounded-2xl bg-cream/70 border border-sage/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-forest" />
                <span>Delta Temperature</span>
              </span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded border ${
                deltaTemp > 2.0 ? 'bg-red-50 text-risk border-red-300' : 'bg-white text-forest-dark border-sage/40'
              }`}>
                {deltaTemp > 0 ? `+${deltaTemp}` : deltaTemp} °C
              </span>
            </div>
            <input
              type="range"
              min={-2.0}
              max={6.0}
              step={0.5}
              value={deltaTemp}
              onChange={(e) => setDeltaTemp(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>-2.0°C (Cooler)</span>
              <span>0.0°C (Baseline)</span>
              <span>+6.0°C (Severe)</span>
            </div>
          </div>

          {/* Rainfall Perturbation */}
          <div className="space-y-3 p-4 rounded-2xl bg-cream/70 border border-sage/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-forest" />
                <span>Delta Rainfall (%)</span>
              </span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded border ${
                deltaRain < -20.0 ? 'bg-red-50 text-risk border-red-300' : 'bg-white text-forest-dark border-sage/40'
              }`}>
                {deltaRain > 0 ? `+${deltaRain}` : deltaRain} %
              </span>
            </div>
            <input
              type="range"
              min={-50.0}
              max={60.0}
              step={5.0}
              value={deltaRain}
              onChange={(e) => setDeltaRain(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>-50% (Drought)</span>
              <span>0% (Normal)</span>
              <span>+60% (Excess)</span>
            </div>
          </div>

          {/* Additional Heatwave Days */}
          <div className="space-y-3 p-4 rounded-2xl bg-cream/70 border border-sage/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-warning" />
                <span>Delta Terminal Heat Days</span>
              </span>
              <span className="text-xs font-extrabold text-forest-dark px-2 py-0.5 rounded bg-white border border-sage/40">
                {deltaHeatDays > 0 ? `+${deltaHeatDays}` : deltaHeatDays} days
              </span>
            </div>
            <input
              type="range"
              min={-4}
              max={20}
              step={1}
              value={deltaHeatDays}
              onChange={(e) => setDeltaHeatDays(parseInt(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>-4 days</span>
              <span>0 days</span>
              <span>+20 days</span>
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => runSimulation()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-forest hover:bg-forest-dark shadow-card active:scale-95 disabled:opacity-50 text-xs"
          >
            <span>Execute Climate Simulation</span>
            <ArrowRight className="w-4 h-4 text-sage-light" />
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner message="Simulating agro-climatic perturbations..." />}
      {error && <div className="p-4 rounded-xl bg-red-50 text-risk text-sm">{error}</div>}

      {/* Extrapolation Warning Alert if User exceeds historical bounds */}
      {result?.is_extrapolation_warning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-warning text-xs flex items-center gap-3 shadow-subtle">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-warning" />
          <div>
            <b>Extrapolation Notice</b>: {result.extrapolation_note}.
            These conditions fall outside the range of available historical observations. Treat the results as illustrative, not as validated expectations.
          </div>
        </div>
      )}

      {/* Simulation Comparison Results */}
      {result && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Comparison KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle">
              <span className="text-xs font-semibold text-muted uppercase">Baseline Yield</span>
              <div className="text-2xl font-extrabold text-charcoal mt-1">
                {result.baseline_prediction.toFixed(2)} <span className="text-xs text-muted">t/ha</span>
              </div>
              <span className="text-[11px] text-muted mt-1 block">Unperturbed reference state</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle">
              <span className="text-xs font-semibold text-muted uppercase">Scenario Projected Yield</span>
              <div className="text-2xl font-extrabold text-forest-dark mt-1">
                {result.scenario_prediction.toFixed(2)} <span className="text-xs text-muted">t/ha</span>
              </div>
              <span className="text-[11px] text-muted mt-1 block">Under simulated climate stress</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle">
              <span className="text-xs font-semibold text-muted uppercase">Absolute Yield Shift</span>
              <div className={`text-2xl font-extrabold mt-1 flex items-center gap-1 ${
                result.absolute_difference >= 0 ? 'text-green-600' : 'text-risk'
              }`}>
                {result.absolute_difference >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span>{result.absolute_difference >= 0 ? `+${result.absolute_difference}` : result.absolute_difference} t/ha</span>
              </div>
              <span className="text-[11px] text-muted mt-1 block">Net impact on productivity</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle">
              <span className="text-xs font-semibold text-muted uppercase">Percentage Impact</span>
              <div className={`text-2xl font-extrabold mt-1 ${
                result.percentage_difference >= 0 ? 'text-green-600' : 'text-risk'
              }`}>
                {result.percentage_difference >= 0 ? `+${result.percentage_difference}` : result.percentage_difference}%
              </div>
              <span className="text-[11px] text-muted mt-1 block">Relative to baseline</span>
            </div>

          </div>

          {/* Visual Comparison Chart */}
          <div className="p-6 rounded-3xl bg-white border border-sage/40 shadow-card space-y-4">
            <h3 className="font-bold text-base text-forest-dark">
              Baseline vs. Scenario Yield Comparison
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Baseline Conditions', yield: result.baseline_prediction, fill: '#174D38' },
                    { name: result.scenario_name, yield: result.scenario_prediction, fill: result.absolute_difference < 0 ? '#DC2626' : '#16A34A' }
                  ]}
                  margin={{ top: 15, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#1F2937' }} />
                  <YAxis unit=" t/ha" domain={[0, 6.5]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} t/ha`, 'Yield']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #A8C3A0', fontSize: '12px' }}
                  />
                  <Bar dataKey="yield" radius={[6, 6, 0, 0]}>
                    <Cell fill="#174D38" />
                    <Cell fill={result.absolute_difference < 0 ? '#DC2626' : '#16A34A'} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Explanation & Risk Shift Banner */}
          <div className="p-6 rounded-2xl bg-mint/50 border border-sage/60 shadow-subtle space-y-3">
            <h4 className="text-sm font-bold text-forest-dark uppercase tracking-wider">
              Simulation Findings & Vulnerability Transition
            </h4>
            <p className="text-xs sm:text-sm text-charcoal/90 leading-relaxed font-normal">
              {result.explanation}
            </p>
            <div className="p-3 rounded-xl bg-white border border-sage/40 text-xs font-semibold text-forest-dark flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-forest" />
              <span>{result.risk_shift}</span>
            </div>
          </div>

          {/* Shift in Climate Factor Contributions */}
          <div className="bg-white p-6 rounded-2xl border border-sage/40 shadow-card space-y-4">
            <h4 className="text-base font-bold text-forest-dark">Change in Climate Factor Contributions</h4>
            {result.feature_contribution_changes.length > 0 ? <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-muted uppercase text-[11px]">
                    <th className="pb-2">Feature</th>
                    <th className="pb-2">Baseline Value</th>
                    <th className="pb-2">Scenario Value</th>
                    <th className="pb-2">Baseline Contribution</th>
                    <th className="pb-2">Scenario Contribution</th>
                    <th className="pb-2">Contribution Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.feature_contribution_changes.map((item, idx) => (
                    <tr key={idx} className="hover:bg-cream/40 transition-colors">
                      <td className="py-2.5 font-bold text-charcoal">{item.feature_label}</td>
                      <td className="py-2.5 text-muted">{item.baseline_value} {item.unit}</td>
                      <td className="py-2.5 font-semibold text-forest-dark">{item.scenario_value} {item.unit}</td>
                      <td className="py-2.5 text-muted">{item.baseline_shap >= 0 ? `+${item.baseline_shap}` : item.baseline_shap}</td>
                      <td className="py-2.5 font-medium">{item.scenario_shap >= 0 ? `+${item.scenario_shap}` : item.scenario_shap}</td>
                      <td className={`py-2.5 font-bold ${item.delta_shap >= 0 ? 'text-green-600' : 'text-risk'}`}>
                        {item.delta_shap >= 0 ? `+${item.delta_shap}` : item.delta_shap} t/ha
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> : (
              <p className="text-sm text-muted">
                {result.is_demo
                  ? 'Factor contribution details are unavailable for demonstration estimates.'
                  : 'No factor contribution changes are available for this result.'}
              </p>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
