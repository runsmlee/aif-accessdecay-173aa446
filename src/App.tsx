import { useEffect, useCallback, useRef, useState } from 'react';
import { CSVUploader } from './components/CSVUploader';
import { KillList } from './components/KillList';
import { useIntegrations } from './hooks/useIntegrations';
import { parseCSV } from './lib/csvParser';
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
    isDemo,
    uploadRealData,
    addIntegrations,
    revokeIntegration,
    selectedId,
    setSelectedId,
  } = useIntegrations();

  const [skipNotification, setSkipNotification] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackEvent('page_view', { path: window.location.pathname });
  }, []);

  const handleUpload = useCallback(
    (newIntegrations: Integration[], skippedCount: number) => {
      if (isDemo) {
        // First upload replaces demo data entirely
        uploadRealData(newIntegrations);
      } else {
        // Subsequent uploads merge into existing data
        addIntegrations(newIntegrations);
      }
      trackEvent('csv_uploaded', {
        count: newIntegrations.length,
        skipped: skippedCount,
      });
      if (skippedCount > 0) {
        setSkipNotification(skippedCount);
      }
    },
    [isDemo, uploadRealData, addIntegrations]
  );

  const handleRevoke = useCallback(
    (id: string) => {
      if (isDemo) return; // Demo mode: revoke is handled by KillListItem showing message
      revokeIntegration(id);
      trackEvent('integration_revoked', { integration_id: id });
    },
    [isDemo, revokeIntegration]
  );

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

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const totalActive = integrations.filter((i) => !revokedIds.includes(i.id)).length;
  const totalRevoked = revokedIds.length;

  return (
    <div className="min-h-screen bg-surface bg-grid font-sans flex flex-col">
      {/* Minimal header — brand only */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface-overlay backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
              <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="text-sm font-semibold text-text tracking-tight">AccessDecay</h1>
          </div>

          {/* Status — only show when real data is loaded */}
          {!isDemo && integrations.length > 0 && (
            <div className="flex items-center gap-4 text-xs">
              <CSVUploader onUpload={handleUpload} />
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

      {/* Main Content — the kill list IS the page */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-6">
        {/* Demo CTA banner — only visible before CSV upload */}
        {isDemo && (
          <div className="mb-5 animate-fade-in">
            <button
              type="button"
              onClick={triggerFileUpload}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/8 border border-primary/15 text-sm font-medium text-primary hover:bg-primary/12 hover:border-primary/25 active:scale-[0.99] transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-border-focus"
              aria-label="Upload your CSV to see your real kill list"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              This is a demo. Upload your CSV to see your real kill list.
            </button>
            {/* Hidden file input triggered by the CTA */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="sr-only"
              aria-label="Upload CSV file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Use the CSVUploader's parsing logic via a manual trigger
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const content = ev.target?.result as string;
                      const result = parseCSV(content);
                      handleUpload(result.integrations, result.skippedCount);
                    } catch {
                      // Error handling done in CSVUploader
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = '';
                }
              }}
            />
          </div>
        )}

        {/* Skip Notification */}
        {skipNotification !== null && (
          <div
            className="mb-5 flex items-center gap-3 px-4 py-3 bg-severity-medium-bg border border-severity-medium/20 rounded-xl text-sm animate-slide-down"
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

        {/* The Kill List — THE interface */}
        <section aria-label="Kill list">
          <KillList
            integrations={integrations}
            revokedIds={revokedIds}
            onRevoke={handleRevoke}
            onItemClick={handleItemClick}
            selectedId={selectedId}
            isDemo={isDemo}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-text-faint">
          <span>AccessDecay</span>
          <span>Prioritize and revoke dormant SaaS integrations</span>
        </div>
      </footer>
    </div>
  );
}
