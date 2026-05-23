import type { ScoredIntegration } from '../types';

interface RiskBreakdownProps {
  integration: ScoredIntegration;
}

const FACTOR_LABELS = [
  { key: 'dataAccessWeighted' as const, label: 'Data Access Level', icon: 'shield' },
  { key: 'integrationDepthWeighted' as const, label: 'Integration Depth', icon: 'link' },
  { key: 'dormancyWeighted' as const, label: 'Days Dormant', icon: 'clock' },
  { key: 'ownerChurnWeighted' as const, label: 'Owner Churn Factor', icon: 'user' },
];

function FactorIcon({ icon }: { icon: string }) {
  const iconClass = "h-3.5 w-3.5";
  switch (icon) {
    case 'shield':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'link':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      );
    case 'clock':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case 'user':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
      );
    default:
      return null;
  }
}

function ScoreBar({ value, maxScore = 100 }: { value: number; maxScore?: number }) {
  const percentage = Math.min((value / maxScore) * 100, 100);
  const barColor = value >= 30 ? 'bg-severity-high' : value >= 15 ? 'bg-severity-medium' : 'bg-text-faint';

  return (
    <div className="w-16 h-1 bg-border rounded-full overflow-hidden" aria-hidden="true">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}

export function RiskBreakdown({ integration }: RiskBreakdownProps) {
  const { factors, risk_score, days_dormant, data_access_level, integration_depth, owner_active } = integration;

  const rawValues: Record<string, string | number | boolean> = {
    dataAccessWeighted: `${data_access_level}/5`,
    integrationDepthWeighted: `${integration_depth}/5`,
    dormancyWeighted: `${days_dormant} days`,
    ownerChurnWeighted: owner_active ? 'Active' : 'Left company',
  };

  return (
    <div className="mx-4 sm:mx-5 mb-4 mt-1 bg-surface border border-border rounded-xl overflow-hidden" role="region" aria-label="Risk factor breakdown">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-raised/50">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Risk Breakdown
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-text-faint">Total</span>
          <span className="text-lg font-bold text-primary tabular-nums leading-none">{risk_score}</span>
        </div>
      </div>

      {/* Factor Rows */}
      <div className="divide-y divide-border">
        {FACTOR_LABELS.map(({ key, label, icon }) => {
          const value = factors[key];
          return (
            <div key={key} className="flex items-center justify-between px-4 py-2.5 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-text-faint shrink-0">
                  <FactorIcon icon={icon} />
                </span>
                <span className="text-sm text-text-secondary truncate">{label}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-text-faint tabular-nums">{rawValues[key]}</span>
                <ScoreBar value={value} />
                <span className="text-sm font-semibold text-text tabular-nums min-w-[36px] text-right">
                  {value.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
