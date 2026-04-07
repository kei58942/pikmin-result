// ============================================================
// Google Apps Script — Pikmin Result Dashboard API
// ============================================================
//
// 【セットアップ手順】
//
// ■ STEP 1: スプレッドシート準備
//   1. Google スプレッドシートを新規作成
//   2. 以下の4つのシートを作成（シート名は正確に）:
//      - "members"   → A1: id    B1: name
//      - "scores"    → A1: date  B1: memberId  C1: red  D1: yellow  E1: blue
//      - "cases"     → A1: id    B1: createdAt  C1: requestId  D1: memberName  E1: method  F1: note
//      - "settings"  → A1: key   B1: value
//
// ■ STEP 2: GASスクリプト設置
//   1. スプレッドシートの「拡張機能」→「Apps Script」を開く
//   2. エディタにあるコードを全て消して、このファイルの内容を貼り付け
//   3. Ctrl+S で保存
//
// ■ STEP 3: デプロイ
//   1. 右上「デプロイ」→「新しいデプロイ」
//   2. 歯車アイコン → 種類:「ウェブアプリ」を選択
//   3. 設定:
//      - 説明: Pikmin API（任意）
//      - 実行するユーザー: 「自分」
//      - アクセスできるユーザー: 「全員」★重要★
//   4. 「デプロイ」をクリック
//   5. 初回は権限承認が必要 → 「アクセスを許可」
//   6. 表示された「ウェブアプリ URL」をコピー
//
// ■ STEP 4: ダッシュボードに接続
//   1. ダッシュボードの歯車アイコン → 設定画面
//   2. 「Google Sheets 連携」にURLを貼り付け
//   3. 「今すぐ同期」をクリック
//
// ■ 注意: コードを変更したら「新しいデプロイ」を再度行ってください
//   （「デプロイを管理」→ 既存のデプロイを編集 でもOK）
// ============================================================

const SHEET_NAMES = {
  MEMBERS: 'members',
  SCORES: 'scores',
  CASES: 'cases',
  SETTINGS: 'settings',
};

function getSheet(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) {
    // シートが存在しない場合は自動作成
    return SpreadsheetApp.getActiveSpreadsheet().insertSheet(name);
  }
  return sheet;
}

function sheetToJson(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0].map(String);
  return data.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      if (h) obj[h] = row[i] !== undefined ? String(row[i]) : '';
    });
    return obj;
  });
}

function jsonToSheet(sheet, dataArray, headers) {
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (dataArray && dataArray.length > 0) {
    const rows = dataArray.map((obj) =>
      headers.map((h) => (obj[h] !== undefined && obj[h] !== null ? obj[h] : ''))
    );
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

// ---- CORS対応レスポンス ----
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- GET ----
function doGet(e) {
  const action = (e.parameter && e.parameter.action) || '';
  let result;

  try {
    switch (action) {
      case 'getMembers':
        result = sheetToJson(getSheet(SHEET_NAMES.MEMBERS));
        break;
      case 'getScores':
        result = sheetToJson(getSheet(SHEET_NAMES.SCORES));
        break;
      case 'getCases':
        result = sheetToJson(getSheet(SHEET_NAMES.CASES));
        break;
      case 'getSettings':
        result = sheetToJson(getSheet(SHEET_NAMES.SETTINGS));
        break;
      case 'getAll':
        result = {
          members: sheetToJson(getSheet(SHEET_NAMES.MEMBERS)),
          scores: sheetToJson(getSheet(SHEET_NAMES.SCORES)),
          cases: sheetToJson(getSheet(SHEET_NAMES.CASES)),
          settings: sheetToJson(getSheet(SHEET_NAMES.SETTINGS)),
        };
        break;
      case 'ping':
        result = { ok: true, timestamp: new Date().toISOString() };
        break;
      default:
        result = { error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return createJsonResponse(result);
}

// ---- POST ----
function doPost(e) {
  let result;

  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    switch (action) {
      case 'saveMembers': {
        jsonToSheet(getSheet(SHEET_NAMES.MEMBERS), payload.data, ['id', 'name']);
        result = { success: true };
        break;
      }
      case 'saveScores': {
        jsonToSheet(getSheet(SHEET_NAMES.SCORES), payload.data, ['date', 'memberId', 'red', 'yellow', 'blue']);
        result = { success: true };
        break;
      }
      case 'saveCases': {
        jsonToSheet(getSheet(SHEET_NAMES.CASES), payload.data, ['id', 'createdAt', 'requestId', 'memberName', 'method', 'note']);
        result = { success: true };
        break;
      }
      case 'saveSettings': {
        jsonToSheet(getSheet(SHEET_NAMES.SETTINGS), payload.data, ['key', 'value']);
        result = { success: true };
        break;
      }
      default:
        result = { error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return createJsonResponse(result);
}
