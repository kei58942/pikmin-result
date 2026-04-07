import { useState, useCallback, useEffect } from 'react';

const DAILY_KEY = 'pikmin-scores';
const DATE_KEY = 'pikmin-scores-date';
const MONTHLY_KEY = 'pikmin-scores-monthly';
const MONTH_KEY = 'pikmin-scores-month';

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthStr() {
  return new Date().toISOString().slice(0, 7);
}

function loadDailyScores() {
  try {
    const savedDate = localStorage.getItem(DATE_KEY);
    const today = getTodayStr();
    if (savedDate !== today) {
      localStorage.setItem(DATE_KEY, today);
      localStorage.removeItem(DAILY_KEY);
      return {};
    }
    const saved = localStorage.getItem(DAILY_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function loadMonthlyScores() {
  try {
    const savedMonth = localStorage.getItem(MONTH_KEY);
    const currentMonth = getMonthStr();
    if (savedMonth !== currentMonth) {
      localStorage.setItem(MONTH_KEY, currentMonth);
      localStorage.removeItem(MONTHLY_KEY);
      return {};
    }
    const saved = localStorage.getItem(MONTHLY_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveDailyLocal(scores) {
  localStorage.setItem(DAILY_KEY, JSON.stringify(scores));
  localStorage.setItem(DATE_KEY, getTodayStr());
}

function saveMonthlyLocal(scores) {
  localStorage.setItem(MONTHLY_KEY, JSON.stringify(scores));
  localStorage.setItem(MONTH_KEY, getMonthStr());
}

// スコアMap → Sheets用配列に変換
function scoresToRows(scoreMap, date) {
  return Object.entries(scoreMap).map(([memberId, s]) => ({
    date,
    memberId,
    red: s.red || 0,
    yellow: s.yellow || 0,
    blue: s.blue || 0,
  }));
}

// Sheets配列 → スコアMapに変換
function rowsToScores(rows, targetDate) {
  const map = {};
  rows.forEach((r) => {
    if (r.date === targetDate) {
      map[r.memberId] = {
        red: Number(r.red) || 0,
        yellow: Number(r.yellow) || 0,
        blue: Number(r.blue) || 0,
      };
    }
  });
  return map;
}

function addToScoreMap(prev, memberId, type) {
  const memberScore = prev[memberId] || { red: 0, yellow: 0, blue: 0 };
  return {
    ...prev,
    [memberId]: { ...memberScore, [type]: memberScore[type] + 1 },
  };
}

function removeFromScoreMap(prev, memberId, type) {
  const memberScore = prev[memberId] || { red: 0, yellow: 0, blue: 0 };
  if (memberScore[type] <= 0) return prev;
  return {
    ...prev,
    [memberId]: { ...memberScore, [type]: memberScore[type] - 1 },
  };
}

export function useScores(members, sheetsApi) {
  const [dailyScores, setDailyScores] = useState(loadDailyScores);
  const [monthlyScores, setMonthlyScores] = useState(loadMonthlyScores);

  // Sheetsから読み込み
  const loadFromSheets = useCallback((sheetScores) => {
    if (!sheetScores || sheetScores.length === 0) return;
    const today = getTodayStr();
    const month = getMonthStr();

    // 今日のデータ
    const dailyMap = rowsToScores(sheetScores, today);
    if (Object.keys(dailyMap).length > 0) {
      setDailyScores(dailyMap);
      saveDailyLocal(dailyMap);
    }

    // 今月のデータ（全日の合算）
    const monthlyMap = {};
    sheetScores.forEach((r) => {
      if (r.date && r.date.startsWith(month)) {
        const mid = r.memberId;
        if (!monthlyMap[mid]) monthlyMap[mid] = { red: 0, yellow: 0, blue: 0 };
        monthlyMap[mid].red += Number(r.red) || 0;
        monthlyMap[mid].yellow += Number(r.yellow) || 0;
        monthlyMap[mid].blue += Number(r.blue) || 0;
      }
    });
    if (Object.keys(monthlyMap).length > 0) {
      setMonthlyScores(monthlyMap);
      saveMonthlyLocal(monthlyMap);
    }
  }, []);

  const syncToSheets = useCallback((dailyMap) => {
    if (sheetsApi?.isConfigured) {
      // 今日のデータを行として送信
      const rows = scoresToRows(dailyMap, getTodayStr());
      sheetsApi.saveDebounced('saveScores', rows);
    }
  }, [sheetsApi]);

  // 日付変更チェック
  useEffect(() => {
    const interval = setInterval(() => {
      const savedDate = localStorage.getItem(DATE_KEY);
      if (savedDate !== getTodayStr()) {
        setDailyScores({});
        localStorage.removeItem(DAILY_KEY);
        localStorage.setItem(DATE_KEY, getTodayStr());
      }
      const savedMonth = localStorage.getItem(MONTH_KEY);
      if (savedMonth !== getMonthStr()) {
        setMonthlyScores({});
        localStorage.removeItem(MONTHLY_KEY);
        localStorage.setItem(MONTH_KEY, getMonthStr());
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const addPoint = useCallback((memberId, type) => {
    setDailyScores((prev) => {
      const next = addToScoreMap(prev, memberId, type);
      saveDailyLocal(next);
      syncToSheets(next);
      return next;
    });
    setMonthlyScores((prev) => {
      const next = addToScoreMap(prev, memberId, type);
      saveMonthlyLocal(next);
      return next;
    });
  }, [syncToSheets]);

  const removePoint = useCallback((memberId, type) => {
    setDailyScores((prev) => {
      const next = removeFromScoreMap(prev, memberId, type);
      if (next === prev) return prev;
      saveDailyLocal(next);
      syncToSheets(next);
      return next;
    });
    setMonthlyScores((prev) => {
      const next = removeFromScoreMap(prev, memberId, type);
      if (next === prev) return prev;
      saveMonthlyLocal(next);
      return next;
    });
  }, [syncToSheets]);

  const getScore = useCallback(
    (memberId) => dailyScores[memberId] || { red: 0, yellow: 0, blue: 0 },
    [dailyScores]
  );

  const getTotal = useCallback(
    (memberId) => {
      const s = dailyScores[memberId] || { red: 0, yellow: 0, blue: 0 };
      return s.red + s.yellow + s.blue;
    },
    [dailyScores]
  );

  const buildRanking = useCallback((scoreMap) => {
    return members
      .map((m) => {
        const s = scoreMap[m.id] || { red: 0, yellow: 0, blue: 0 };
        return { ...m, scores: s, total: s.red + s.yellow + s.blue };
      })
      .sort((a, b) => b.total - a.total);
  }, [members]);

  const getDailyRanking = useCallback(() => buildRanking(dailyScores), [buildRanking, dailyScores]);
  const getMonthlyRanking = useCallback(() => buildRanking(monthlyScores), [buildRanking, monthlyScores]);

  return {
    addPoint,
    removePoint,
    getScore,
    getTotal,
    getDailyRanking,
    getMonthlyRanking,
    todayStr: getTodayStr(),
    monthStr: getMonthStr(),
    loadFromSheets,
  };
}
