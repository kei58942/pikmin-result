import { useState, useCallback } from 'react';

const STORAGE_KEY = 'pikmin-best-cases';

function loadCases() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocal(cases) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export function useCases(sheetsApi) {
  const [cases, setCases] = useState(loadCases);

  const loadFromSheets = useCallback((sheetCases) => {
    if (sheetCases && sheetCases.length > 0) {
      const sorted = [...sheetCases].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setCases(sorted);
      saveLocal(sorted);
    }
  }, []);

  const syncToSheets = useCallback((data) => {
    if (sheetsApi?.isConfigured) {
      sheetsApi.saveImmediate('saveCases', data);
    }
  }, [sheetsApi]);

  const addCase = useCallback((newCase) => {
    setCases((prev) => {
      const entry = {
        id: `CASE-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
        ...newCase,
      };
      const next = [entry, ...prev];
      saveLocal(next);
      syncToSheets(next);
      return next;
    });
  }, [syncToSheets]);

  const removeCase = useCallback((caseId) => {
    setCases((prev) => {
      const next = prev.filter((c) => c.id !== caseId);
      saveLocal(next);
      syncToSheets(next);
      return next;
    });
  }, [syncToSheets]);

  const getMethodStats = useCallback(() => {
    const stats = { red: 0, yellow: 0, blue: 0 };
    cases.forEach((c) => {
      if (stats[c.method] !== undefined) stats[c.method]++;
    });
    return stats;
  }, [cases]);

  const getMemberStats = useCallback(() => {
    const map = {};
    cases.forEach((c) => {
      map[c.memberName] = (map[c.memberName] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [cases]);

  return { cases, addCase, removeCase, getMethodStats, getMemberStats, loadFromSheets };
}
