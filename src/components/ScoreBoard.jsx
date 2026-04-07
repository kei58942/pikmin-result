import { Flame, Ear, Droplets, User } from 'lucide-react';

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
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <User className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{member.name}</h3>
          <p className="text-xs text-gray-400">合計: {total} pt</p>
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
