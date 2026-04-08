import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================================
// 全データを一元管理するフック
// jsonblob.com で全ユーザー間リアルタイム同期（ポーリング）
// 設定不要・サインアップ不要・API Key不要
// ============================================================

const LOCAL_KEY = 'pikmin-all-data';
const BLOB_ID = '019d6ee9-4479-768f-ae27-edc4f875dfa6';
const BLOB_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`;
const POLL_INTERVAL = 3000; // 3秒ポーリング

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthStr() {
  return new Date().toISOString().slice(0, 7);
}

const DEFAULT_DATA = {
  settings: {
    dashboardTitle: 'ピクミン ダッシュボード',
    dashboardSubtitle: "今日の調査報告 — Today's Report",
  },
  members: [
    { id: 'member-kaneko', name: '金児胤栄' },
    { id: 'member-yamazaki', name: '山崎紀史' },
    { id: 'member-ibaraki', name: '茨陸翔' },
    { id: 'member-yoshimasu', name: '吉増海斗' },
    { id: 'member-furuta', name: '古田大貴' },
  ],
  scores: {},
  cases: [],
};

function loadLocal() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? { ...DEFAULT_DATA, ...JSON.parse(saved) } : DEFAULT_DATA;
  } catch {
    return DEFAULT_DATA;
  }
}

function saveLocal(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

// リモートからデータ取得
async function fetchRemote() {
  try {
    const res = await fetch(BLOB_URL, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// リモートへデータ書き込み
async function writeRemote(data) {
  try {
    await fetch(BLOB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // 失敗してもローカルには保存済み
  }
}

export function useSharedData() {
  const [data, setData] = useState(loadLocal);
  const [syncStatus, setSyncStatus] = useState('connecting');
  const lastWriteTs = useRef(0);
  const writeTimeout = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  // === ポーリングでリモートの最新データを取得 ===
  useEffect(() => {
    let active = true;

    const poll = async () => {
      const remote = await fetchRemote();
      if (!active) return;

      if (remote === null) {
        setSyncStatus('error');
        return;
      }

      setSyncStatus('synced');

      // メンバーデータが無い or 文字化け → ローカルデータで上書き修復
      if (!remote.members || !Array.isArray(remote.members) || remote.members.length === 0) {
        writeRemote(dataRef.current);
        return;
      }

      // 自分の書き込み直後は上書きスキップ
      if (Date.now() - lastWriteTs.current < 500) return;

      const merged = { ...DEFAULT_DATA, ...remote };
      if (remote.cases && !Array.isArray(remote.cases)) {
        merged.cases = Object.values(remote.cases);
      }

      setData(merged);
      saveLocal(merged);
    };

    // 初回即時取得
    poll();

    // 3秒ごとにポーリング
    const timer = setInterval(poll, POLL_INTERVAL);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  // === リモートへ書き込み（デバウンス300ms） ===
  const syncToRemote = useCallback((newData) => {
    lastWriteTs.current = Date.now();
    if (writeTimeout.current) clearTimeout(writeTimeout.current);
    writeTimeout.current = setTimeout(() => {
      writeRemote(newData);
    }, 300);
  }, []);

  // === 汎用更新（ローカル即時 + リモート送信） ===
  const update = useCallback((updater) => {
    setData((prev) => {
      const next = updater(prev);
      saveLocal(next);
      syncToRemote(next);
      return next;
    });
  }, [syncToRemote]);

  // === Settings ===
  const updateSettings = useCallback((updates) => {
    update((prev) => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  }, [update]);

  // === Members ===
  const addMember = useCallback((name) => {
    update((prev) => ({
      ...prev,
      members: [...prev.members, { id: `member-${Date.now()}`, name }],
    }));
  }, [update]);

  const updateMember = useCallback((id, name) => {
    update((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === id ? { ...m, name } : m)),
    }));
  }, [update]);

  const removeMember = useCallback((id) => {
    update((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }));
  }, [update]);

  // === Scores ===
  const today = getTodayStr();
  const month = getMonthStr();

  const addPoint = useCallback((memberId, type) => {
    update((prev) => {
      const dayScores = prev.scores[today] || {};
      const ms = dayScores[memberId] || { red: 0, yellow: 0, blue: 0 };
      return {
        ...prev,
        scores: {
          ...prev.scores,
          [today]: { ...dayScores, [memberId]: { ...ms, [type]: ms[type] + 1 } },
        },
      };
    });
  }, [update, today]);

  const removePoint = useCallback((memberId, type) => {
    update((prev) => {
      const dayScores = prev.scores[today] || {};
      const ms = dayScores[memberId] || { red: 0, yellow: 0, blue: 0 };
      if (ms[type] <= 0) return prev;
      return {
        ...prev,
        scores: {
          ...prev.scores,
          [today]: { ...dayScores, [memberId]: { ...ms, [type]: ms[type] - 1 } },
        },
      };
    });
  }, [update, today]);

  const getScore = useCallback(
    (memberId) => (data.scores[today] || {})[memberId] || { red: 0, yellow: 0, blue: 0 },
    [data.scores, today]
  );

  const getTotal = useCallback(
    (memberId) => {
      const s = (data.scores[today] || {})[memberId] || { red: 0, yellow: 0, blue: 0 };
      return s.red + s.yellow + s.blue;
    },
    [data.scores, today]
  );

  const buildRanking = useCallback((scoreMap) => {
    return data.members
      .map((m) => {
        const s = scoreMap[m.id] || { red: 0, yellow: 0, blue: 0 };
        return { ...m, scores: s, total: s.red + s.yellow + s.blue };
      })
      .sort((a, b) => b.total - a.total);
  }, [data.members]);

  const getDailyRanking = useCallback(
    () => buildRanking(data.scores[today] || {}),
    [buildRanking, data.scores, today]
  );

  const getMonthlyRanking = useCallback(() => {
    const monthly = {};
    Object.entries(data.scores).forEach(([date, dayScores]) => {
      if (date.startsWith(month)) {
        Object.entries(dayScores).forEach(([mid, s]) => {
          if (!monthly[mid]) monthly[mid] = { red: 0, yellow: 0, blue: 0 };
          monthly[mid].red += s.red || 0;
          monthly[mid].yellow += s.yellow || 0;
          monthly[mid].blue += s.blue || 0;
        });
      }
    });
    return buildRanking(monthly);
  }, [buildRanking, data.scores, month]);

  // === Cases ===
  const addCase = useCallback((newCase) => {
    update((prev) => ({
      ...prev,
      cases: [
        { id: `CASE-${Date.now()}`, createdAt: today, ...newCase },
        ...prev.cases,
      ],
    }));
  }, [update, today]);

  const removeCase = useCallback((caseId) => {
    update((prev) => ({
      ...prev,
      cases: prev.cases.filter((c) => c.id !== caseId),
    }));
  }, [update]);

  const getMethodStats = useCallback(() => {
    const stats = { red: 0, yellow: 0, blue: 0 };
    data.cases.forEach((c) => { if (stats[c.method] !== undefined) stats[c.method]++; });
    return stats;
  }, [data.cases]);

  const getMemberStats = useCallback(() => {
    const map = {};
    data.cases.forEach((c) => { map[c.memberName] = (map[c.memberName] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [data.cases]);

  return {
    settings: data.settings,
    updateSettings,
    members: data.members,
    addMember,
    updateMember,
    removeMember,
    addPoint,
    removePoint,
    getScore,
    getTotal,
    getDailyRanking,
    getMonthlyRanking,
    todayStr: today,
    monthStr: month,
    cases: data.cases,
    addCase,
    removeCase,
    getMethodStats,
    getMemberStats,
    syncStatus,
  };
}
