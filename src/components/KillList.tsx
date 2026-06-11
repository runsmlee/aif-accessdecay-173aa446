import type { ScoredIntegration } from '../types';
import { KillListItem } from './KillListItem';

interface KillListProps {
  integrations: ScoredIntegration[];
  revokedIds: string[];
  onRevoke: (id: string) => void;
  onItemClick: (id: string) => void;
  selectedId: string | null;
  isDemo: boolean;
}

export function KillList({
  integrations,
  revokedIds,
  onRevoke,
  onItemClick,
  selectedId,
  isDemo,
}: KillListProps) {
  // Sort by descending risk score (defensive - integrations should already be sorted)
  const sorted = [...integrations].sort((a, b) => {
    if (b.risk_score !== a.risk_score) return b.risk_score - a.risk_score;
    return a.integration_name.localeCompare(b.integration_name);
  });
  const activeItems = sorted.filter((i) => !revokedIds.includes(i.id));
  const revokedItems = sorted.filter((i) => revokedIds.includes(i.id));

  if (integrations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Active Queue */}
      <section aria-label="Active integrations queue">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-medium text-text-faint uppercase tracking-wider">
            Active Queue · {activeItems.length}
          </h2>
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
                  isDemo={isDemo}
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
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-medium text-text-faint uppercase tracking-wider">
              Revoked · {revokedItems.length}
            </h2>
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
                isDemo={false}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
