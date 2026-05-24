import { useState, useEffect, useCallback } from 'react';
import type { Integration, ScoredIntegration } from '../types';
import { rankIntegrations } from '../lib/scoring';
import { getDemoIntegrations } from '../lib/demoData';

const STORAGE_KEY = 'accessdecay-integrations';
const REVOKED_KEY = 'accessdecay-revoked';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch {
    // Ignore parse errors
  }
  return fallback;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

export function useIntegrations() {
  const [rawIntegrations, setRawIntegrations] = useState<Integration[]>(() => {
    const stored = loadFromStorage<Integration[]>(STORAGE_KEY, []);
    if (stored.length > 0) return stored;
    // Auto-load demo data on first visit — empty kill list is a broken promise
    const demo = getDemoIntegrations();
    saveToStorage(STORAGE_KEY, demo);
    return demo;
  });
  const [revokedIds, setRevokedIds] = useState<string[]>(() =>
    loadFromStorage<string[]>(REVOKED_KEY, [])
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Persist to localStorage on changes
  useEffect(() => {
    saveToStorage(STORAGE_KEY, rawIntegrations);
  }, [rawIntegrations]);

  useEffect(() => {
    saveToStorage(REVOKED_KEY, revokedIds);
  }, [revokedIds]);

  const scoredIntegrations: ScoredIntegration[] = rankIntegrations(rawIntegrations);

  const addIntegrations = useCallback((newIntegrations: Integration[]) => {
    setRawIntegrations((prev) => {
      // Merge: add new, skip duplicates by id
      const existingIds = new Set(prev.map((i) => i.id));
      const unique = newIntegrations.filter((i) => !existingIds.has(i.id));
      return [...prev, ...unique];
    });
  }, []);

  const revokeIntegration = useCallback((id: string) => {
    setRevokedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const resetToDemo = useCallback(() => {
    const demo = getDemoIntegrations();
    setRawIntegrations(demo);
    setRevokedIds([]);
    setSelectedId(null);
  }, []);

  const isRevoked = useCallback(
    (id: string) => revokedIds.includes(id),
    [revokedIds]
  );

  return {
    integrations: scoredIntegrations,
    revokedIds,
    addIntegrations,
    revokeIntegration,
    resetToDemo,
    isRevoked,
    selectedId,
    setSelectedId,
  };
}
