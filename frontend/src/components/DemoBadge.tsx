import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface DemoBadgeProps {
  isDemo: boolean;
  className?: string;
  compact?: boolean;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ isDemo, className = '', compact = false }) => {
  if (isDemo) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-warning border border-amber-300 shadow-sm ${className}`}
        title="Demonstration estimate"
      >
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-warning" />
        <span>{compact ? "DEMO" : "DEMO DATA (SIMULATED)"}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-mint text-forest-dark border border-sage shadow-sm ${className}`}
      title="Estimate based on collected historical observations"
    >
      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-forest" />
      <span>{compact ? "OBSERVED DATA" : "HISTORICAL-DATA ESTIMATE"}</span>
    </div>
  );
};
