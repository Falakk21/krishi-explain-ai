import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';
import { GlobalFeatureImportance } from '../types';

interface GlobalImportanceChartProps {
  importances: GlobalFeatureImportance[];
}

export const GlobalImportanceChart: React.FC<GlobalImportanceChartProps> = ({ importances }) => {
  // Sort ascending for bottom-to-top rendering in horizontal bar chart
  const sorted = [...importances].reverse();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-elevated border border-sage/50 text-xs max-w-xs z-50">
          <p className="font-bold text-forest text-sm mb-1">{data.feature_label}</p>
          <p className="text-gray-700 mb-1">
            Average contribution: <span className="font-bold text-forest-dark">{data.mean_abs_shap} t/ha</span>
          </p>
          <p className="text-gray-500 text-[11px] leading-tight italic">
            Average change associated with this factor across historical observations.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white p-5 rounded-2xl border border-sage/40 shadow-card">
      <div className="mb-4">
        <h4 className="text-base font-bold text-forest-dark">Climate Factors Associated with Yield</h4>
        <p className="text-xs text-muted">
          Average contribution of each climate factor across historical observations.
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
            <XAxis
              type="number"
              unit=" t/ha"
              tick={{ fontSize: 11, fill: '#374151' }}
            />
            <YAxis
              type="category"
              dataKey="feature_label"
              width={160}
              tick={{ fontSize: 11, fill: '#1F2937' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="mean_abs_shap" fill="#174D38" radius={[0, 4, 4, 0]}>
              {sorted.map((_, index) => (
                <Cell key={`bar-${index}`} fill={index === sorted.length - 1 ? "#103C2C" : "#174D38"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-muted text-center mt-2">
        Higher values indicate higher sensitivity of wheat yield to variations in that environmental factor.
      </p>
    </div>
  );
};
