import { useState, useCallback } from 'react';

const STORAGE_KEY = 'pikmin-settings';

const DEFAULT_SETTINGS = {
  dashboardTitle: 'Pikmin 3 Result Dashboard',
  dashboardSubtitle: '今日の調査報告 — Today\'s Report',
};

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveLocal(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useSettings(sheetsApi) {
  const [settings, setSettings] = useState(loadSettings);

  const loadFromSheets = useCallback((sheetSettings) => {
    if (sheetSettings && sheetSettings.length > 0) {
      const obj = { ...DEFAULT_SETTINGS };
      sheetSettings.forEach((row) => {
        if (row.key) obj[row.key] = row.value;
      });
      setSettings(obj);
      saveLocal(obj);
    }
  }, []);

  const syncToSheets = useCallback((data) => {
    if (sheetsApi?.isConfigured) {
      const rows = Object.entries(data).map(([key, value]) => ({ key, value }));
      sheetsApi.saveDebounced('saveSettings', rows);
    }
  }, [sheetsApi]);

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveLocal(next);
      syncToSheets(next);
      return next;
    });
  }, [syncToSheets]);

  return { settings, updateSettings, loadFromSheets };
}
