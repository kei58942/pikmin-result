import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================================
// 全データを一元管理するフック
// GitHub API (publicリポ) で全ユーザー間同期
// 読み取り: トークン不要 / 書き込み: PAT必要（設定画面で1回入力）
// ============================================================

const LOCAL_KEY = 'pikmin-all-data';
const TOKEN_KEY = 'pikmin-github-token';
const OWNER = 'kei58942';
const REPO = 'pikmin-data';
const FILE_PATH = 'data.json';
const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
const POLL_INTERVAL = 5000; // 5秒ポーリング

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

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

// GitHub APIからdata.json読み取り（認証不要）
async function fetchRemote() {
  try {
    const res = await fetch(`${API_URL}?t=${Date.now()}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!res.ok) return null;
    const file = await res.json();
    const content = JSON.parse(decodeURIComponent(escape(atob(file.content))));
    return { data: content, sha: file.sha };
  } catch {
    return null;
  }
}

// GitHub APIへdata.json書き込み（PAT必要）
async function writeRemote(data, sha, token) {
  if (!token) return null;
  try {
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `update ${new Date().toISOString().slice(0, 16)}`,
        content,
        sha,
      }),
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result.content.sha;
  } catch {
    return null;
  }
}

export function useSharedData() {
  const [data, setData] = useState(loadLocal);
  const [syncStatus, setSyncStatus] = useState('connecting');
  const [token, _setToken] = useState(getToken);
  const latestSha = useRef(null);
  const lastWriteTs = useRef(0);
  const writeTimeout = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  const hasToken = !!token;

  const updateToken = useCallback((newToken) => {
    const trimmed = newToken.trim();
    setToken(trimmed);
    _setToken(trimmed);
  }, []);

  // === ポーリング ===
  useEffect(() => {
    let active = true;

    const poll = async () => {
      const result = await fetchRemote();
      if (!active) return;

      if (!result) {
        setSyncStatus('error');
        return;
      }

      setSyncStatus('synced');
      latestSha.current = result.sha;

      // 自分の書き込み直後はスキップ
      if (Date.now() - lastWriteTs.current < 2000) return;

      const remote = result.data;
      if (remote && remote.members && Array.isArray(remote.members)) {
        const merged = { ...DEFAULT_DATA, ...remote };
        if (remote.cases && !Array.isArray(remote.cases)) {
          merged.cases = Object.values(remote.cases);
        }
        setData(merged);
        saveLocal(merged);
      }
    };

    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => { active = false; clearInterval(timer); };
  }, []);

  // === 書き込み（デバウンス1秒） ===
  const syncToRemote = useCallback((newData) => {
    if (!token) return;
    lastWriteTs.current = Date.now();

    if (writeTimeout.current) clearTimeout(writeTimeout.current);
    writeTimeout.current = setTimeout(async () => {
      // 最新のSHAを取得してから書き込み
      const latest = await fetchRemote();
      if (latest) latestSha.current = latest.sha;

      const newSha = await writeRemote(newData, latestSha.current, token);
      if (newSha) {
        latestSha.current = newSha;
      }
    }, 1000);
  }, [token]);

  // === 汎用更新 ===
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
    hasToken,
    token,
    updateToken,
  };
}
