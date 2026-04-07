import { useState, useCallback, useRef } from 'react';

const ENDPOINT_KEY = 'pikmin-gas-endpoint';

export function getEndpoint() {
  return localStorage.getItem(ENDPOINT_KEY) || '';
}

export function setEndpoint(url) {
  localStorage.setItem(ENDPOINT_KEY, url);
}

// ============================================================
// GAS通信ユーティリティ
// GASはリダイレクト(302)するため、Content-Type: text/plain で
// CORSプリフライトを回避する必要がある
// ============================================================

// GAS GET — redirect: 'follow' でリダイレクトに追従
async function gasGet(endpoint, action) {
  const url = `${endpoint}?action=${action}&t=${Date.now()}`;
  const res = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`GET ${res.status}: ${res.statusText}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`レスポンスがJSONではありません: ${text.slice(0, 100)}`);
  }
}

// GAS POST — Content-Type: text/plain でプリフライトを回避
async function gasPost(endpoint, action, data) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, data }),
    redirect: 'follow',
  });
  // no-cors fallback: opaqueレスポンスの場合は成功とみなす
  if (res.type === 'opaque') return { success: true };
  if (!res.ok) throw new Error(`POST ${res.status}: ${res.statusText}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`レスポンスがJSONではありません: ${text.slice(0, 100)}`);
  }
}

// フォールバック: no-cors POST（レスポンスは読めないが書き込みは成功する）
async function gasPostNoCors(endpoint, action, data) {
  await fetch(endpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, data }),
  });
  return { success: true };
}

// POST を試行: まず通常POST → 失敗したら no-cors で再試行
async function gasPostWithFallback(endpoint, action, data) {
  try {
    return await gasPost(endpoint, action, data);
  } catch {
    return await gasPostNoCors(endpoint, action, data);
  }
}

export function useSheetsApi() {
  const [endpoint, _setEndpoint] = useState(getEndpoint);
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastError, setLastError] = useState(null);
  const debounceTimers = useRef({});

  const isConfigured = !!endpoint;

  const updateEndpoint = useCallback((url) => {
    const trimmed = url.trim();
    setEndpoint(trimmed);
    _setEndpoint(trimmed);
    setConnected(false);
    setLastError(null);
  }, []);

  // 全データ取得
  const fetchAll = useCallback(async () => {
    if (!endpoint) return null;
    try {
      setSyncing(true);
      setLastError(null);
      const data = await gasGet(endpoint, 'getAll');
      if (data.error) throw new Error(data.error);
      setConnected(true);
      return data;
    } catch (err) {
      setLastError(err.message);
      setConnected(false);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [endpoint]);

  // デバウンス付き書き込み
  const saveDebounced = useCallback((action, data) => {
    if (!endpoint) return;
    if (debounceTimers.current[action]) {
      clearTimeout(debounceTimers.current[action]);
    }
    debounceTimers.current[action] = setTimeout(async () => {
      try {
        setSyncing(true);
        setLastError(null);
        await gasPostWithFallback(endpoint, action, data);
        setConnected(true);
      } catch (err) {
        setLastError(err.message);
      } finally {
        setSyncing(false);
      }
    }, 500);
  }, [endpoint]);

  // 即時書き込み
  const saveImmediate = useCallback(async (action, data) => {
    if (!endpoint) return;
    try {
      setSyncing(true);
      setLastError(null);
      await gasPostWithFallback(endpoint, action, data);
      setConnected(true);
    } catch (err) {
      setLastError(err.message);
    } finally {
      setSyncing(false);
    }
  }, [endpoint]);

  return {
    endpoint,
    updateEndpoint,
    isConfigured,
    connected,
    syncing,
    lastError,
    fetchAll,
    saveDebounced,
    saveImmediate,
  };
}
