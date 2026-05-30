import { useState, useCallback, useRef } from 'react';
import type { Integration } from '../types';
import { parseCSV } from '../lib/csvParser';

interface CSVUploaderProps {
  onUpload: (integrations: Integration[], skippedCount: number) => void;
}

export function CSVUploader({ onUpload }: CSVUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
        setError('Please upload a CSV file.');
        return;
      }

      setIsLoading(true);
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const result = parseCSV(content);
          onUpload(result.integrations, result.skippedCount);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Failed to parse CSV file.'
          );
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read file.');
        setIsLoading(false);
      };

      reader.readAsText(file);
    },
    [onUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so same file can be re-uploaded
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [handleFile]
  );

  return (
    <div className="space-y-3">
      <label
        htmlFor="csv-upload"
        className="group inline-flex items-center gap-2 h-9 px-4 bg-surface-raised border border-border text-text-secondary text-sm font-medium rounded-lg cursor-pointer hover:text-text hover:bg-surface-light hover:border-border-strong active:scale-[0.98] transition-all duration-150 select-none focus-within:ring-2 focus-within:ring-border-focus focus-within:ring-offset-2 focus-within:ring-offset-surface"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing…
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Use your own data
          </>
        )}
        <input
          ref={inputRef}
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="sr-only"
          aria-label="Upload CSV file"
          disabled={isLoading}
        />
      </label>

      {error && (
        <div className="flex items-center gap-2 text-sm text-primary animate-fade-in" role="alert">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <details className="text-sm text-text-faint group/details">
        <summary className="cursor-pointer hover:text-text-muted transition-colors inline-flex items-center gap-1 text-xs">
          <svg className="h-3.5 w-3.5 transition-transform group-open/details:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
          Expected CSV format
        </summary>
        <div className="mt-3 p-4 bg-surface-raised border border-border rounded-xl font-mono text-xs overflow-x-auto animate-slide-down">
          <p className="text-text-faint leading-relaxed">
            integration_name,service,data_access_level,integration_depth,
          </p>
          <p className="text-text-faint leading-relaxed">
            last_activity_date,owner_email,owner_active
          </p>
          <p className="text-text-muted mt-2 pt-2 border-t border-border leading-relaxed">
            Salesforce Sync,Salesforce,5,4,2024-01-15,admin@co.com,true
          </p>
        </div>
      </details>
    </div>
  );
}
