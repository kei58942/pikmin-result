import { useState, useCallback, useRef } from 'react';

const CONFIG_KEY = 'pikmin-github-config';

// 設定: { owner, repo, token }
function loadConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? JSON.parse(saved) : { owner: '', repo: '', token: '' };
  } catch {
    return { owner: '', repo: '', token: '' };
  }
}

function saveConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

const DATA_PATH = 'data.json';
const BRANCH = 'main';

export function useGitHubApi() {
  const [config, setConfig] = useState(loadConfig);
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastError, setLastError] = useState(null);
  const debounceTimer = useRef(null);
  const latestSha = useRef(null);

  const isConfigured = !!(config.owner && config.repo && config.token);

  const updateConfig = useCallback((updates) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      saveConfig(next);
      return next;
    });
    setConnected(false);
    setLastError(null);
  }, []);

  // data.json を読み取り
  const fetchAll = useCallback(async () => {
    if (!isConfigured) return null;
    const { owner, repo, token } = config;
    try {
      setSyncing(true);
      setLastError(null);

      // GitHub API でファイル取得（SHAも取れる）
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${DATA_PATH}?ref=${BRANCH}&t=${Date.now()}`,
        { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
      );

      if (res.status === 404) {
        // data.json がまだない → 空データ
        setConnected(true);
        latestSha.current = null;
        return { members: [], scores: [], cases: [], settings: [] };
      }

      if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);

      const file = await res.json();
      latestSha.current = file.sha;

      const content = JSON.parse(atob(file.content));
      setConnected(true);
      return content;
    } catch (err) {
      setLastError(err.message);
      setConnected(false);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [config, isConfigured]);

  // data.json を書き込み（コミット）
  const saveAll = useCallback(async (data) => {
    if (!isConfigured) return;
    const { owner, repo, token } = config;
    try {
      setSyncing(true);
      setLastError(null);

      const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

      const body = {
        message: `update data ${new Date().toISOString().slice(0, 16)}`,
        content,
        branch: BRANCH,
      };
      if (latestSha.current) {
        body.sha = latestSha.current;
      }

      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${DATA_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (res.status === 409) {
        // SHA競合 → 最新を取り直してリトライ
        const fresh = await fetchAll();
        if (fresh) {
          // マージして再試行するのは複雑なのでエラー表示
          throw new Error('他の人が同時に更新しました。「今すぐ同期」で最新を取得してください');
        }
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `PUT ${res.status}`);
      }

      const result = await res.json();
      latestSha.current = result.content.sha;
      setConnected(true);
    } catch (err) {
      setLastError(err.message);
    } finally {
      setSyncing(false);
    }
  }, [config, isConfigured, fetchAll]);

  // デバウンス付き書き込み（1秒後にまとめて送信）
  const saveDebounced = useCallback((data) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => saveAll(data), 1000);
  }, [saveAll]);

  return {
    config,
    updateConfig,
    isConfigured,
    connected,
    syncing,
    lastError,
    fetchAll,
    saveAll,
    saveDebounced,
  };
}
