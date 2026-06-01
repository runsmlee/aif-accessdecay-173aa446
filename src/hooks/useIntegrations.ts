import { useState, useEffect, useCallback } from 'react';
import type { Integration, ScoredIntegration } from '../types';
import { rankIntegrations } from '../lib/scoring';
import { getDemoIntegrations } from '../lib/demoData';

const STORAGE_KEY = 'accessdecay-integrations';
const REVOKED_KEY = 'accessdecay-revoked';
const DEMO_FLAG_KEY = 'accessdecay-is-demo';

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
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    const stored = loadFromStorage<Integration[]>(STORAGE_KEY, []);
    // If no stored integrations, we start in demo mode
    if (stored.length === 0) return true;
    // If stored integrations exist, check the demo flag
    return loadFromStorage<boolean>(DEMO_FLAG_KEY, true);
  });

  const [rawIntegrations, setRawIntegrations] = useState<Integration[]>(() => {
    const stored = loadFromStorage<Integration[]>(STORAGE_KEY, []);
    if (stored.length > 0) return stored;
    // Auto-load demo data on first visit
    const demo = getDemoIntegrations();
    saveToStorage(STORAGE_KEY, demo);
    saveToStorage(DEMO_FLAG_KEY, true);
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

  useEffect(() => {
    saveToStorage(DEMO_FLAG_KEY, isDemo);
  }, [isDemo]);

  const scoredIntegrations: ScoredIntegration[] = rankIntegrations(rawIntegrations);

  // Replace demo data with real uploaded data
  const uploadRealData = useCallback((newIntegrations: Integration[]) => {
    setRawIntegrations(newIntegrations);
    setRevokedIds([]);
    setSelectedId(null);
    setIsDemo(false);
  }, []);

  // Merge additional CSV uploads into existing data
  const addIntegrations = useCallback((newIntegrations: Integration[]) => {
    setRawIntegrations((prev) => {
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
    setIsDemo(true);
  }, []);

  return {
    integrations: scoredIntegrations,
    revokedIds,
    isDemo,
    uploadRealData,
    addIntegrations,
    revokeIntegration,
    resetToDemo,
    selectedId,
    setSelectedId,
  };
}
