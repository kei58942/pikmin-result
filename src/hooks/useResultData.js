import { useState, useEffect, useCallback } from 'react';
import dummyData from '../data/dummyData.json';

// データソースを切り替え可能な設計
// 将来的に Google Sheets API に差し替える場合は fetchFromSheets() を実装して切り替え
const DATA_SOURCE = 'local'; // 'local' | 'sheets'

async function fetchFromLocal() {
  return dummyData;
}

// Google Sheets API 用のプレースホルダー
// async function fetchFromSheets() {
//   const SHEET_ID = 'YOUR_SHEET_ID';
//   const API_KEY = 'YOUR_API_KEY';
//   const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;
//   const res = await fetch(url);
//   const data = await res.json();
//   return transformSheetData(data.values);
// }

export function useResultData() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = DATA_SOURCE === 'local'
        ? await fetchFromLocal()
        : await fetchFromLocal(); // 将来: fetchFromSheets()
      // 日付の新しい順にソート
      const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
      setResults(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { results, loading, error, refresh: fetchData };
}
