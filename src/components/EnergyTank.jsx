import { useMemo } from 'react';

export default function EnergyTank({ memberCount, weather, energyCount }) {
  const maxCapacity = Math.max(memberCount || 5, 3);
  const count = energyCount || 0;

  const fillPercent = Math.min((count / maxCapacity) * 100, 100);
  const isFull = fillPercent >= 80;

  const weatherEmoji = useMemo(() => {
    if (!weather) return '🌤';
    const map = { clear: '☀️', rain: '🌧', cloudy: '☁️', thunder: '⛈', snow: '❄️' };
    return map[weather.category] || '🌤';
  }, [weather]);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-green-100">
      {/* タンク */}
      <div className="relative w-8 h-14 rounded-lg border-2 border-emerald-400 bg-emerald-50/50 overflow-hidden flex-shrink-0">
        {/* タンクキャップ */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-t-sm bg-emerald-500 z-10" />

        {/* 液体 */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${
            isFull ? 'bg-gradient-to-t from-emerald-400 to-green-300' : 'bg-gradient-to-t from-emerald-500 to-emerald-300'
          }`}
          style={{ height: `${fillPercent}%` }}
        >
          {/* ゆらゆら波 */}
          <div className="absolute top-0 left-0 right-0 h-2 overflow-hidden">
            <div className="tank-wave" />
          </div>

          {/* 満タン時の発光 */}
          {isFull && <div className="absolute inset-0 tank-glow" />}
        </div>

        {/* 目盛り線 */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-emerald-200/50" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-200/50" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-emerald-200/50" />
      </div>

      {/* テキスト */}
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Energy</span>
          {isFull && <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-600 font-bold animate-pulse">MAX!</span>}
        </div>
        <p className="text-xs font-bold text-gray-700">
          {count}<span className="text-gray-400 font-normal">/{maxCapacity}</span>
          <span className="text-[10px] text-gray-400 ml-1">人出撃</span>
        </p>
        {weather && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            {weatherEmoji} {weather.description} {weather.temp}°C
          </p>
        )}
      </div>
    </div>
  );
}
