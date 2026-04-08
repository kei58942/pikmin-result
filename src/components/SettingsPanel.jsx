import { useState } from 'react';
import { Settings, UserPlus, Pencil, Trash2, X, Check, Wifi, WifiOff } from 'lucide-react';

export default function SettingsPanel({
  settings, updateSettings,
  members, addMember, updateMember, removeMember,
  syncStatus, isFirebaseConfigured,
  onClose,
}) {
  const [newMemberName, setNewMemberName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleAddMember = () => {
    const name = newMemberName.trim();
    if (!name) return;
    addMember(name);
    setNewMemberName('');
  };

  const startEdit = (member) => {
    setEditingId(member.id);
    setEditingName(member.name);
  };

  const saveEdit = () => {
    if (editingName.trim()) {
      updateMember(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-gray-800 text-lg">設定</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 同期ステータス */}
          <section className="p-4 rounded-2xl bg-gray-50 border border-gray-200/50">
            <div className="flex items-center gap-2 mb-2">
              {syncStatus === 'synced' ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-gray-400" />
              )}
              <h3 className="text-sm font-bold text-gray-800">データ同期</h3>
              {syncStatus === 'synced' && (
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">リアルタイム同期中</span>
              )}
            </div>
            {syncStatus === 'synced' && (
              <p className="text-xs text-green-600">
                Firebase接続済み — 全メンバーのスコアがリアルタイムで同期されています
              </p>
            )}
            {syncStatus === 'local' && (
              <p className="text-xs text-gray-500">
                ローカルモード — データはこのブラウザにのみ保存されています
              </p>
            )}
            {syncStatus === 'connecting' && (
              <p className="text-xs text-yellow-600">
                Firebaseに接続中...
              </p>
            )}
            {syncStatus === 'error' && (
              <p className="text-xs text-red-500">
                同期エラー — ページを再読み込みしてください
              </p>
            )}
          </section>

          {/* ダッシュボード名 */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ダッシュボード名</label>
            <input
              type="text"
              value={settings.dashboardTitle}
              onChange={(e) => updateSettings({ dashboardTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </section>

          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">サブタイトル</label>
            <input
              type="text"
              value={settings.dashboardSubtitle}
              onChange={(e) => updateSettings({ dashboardSubtitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </section>

          {/* 隊員管理 */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">隊員管理</label>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  {editingId === member.id ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-green-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                        autoFocus
                      />
                      <button onClick={saveEdit} className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center cursor-pointer">
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 px-3 py-1.5 rounded-lg bg-gray-50 text-sm text-gray-700">{member.name}</span>
                      <button onClick={() => startEdit(member)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer">
                        <Pencil className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button onClick={() => removeMember(member.id)} className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                placeholder="新しい隊員名..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <button
                onClick={handleAddMember}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                追加
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
