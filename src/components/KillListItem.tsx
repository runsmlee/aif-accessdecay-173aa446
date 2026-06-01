import { useState } from 'react';
import type { ScoredIntegration } from '../types';
import { RiskBreakdown } from './RiskBreakdown';

interface KillListItemProps {
  integration: ScoredIntegration;
  isRevoked: boolean;
  isSelected: boolean;
  onRevoke: (id: string) => void;
  onClick: (id: string) => void;
  isDemo: boolean;
}

function getOwnerDisplayName(email: string): string {
  const local = email.split('@')[0];
  return local
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getSeverityColors(score: number): { border: string; bg: string; text: string; glow: string } {
  if (score >= 80) return {
    border: 'border-l-severity-high',
    bg: 'bg-severity-high-bg',
    text: 'text-severity-high',
    glow: 'shadow-[inset_0_0_0_1px_rgba(239,68,68,0.1)]',
  };
  if (score >= 40) return {
    border: 'border-l-severity-medium',
    bg: 'bg-severity-medium-bg',
    text: 'text-severity-medium',
    glow: 'shadow-[inset_0_0_0_1px_rgba(245,158,11,0.1)]',
  };
  return {
    border: 'border-l-severity-low',
    bg: 'bg-severity-low-bg',
    text: 'text-severity-low',
    glow: '',
  };
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export function KillListItem({
  integration,
  isRevoked,
  isSelected,
  onRevoke,
  onClick,
  isDemo,
}: KillListItemProps) {
  const severity = getSeverityColors(integration.risk_score);
  const [showDemoMessage, setShowDemoMessage] = useState(false);

  const handleRevokeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDemo) {
      setShowDemoMessage(true);
      return;
    }
    onRevoke(integration.id);
  };

  return (
    <li
      role="listitem"
      className={`relative border-l-[3px] ${severity.border} rounded-r-xl transition-all duration-200 ${
        isRevoked
          ? 'bg-surface-raised/40 opacity-50'
          : isSelected
            ? 'bg-surface-raised shadow-glow-surface shadow-sm ring-1 ring-border'
            : `bg-surface-raised hover:bg-surface-light/60 hover:shadow-glow-surface hover:shadow-sm`
      }`}
      data-testid={`kill-item-${integration.id}`}
    >
      <div
        className="w-full text-left cursor-pointer px-4 py-3.5 sm:px-5 sm:py-4"
        onClick={() => onClick(integration.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(integration.id);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isSelected}
        aria-label={`${integration.integration_name} - ${integration.service}, risk score ${integration.risk_score}`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: Integration info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-medium text-text truncate leading-snug">
                {integration.integration_name}
              </h3>
              {isRevoked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-text-faint/10 text-text-faint shrink-0">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  Revoked
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-text-faint">{integration.service}</span>
              <span className="w-1 h-1 rounded-full bg-border-strong" aria-hidden="true"></span>
              <span className="text-xs text-text-faint tabular-nums">
                {integration.days_dormant}d dormant
              </span>
              {!integration.owner_active && (
                <>
                  <span className="w-1 h-1 rounded-full bg-severity-high" aria-hidden="true"></span>
                  <span className="text-xs text-severity-high font-medium">
                    {getOwnerDisplayName(integration.owner_email)} left
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: Score + Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Score pill */}
            <div className={`flex flex-col items-end tabular-nums ${isRevoked ? 'opacity-60' : ''}`}>
              <span className={`text-lg font-bold leading-none ${severity.text}`}>
                {integration.risk_score}
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-wider mt-0.5 ${severity.text} opacity-70`}>
                {getScoreLabel(integration.risk_score)}
              </span>
            </div>

            {/* Revoke button */}
            {!isRevoked && (
              <button
                type="button"
                onClick={handleRevokeClick}
                className="h-8 px-3 text-xs font-medium bg-primary/8 text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white hover:border-primary active:scale-[0.97] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-border-focus min-w-[64px]"
                aria-label={`Revoke ${integration.integration_name}`}
              >
                Revoke
              </button>
            )}

            {/* Expand chevron */}
            <svg
              className={`h-4 w-4 text-text-faint transition-transform duration-200 ${isSelected ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Demo revoke message */}
      {showDemoMessage && isDemo && (
        <div className="mx-4 sm:mx-5 mb-3 mt-1 px-3 py-2.5 bg-primary/8 border border-primary/15 rounded-lg text-xs text-primary font-medium animate-slide-down flex items-center gap-2">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Upload your CSV to revoke real integrations
        </div>
      )}

      {/* Expandable Risk Breakdown */}
      {isSelected && (
        <div className="animate-slide-down">
          <RiskBreakdown integration={integration} />
        </div>
      )}
    </li>
  );
}
