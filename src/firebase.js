import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';

// ============================================================
// Firebase設定
// Firebase Console → プロジェクト設定 → マイアプリ → SDK設定
// からコピーした値を貼り付けてください
// ============================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "000000000000",
  appId: "YOUR_APP_ID",
};

// 設定が有効かチェック
export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith('YOUR_');

let app = null;
let db = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
}

export { db, ref, set, onValue, off };
