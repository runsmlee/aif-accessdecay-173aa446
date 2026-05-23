import type { ScoredIntegration } from '../types';
import { KillListItem } from './KillListItem';

interface KillListProps {
  integrations: ScoredIntegration[];
  revokedIds: string[];
  onRevoke: (id: string) => void;
  onItemClick: (id: string) => void;
  selectedId: string | null;
}

export function KillList({
  integrations,
  revokedIds,
  onRevoke,
  onItemClick,
  selectedId,
}: KillListProps) {
  // Sort by descending risk score (defensive - integrations should already be sorted)
  const sorted = [...integrations].sort((a, b) => {
    if (b.risk_score !== a.risk_score) return b.risk_score - a.risk_score;
    return a.integration_name.localeCompare(b.integration_name);
  });
  const activeItems = sorted.filter((i) => !revokedIds.includes(i.id));
  const revokedItems = sorted.filter((i) => revokedIds.includes(i.id));

  if (integrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center mb-5">
          <svg className="h-8 w-8 text-text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-secondary">No integrations yet</p>
        <p className="text-xs text-text-faint mt-1.5 text-center max-w-[280px] leading-relaxed">
          Upload a CSV of your SaaS integrations to generate a risk-ranked kill list
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Queue */}
      <section aria-label="Active integrations queue">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xs font-semibold text-text-faint uppercase tracking-widest">
            Active Queue
          </h2>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tabular-nums">
            {activeItems.length}
          </span>
        </div>
        {activeItems.length > 0 ? (
          <ul className="space-y-2" role="list">
            {activeItems.map((integration, index) => (
              <div
                key={integration.id}
                className="stagger-item"
                style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
              >
                <KillListItem
                  integration={integration}
                  isRevoked={false}
                  isSelected={selectedId === integration.id}
                  onRevoke={onRevoke}
                  onClick={onItemClick}
                />
              </div>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-3 py-6 px-4 rounded-xl bg-surface-raised border border-border">
            <div className="w-8 h-8 rounded-full bg-severity-success-bg flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-severity-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">
              All integrations have been reviewed. Nice work!
            </p>
          </div>
        )}
      </section>

      {/* Revoked Section */}
      {revokedItems.length > 0 && (
        <section aria-label="Revoked integrations">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-semibold text-text-faint uppercase tracking-widest">
              Revoked
            </h2>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-text-faint/10 text-text-faint text-[11px] font-semibold tabular-nums">
              {revokedItems.length}
            </span>
          </div>
          <ul className="space-y-1" role="list">
            {revokedItems.map((integration) => (
              <KillListItem
                key={integration.id}
                integration={integration}
                isRevoked={true}
                isSelected={selectedId === integration.id}
                onRevoke={onRevoke}
                onClick={onItemClick}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
