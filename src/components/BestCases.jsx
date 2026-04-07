import { useState } from 'react';
import { Plus, Trash2, Flame, Ear, Droplets, BookOpen, BarChart3, X } from 'lucide-react';

const METHOD_CONFIG = {
  red: { label: '赤・情熱', icon: Flame, color: 'text-pikmin-red', bg: 'bg-pikmin-red-light', border: 'border-l-pikmin-red', tag: 'bg-pikmin-red text-white' },
  yellow: { label: '黄・感度', icon: Ear, color: 'text-pikmin-yellow', bg: 'bg-pikmin-yellow-light', border: 'border-l-pikmin-yellow', tag: 'bg-pikmin-yellow text-white' },
  blue: { label: '青・信頼', icon: Droplets, color: 'text-pikmin-blue', bg: 'bg-pikmin-blue-light', border: 'border-l-pikmin-blue', tag: 'bg-pikmin-blue text-white' },
};

function CaseForm({ members, onSubmit, onClose }) {
  const [requestId, setRequestId] = useState('');
  const [memberName, setMemberName] = useState(members[0]?.name || '');
  const [method, setMethod] = useState('red');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!requestId.trim()) return;
    onSubmit({ requestId: requestId.trim(), memberName, method, note: note.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-gray-800 text-lg">好事例を登録</h2>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">依頼ID</label>
            <input
              type="text"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="例: REQ-20260406-001"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">隊員</label>
            <select
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 appearance-none"
            >
              {members.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">体現メソッド</label>
            <div className="flex gap-2">
              {Object.entries(METHOD_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMethod(key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all cursor-pointer ${
                      method === key
                        ? `${cfg.bg} ${cfg.color} border-current`
                        : 'bg-gray-50 text-gray-400 border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {key === 'red' ? '情熱' : key === 'yellow' ? '感度' : '信頼'}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">補足</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="どのような場面で体現できたか..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
            />
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            登録する
          </button>
        </div>
      </form>
    </div>
  );
}

function MethodStats({ stats, total }) {
  if (total === 0) return null;

  return (
    <div className="flex gap-3 mb-6">
      {Object.entries(METHOD_CONFIG).map(([key, cfg]) => {
        const Icon = cfg.icon;
        const count = stats[key];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={key} className={`flex-1 ${cfg.bg} rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${cfg.color}`} />
              <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
            </div>
            <p className={`text-2xl font-bold ${cfg.color}`}>{count}</p>
            <p className="text-xs text-gray-500">{pct}%</p>
          </div>
        );
      })}
    </div>
  );
}

export default function BestCases({ cases, addCase, removeCase, getMethodStats, getMemberStats, members }) {
  const [showForm, setShowForm] = useState(false);
  const [filterMethod, setFilterMethod] = useState('');

  const stats = getMethodStats();
  const memberStats = getMemberStats();
  const total = cases.length;

  const filtered = filterMethod
    ? cases.filter((c) => c.method === filterMethod)
    : cases;

  return (
    <div>
      {/* 統計サマリー */}
      <MethodStats stats={stats} total={total} />

      {/* 隊員別ランキング（事例数） */}
      {memberStats.length > 0 && (
        <div className="mb-6 bg-white/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-bold text-gray-700">隊員別 好事例数</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {memberStats.map(({ name, count }) => (
              <span key={name} className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                {name}: {count}件
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ヘッダー & フィルター */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white/80 border border-gray-200 text-xs text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <option value="">全メソッド ({total})</option>
            <option value="red">情熱 ({stats.red})</option>
            <option value="yellow">感度 ({stats.yellow})</option>
            <option value="blue">信頼 ({stats.blue})</option>
          </select>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          好事例を登録
        </button>
      </div>

      {/* 事例一覧 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>まだ好事例が登録されていません</p>
          <p className="text-xs mt-1">「好事例を登録」ボタンから追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const cfg = METHOD_CONFIG[c.method];
            const Icon = cfg.icon;
            return (
              <div key={c.id} className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border-l-4 ${cfg.border} px-5 py-4`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.tag}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{c.requestId}</span>
                      <span className="text-xs text-gray-400">{c.createdAt}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-1">{c.memberName}</p>
                    {c.note && <p className="text-xs text-gray-600 leading-relaxed">{c.note}</p>}
                  </div>
                  <button
                    onClick={() => removeCase(c.id)}
                    className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center cursor-pointer shrink-0 ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 登録フォームモーダル */}
      {showForm && (
        <CaseForm
          members={members}
          onSubmit={addCase}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
