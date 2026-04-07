import { Flame, Ear, Droplets } from 'lucide-react';

// ポイントに応じた隊員ステータス
function getPikminStatus(total) {
  if (total >= 15) return { emoji: '🌺', label: '満開', ring: 'ring-pink-400', bg: 'bg-gradient-to-br from-pink-100 to-rose-200' };
  if (total >= 10) return { emoji: '🌸', label: '開花', ring: 'ring-pink-300', bg: 'bg-gradient-to-br from-pink-50 to-rose-100' };
  if (total >= 5)  return { emoji: '🌷', label: 'つぼみ', ring: 'ring-yellow-300', bg: 'bg-gradient-to-br from-yellow-50 to-amber-100' };
  if (total >= 1)  return { emoji: '🌱', label: '葉っぱ', ring: 'ring-green-300', bg: 'bg-gradient-to-br from-green-50 to-emerald-100' };
  return { emoji: '🫘', label: '種', ring: 'ring-gray-200', bg: 'bg-gray-100' };
}

const PIKMIN_BUTTONS = [
  {
    type: 'red',
    label: '情熱',
    icon: Flame,
    bg: 'bg-pikmin-red',
    hover: 'hover:bg-red-600',
    light: 'bg-pikmin-red-light',
    text: 'text-pikmin-red',
  },
  {
    type: 'yellow',
    label: '感度',
    icon: Ear,
    bg: 'bg-pikmin-yellow',
    hover: 'hover:bg-amber-500',
    light: 'bg-pikmin-yellow-light',
    text: 'text-pikmin-yellow',
  },
  {
    type: 'blue',
    label: '信頼',
    icon: Droplets,
    bg: 'bg-pikmin-blue',
    hover: 'hover:bg-blue-700',
    light: 'bg-pikmin-blue-light',
    text: 'text-pikmin-blue',
  },
];

function ScoreCard({ member, score, total, onAddPoint, onRemovePoint, onClickEffect }) {
  const status = getPikminStatus(total);
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <div className={`w-11 h-11 rounded-full ${status.bg} ring-2 ${status.ring} flex items-center justify-center text-xl transition-all duration-500`}>
          {status.emoji}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{member.name}</h3>
          <p className="text-xs text-gray-400">
            合計: {total} pt
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{status.label}</span>
          </p>
        </div>
      </div>

      {/* スコア表示 + クリックボタン */}
      <div className="px-6 pb-5 space-y-3">
        {PIKMIN_BUTTONS.map(({ type, label, icon: Icon, bg, hover, light, text }) => (
          <div key={type} className="flex items-center gap-3">
            {/* スコア表示 */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${light}`}>
              <Icon className={`w-4 h-4 ${text}`} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-600">{label}</span>
                <span className={`text-sm font-bold ${text}`}>{score[type]} pt</span>
              </div>
              {/* ミニバー（最大値を動的に表示） */}
              <div className={`h-2 rounded-full ${light} overflow-hidden`}>
                <div
                  className={`h-full rounded-full ${bg} transition-all duration-500 ease-out`}
                  style={{ width: `${Math.min(score[type] * 5, 100)}%` }}
                />
              </div>
            </div>
            {/* クリックボタン */}
            <button
              onClick={() => onRemovePoint(member.id, type)}
              disabled={score[type] === 0}
              className="bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-xl px-2 py-1.5 text-xs font-bold transition-all duration-150 active:scale-90 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              -1
            </button>
            <button
              onClick={(e) => {
                onAddPoint(member.id, type);
                onClickEffect(type, e);
              }}
              className={`${bg} ${hover} text-white rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-150 active:scale-90 cursor-pointer shadow-sm`}
            >
              +1
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScoreBoard({ members, getScore, getTotal, addPoint, removePoint, onClickEffect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <ScoreCard
          key={member.id}
          member={member}
          score={getScore(member.id)}
          total={getTotal(member.id)}
          onAddPoint={addPoint}
          onRemovePoint={removePoint}
          onClickEffect={onClickEffect}
        />
      ))}
    </div>
  );
}
