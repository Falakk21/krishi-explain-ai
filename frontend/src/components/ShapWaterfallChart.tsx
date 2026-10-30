import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine
} from 'recharts';
import { FeatureContribution } from '../types';

interface ShapWaterfallChartProps {
  baseValue: number;
  finalPrediction: number;
  contributions: FeatureContribution[];
  unit?: string;
}

export const ShapWaterfallChart: React.FC<ShapWaterfallChartProps> = ({
  baseValue,
  finalPrediction,
  contributions,
  unit = "t/ha"
}) => {
  // Construct waterfall segments
  let currentLevel = baseValue;
  
  const chartData: any[] = [
    {
      name: "Base Value",
      fullLabel: "Regional Yield Baseline",
      invisibleBottom: 0,
      barHeight: Number(baseValue.toFixed(2)),
      shapVal: 0,
      observed: baseValue.toFixed(2),
      unit,
      isTotal: true,
      color: "#174D38", // Forest Green
      tooltipText: `Average regional yield across the historical Punjab Rabi records.`
    }
  ];

  contributions.forEach((c) => {
    const val = c.shap_value;
    const start = val >= 0 ? currentLevel : currentLevel + val;
    const height = Math.abs(val);
    
    chartData.push({
      name: c.feature_label.length > 15 ? c.feature_label.slice(0, 14) + '…' : c.feature_label,
      fullLabel: c.feature_label,
      invisibleBottom: Number(Math.max(0, start).toFixed(2)),
      barHeight: Number(height.toFixed(2)),
      shapVal: val,
      observed: c.observed_value,
      unit: c.unit,
      isTotal: false,
      color: val >= 0 ? "#16A34A" : "#DC2626", // Green for positive, Red for negative
      tooltipText: c.interpretation
    });

    currentLevel += val;
  });

  chartData.push({
    name: "Prediction",
    fullLabel: "Final Predicted Yield",
    invisibleBottom: 0,
    barHeight: Number(finalPrediction.toFixed(2)),
    shapVal: Number((finalPrediction - baseValue).toFixed(2)),
    observed: finalPrediction.toFixed(2),
    unit,
    isTotal: true,
    color: "#103C2C", // Deep Green
    tooltipText: `Net predicted yield: ${finalPrediction.toFixed(2)} ${unit}`
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-elevated border border-sage/50 text-xs max-w-xs z-50">
          <p className="font-bold text-forest text-sm mb-1">{data.fullLabel}</p>
          {data.isTotal ? (
            <p className="font-semibold text-charcoal">
              Value: <span className="text-forest-dark">{data.barHeight} {unit}</span>
            </p>
          ) : (
            <>
              <p className="text-gray-600 mb-0.5">
                Observed: <span className="font-medium text-charcoal">{data.observed} {data.unit}</span>
              </p>
              <p className={`font-bold mb-1 ${data.shapVal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Contribution: {data.shapVal >= 0 ? `+${data.shapVal}` : data.shapVal} {unit}
              </p>
            </>
          )}
          <p className="text-[11px] text-gray-700 italic border-t border-gray-100 pt-1 mt-1">
            {data.tooltipText}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white p-5 rounded-2xl border border-sage/40 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-base font-bold text-forest-dark">Yield Factor Contributions</h4>
          <p className="text-xs text-muted">
            How the regional baseline ({baseValue.toFixed(2)} {unit}) compares with this estimate ({finalPrediction.toFixed(2)} {unit}) and its contributing factors.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-600 inline-block" />
            <span>Positive Attribution (Increases Yield)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-600 inline-block" />
            <span>Negative Attribution (Reduces Yield)</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              angle={-20}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 11, fill: '#374151' }}
            />
            <YAxis
              unit={` ${unit}`}
              domain={[0, 'auto']}
              tick={{ fontSize: 11, fill: '#374151' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={baseValue} stroke="#174D38" strokeDasharray="4 4" label={{ value: 'Baseline', fill: '#174D38', fontSize: 10, position: 'right' }} />
            {/* Transparent base bar */}
            <Bar dataKey="invisibleBottom" stackId="waterfall" fill="transparent" />
            {/* Value bar */}
            <Bar dataKey="barHeight" stackId="waterfall" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-center">
        <span className="text-[11px] text-muted">
          Estimated yield ({finalPrediction.toFixed(2)} {unit}) = Regional baseline ({baseValue.toFixed(2)} {unit}) + factor contributions
        </span>
      </div>
    </div>
  );
};
