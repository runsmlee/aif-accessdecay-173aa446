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
        uploadRealData(newIntegrations);
      } else {
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
      if (isDemo) return;
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

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
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
    },
    [handleUpload]
  );

  const totalActive = integrations.filter((i) => !revokedIds.includes(i.id)).length;
  const totalRevoked = revokedIds.length;

  return (
    <div className="min-h-screen bg-surface bg-grid font-sans flex flex-col">
      {/* Minimal header — brand + upload action */}
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

          {/* Actions — upload always accessible */}
          <div className="flex items-center gap-4 text-xs">
            {isDemo ? (
              <button
                type="button"
                onClick={triggerFileUpload}
                className="group inline-flex items-center gap-2 h-8 px-3 bg-primary/8 text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white hover:border-primary active:scale-[0.97] transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-border-focus text-xs font-medium"
                aria-label="Upload your CSV"
              >
                <svg className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload CSV
              </button>
            ) : (
              <>
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
              </>
            )}
            {/* Hidden file input for header upload button */}
            {isDemo && (
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="sr-only"
                aria-label="Upload CSV file"
                onChange={handleFileInputChange}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content — the kill list IS the page, nothing before it */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-6">
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
