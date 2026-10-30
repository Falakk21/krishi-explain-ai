import React from 'react';
import { AlertTriangle, ShieldCheck, AlertOctagon, Info } from 'lucide-react';
import { RiskIndicator } from '../types';

interface RiskIndicatorBadgeProps {
  indicator: RiskIndicator;
}

export const RiskIndicatorBadge: React.FC<RiskIndicatorBadgeProps> = ({ indicator }) => {
  const { category, level, score, description, threshold_info } = indicator;

  const getStyle = () => {
    switch (level) {
      case 'Critical':
        return {
          bg: 'bg-red-50 border-red-300 text-red-900',
          badge: 'bg-red-700 text-white',
          icon: <AlertOctagon className="w-4 h-4 text-red-700" />,
          bar: 'bg-red-600',
        };
      case 'High':
        return {
          bg: 'bg-orange-50 border-orange-300 text-orange-900',
          badge: 'bg-risk text-white',
          icon: <AlertTriangle className="w-4 h-4 text-risk" />,
          bar: 'bg-risk',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
          badge: 'bg-warning text-white',
          icon: <AlertTriangle className="w-4 h-4 text-warning" />,
          bar: 'bg-warning',
        };
      case 'Low':
      default:
        return {
          bg: 'bg-mint-light border-sage/60 text-forest-dark',
          badge: 'bg-forest text-white',
          icon: <ShieldCheck className="w-4 h-4 text-forest" />,
          bar: 'bg-forest',
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`p-4 rounded-xl border shadow-subtle ${style.bg} transition-all duration-200 hover:shadow-card`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {style.icon}
          <h4 className="font-semibold text-sm">{category}</h4>
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${style.badge}`}>
          {level}
        </span>
      </div>

      <div className="w-full bg-white/70 rounded-full h-1.5 mb-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
          style={{ width: `${Math.min(100, Math.max(8, score))}%` }}
        />
      </div>

      <p className="text-xs leading-relaxed mb-2 opacity-95">{description}</p>
      
      <div className="flex items-center gap-1 text-[11px] opacity-75 pt-1 border-t border-black/5">
        <Info className="w-3 h-3 flex-shrink-0" />
        <span>{threshold_info}</span>
      </div>
    </div>
  );
};
