import { useState } from 'react';
import { Trophy, Flame, Ear, Droplets, CalendarDays, CalendarRange } from 'lucide-react';

const RANK_STYLES = [
  { bg: 'bg-gradient-to-r from-amber-100 to-yellow-50', border: 'border-l-amber-400', badge: 'bg-amber-400 text-white', emoji: '\u{1F947}' },
  { bg: 'bg-gradient-to-r from-gray-100 to-slate-50', border: 'border-l-gray-400', badge: 'bg-gray-400 text-white', emoji: '\u{1F948}' },
  { bg: 'bg-gradient-to-r from-orange-100 to-amber-50', border: 'border-l-orange-400', badge: 'bg-orange-400 text-white', emoji: '\u{1F949}' },
];

const PERIOD_TABS = [
  { id: 'daily', label: 'Daily', icon: CalendarDays },
  { id: 'monthly', label: 'Monthly', icon: CalendarRange },
];

function RankingList({ ranking }) {
  if (ranking.length === 0 || ranking.every((e) => e.total === 0)) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>まだポイントが記録されていません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ranking.map((entry, index) => {
        const style = RANK_STYLES[index] || {
          bg: 'bg-white/80',
          border: 'border-l-green-300',
          badge: 'bg-green-200 text-green-800',
          emoji: null,
        };

        return (
          <div
            key={entry.id}
            className={`${style.bg} backdrop-blur-sm rounded-2xl shadow-md border-l-4 ${style.border} px-6 py-4 flex items-center gap-4 transition-all duration-300`}
          >
            <div className={`w-10 h-10 rounded-full ${style.badge} flex items-center justify-center font-bold text-lg shrink-0`}>
              {style.emoji || (index + 1)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-lg truncate">{entry.name}</h3>
              <div className="flex gap-4 mt-1">
                <span className="flex items-center gap-1 text-xs text-pikmin-red">
                  <Flame className="w-3 h-3" /> {entry.scores.red}
                </span>
                <span className="flex items-center gap-1 text-xs text-pikmin-yellow">
                  <Ear className="w-3 h-3" /> {entry.scores.yellow}
                </span>
                <span className="flex items-center gap-1 text-xs text-pikmin-blue">
                  <Droplets className="w-3 h-3" /> {entry.scores.blue}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-gray-800">{entry.total}</p>
              <p className="text-xs text-gray-400">pt</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Ranking({ getDailyRanking, getMonthlyRanking, todayStr, monthStr }) {
  const [period, setPeriod] = useState('daily');

  const ranking = period === 'daily' ? getDailyRanking() : getMonthlyRanking();

  return (
    <div>
      {/* Daily / Monthly タブ */}
      <div className="flex gap-1 mb-6 bg-white/60 rounded-xl p-1 max-w-xs">
        {PERIOD_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPeriod(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              period === id
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* 期間表示 */}
      <p className="text-xs text-gray-400 mb-4">
        {period === 'daily' ? `${todayStr} のランキング` : `${monthStr} のランキング`}
      </p>

      <RankingList ranking={ranking} />
    </div>
  );
}
