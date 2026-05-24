import { useEffect, useCallback, useState } from 'react';
import { CSVUploader } from './components/CSVUploader';
import { KillList } from './components/KillList';
import { useIntegrations } from './hooks/useIntegrations';
import type { Integration } from './types';

function trackEvent(event: string, props?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.aif?.track) {
    window.aif.track(event, props);
  }
}

export default function App() {
  const {
    integrations,
    revokedIds,
    addIntegrations,
    revokeIntegration,
    resetToDemo,
    selectedId,
    setSelectedId,
  } = useIntegrations();

  const [skipNotification, setSkipNotification] = useState<number | null>(null);

  useEffect(() => {
    trackEvent('page_view', { path: window.location.pathname });
  }, []);

  const handleUpload = useCallback(
    (newIntegrations: Integration[], skippedCount: number) => {
      addIntegrations(newIntegrations);
      trackEvent('csv_uploaded', {
        count: newIntegrations.length,
        skipped: skippedCount,
      });
      if (skippedCount > 0) {
        setSkipNotification(skippedCount);
      }
    },
    [addIntegrations]
  );

  const handleRevoke = useCallback(
    (id: string) => {
      revokeIntegration(id);
      trackEvent('integration_revoked', { integration_id: id });
    },
    [revokeIntegration]
  );

  const handleLoadDemo = useCallback(() => {
    resetToDemo();
    trackEvent('demo_data_loaded');
  }, [resetToDemo]);

  const handleItemClick = useCallback(
    (id: string) => {
      const newSelected = selectedId === id ? null : id;
      setSelectedId(newSelected);
      if (newSelected) {
        trackEvent('risk_breakdown_opened', { integration_id: id });
        trackEvent('integration_detail_viewed', { integration_id: id });
      }
    },
    [selectedId, setSelectedId]
  );

  const totalActive = integrations.filter((i) => !revokedIds.includes(i.id)).length;
  const totalRevoked = revokedIds.length;

  return (
    <div className="min-h-screen bg-surface bg-grid font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface-overlay backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h1 className="text-base font-semibold text-text tracking-tight">AccessDecay</h1>
            <span className="hidden sm:inline-block text-xs text-text-faint border-l border-border pl-3 ml-1">
              SaaS kill list — ranked by risk, ready to revoke
            </span>
          </div>

          {/* Status indicators */}
          {integrations.length > 0 && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-severity-success" aria-hidden="true"></span>
                <span className="text-text-muted">{totalActive} active</span>
              </div>
              {totalRevoked > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-faint" aria-hidden="true"></span>
                  <span className="text-text-muted">{totalRevoked} revoked</span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
        {/* Kill List Queue Header */}
        <section aria-label="Upload and manage integrations">
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text tracking-tight">Kill List Queue</h2>
              <p className="text-sm text-text-faint mt-1">
                {integrations.length === 0
                  ? 'Load demo data or upload your integrations CSV'
                  : `${totalActive} integration${totalActive !== 1 ? 's' : ''} pending review`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleLoadDemo}
                className="group inline-flex items-center gap-1.5 h-10 px-4 bg-surface-raised border border-primary/25 text-primary text-sm font-medium rounded-lg hover:bg-primary/10 hover:border-primary/40 active:scale-[0.98] transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-surface"
                aria-label="Load demo data"
              >
                <svg className="h-3.5 w-3.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Load demo data
              </button>
              <CSVUploader onUpload={handleUpload} />
            </div>
          </div>

          {/* Skip Notification */}
          {skipNotification !== null && (
            <div
              className="mb-6 flex items-center gap-3 px-4 py-3 bg-severity-medium-bg border border-severity-medium/20 rounded-xl text-sm animate-slide-down"
              role="status"
            >
              <svg className="h-4 w-4 text-severity-medium shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-severity-medium">
                {skipNotification} row{skipNotification !== 1 ? 's' : ''} skipped due to missing data
              </span>
              <button
                type="button"
                onClick={() => setSkipNotification(null)}
                className="ml-auto text-severity-medium/60 hover:text-severity-medium transition-colors"
                aria-label="Dismiss notification"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <KillList
            integrations={integrations}
            revokedIds={revokedIds}
            onRevoke={handleRevoke}
            onItemClick={handleItemClick}
            selectedId={selectedId}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between text-xs text-text-faint">
          <span>AccessDecay</span>
          <span>Prioritize and revoke dormant SaaS integrations</span>
        </div>
      </footer>
    </div>
  );
}
