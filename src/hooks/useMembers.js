import { useState, useCallback } from 'react';

const STORAGE_KEY = 'pikmin-members';

const DEFAULT_MEMBERS = [
  { id: 'member-1', name: '隊員A' },
  { id: 'member-2', name: '隊員B' },
  { id: 'member-3', name: '隊員C' },
];

function loadMembers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
  } catch {
    return DEFAULT_MEMBERS;
  }
}

function saveLocal(members) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export function useMembers(sheetsApi) {
  const [members, setMembers] = useState(loadMembers);

  // Sheetsから読み込んで上書き
  const loadFromSheets = useCallback((sheetMembers) => {
    if (sheetMembers && sheetMembers.length > 0) {
      setMembers(sheetMembers);
      saveLocal(sheetMembers);
    }
  }, []);

  const syncToSheets = useCallback((data) => {
    if (sheetsApi?.isConfigured) {
      sheetsApi.saveDebounced('saveMembers', data);
    }
  }, [sheetsApi]);

  const addMember = useCallback((name) => {
    setMembers((prev) => {
      const next = [...prev, { id: `member-${Date.now()}`, name }];
      saveLocal(next);
      syncToSheets(next);
      return next;
    });
  }, [syncToSheets]);

  const updateMember = useCallback((id, name) => {
    setMembers((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, name } : m));
      saveLocal(next);
      syncToSheets(next);
      return next;
    });
  }, [syncToSheets]);

  const removeMember = useCallback((id) => {
    setMembers((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveLocal(next);
      syncToSheets(next);
      return next;
    });
  }, [syncToSheets]);

  return { members, addMember, updateMember, removeMember, loadFromSheets };
}
