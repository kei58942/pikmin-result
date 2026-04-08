import { useState, useEffect } from 'react';
import { Rocket, Settings, Trophy, Zap, CalendarDays, BookOpen, Cloud, CloudOff, Wifi, WifiOff } from 'lucide-react';
import ScoreBoard from './components/ScoreBoard';
import Ranking from './components/Ranking';
import BestCases from './components/BestCases';
import SettingsPanel from './components/SettingsPanel';
import PikminGuide from './components/PikminGuide';
import TeamVision from './components/TeamVision';
import { useClickEffect } from './components/ClickEffect';
import DailyBriefing from './components/DailyBriefing';
import WeatherOverlay from './components/WeatherOverlay';
import EnergyTank from './components/EnergyTank';
import { useSharedData } from './hooks/useSharedData';

const TABS = [
  { id: 'score', label: 'スコア', icon: Zap },
  { id: 'ranking', label: 'ランキング', icon: Trophy },
  { id: 'cases', label: '好事例', icon: BookOpen },
];

function getTimeTheme() {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return {
    bg: 'from-morning-start via-morning-mid to-morning-end',
    header: 'bg-white/70 border-green-200/50',
    label: '🌅 朝の森',
  };
  if (h >= 11 && h < 16) return {
    bg: 'from-noon-start via-noon-mid to-noon-end',
    header: 'bg-white/70 border-blue-200/50',
    label: '☀️ 昼の草原',
  };
  if (h >= 16 && h < 19) return {
    bg: 'from-evening-start via-evening-mid to-evening-end',
    header: 'bg-orange-50/70 border-orange-200/50',
    label: '🌇 夕焼けの丘',
  };
  return {
    bg: 'from-night-start via-night-mid to-night-end',
    header: 'bg-slate-900/70 border-slate-700/50',
    label: '🌙 夜の探索',
  };
}

const SYNC_LABELS = {
  local: { text: 'ローカル', icon: WifiOff, color: 'bg-gray-100 text-gray-400' },
  connecting: { text: '接続中...', icon: Wifi, color: 'bg-yellow-50 text-yellow-600' },
  synced: { text: 'リアルタイム同期', icon: Wifi, color: 'bg-green-50 text-green-600' },
  error: { text: '同期エラー', icon: WifiOff, color: 'bg-red-50 text-red-500' },
};

function App() {
  const {
    settings, updateSettings,
    members, addMember, updateMember, removeMember,
    addPoint, removePoint, getScore, getTotal,
    getDailyRanking, getMonthlyRanking, todayStr, monthStr,
    cases, addCase, removeCase, getMethodStats, getMemberStats,
    syncStatus, hasToken, token, updateToken,
    energyCount,
  } = useSharedData();

  const { spawnEffect, EffectLayer } = useClickEffect();

  const [activeTab, setActiveTab] = useState('score');
  const [showSettings, setShowSettings] = useState(false);
  const [weather, setWeather] = useState(null);
  const timeTheme = getTimeTheme();
  const isNight = timeTheme.label.includes('夜');

  const sync = SYNC_LABELS[syncStatus];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${timeTheme.bg} transition-colors duration-1000`}>
      <DailyBriefing />
      <WeatherOverlay onWeatherLoad={setWeather} />
      <EffectLayer />

      {/* ヘッダー */}
      <header className={`sticky top-0 z-10 backdrop-blur-md ${timeTheme.header}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-md">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-bold leading-tight ${isNight ? 'text-white' : 'text-gray-800'}`}>
                  {settings.dashboardTitle}
                </h1>
                <p className={`text-[11px] ${isNight ? 'text-slate-300' : 'text-gray-500'}`}>{settings.dashboardSubtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* エネルギータンク */}
              <EnergyTank memberCount={members.length} weather={weather} energyCount={energyCount} />
              {/* 時間帯ラベル */}
              <div className={`hidden sm:block px-2 py-1 rounded-full text-[10px] font-medium ${isNight ? 'bg-slate-700 text-slate-200' : 'bg-amber-50 text-amber-700'}`}>
                {timeTheme.label}
              </div>
              {/* 同期ステータス */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${sync.color}`}>
                <sync.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{sync.text}</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-xs text-green-700">
                <CalendarDays className="w-3.5 h-3.5" />
                {todayStr}
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <Settings className="w-4.5 h-4.5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* タブ */}
          <div className="flex gap-1 mt-3 bg-green-100/50 rounded-xl p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  activeTab === id
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <TeamVision />
        <PikminGuide />

        <div className="flex items-center justify-between mb-6">
          <p className={`text-sm ${isNight ? 'text-slate-300' : 'text-gray-600'}`}>
            <span className={`font-bold ${isNight ? 'text-white' : 'text-gray-800'}`}>{members.length}</span> 名の隊員
          </p>
          <div className={`flex gap-4 text-xs ${isNight ? 'text-slate-400' : 'text-gray-500'}`}>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-pikmin-red" /> 情熱
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-pikmin-yellow" /> 感度
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-pikmin-blue" /> 信頼
            </span>
          </div>
        </div>

        {activeTab === 'score' && (
          <ScoreBoard
            members={members}
            getScore={getScore}
            getTotal={getTotal}
            addPoint={addPoint}
            removePoint={removePoint}
            onClickEffect={spawnEffect}
          />
        )}

        {activeTab === 'ranking' && (
          <Ranking
            getDailyRanking={getDailyRanking}
            getMonthlyRanking={getMonthlyRanking}
            todayStr={todayStr}
            monthStr={monthStr}
          />
        )}

        {activeTab === 'cases' && (
          <BestCases
            cases={cases}
            addCase={addCase}
            removeCase={removeCase}
            getMethodStats={getMethodStats}
            getMemberStats={getMemberStats}
            members={members}
          />
        )}

        {members.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p>隊員が登録されていません</p>
            <button
              onClick={() => setShowSettings(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium cursor-pointer hover:bg-green-600"
            >
              設定から追加する
            </button>
          </div>
        )}
      </main>

      <footer className={`text-center py-6 text-xs ${isNight ? 'text-slate-500' : 'text-gray-400'}`}>
        {settings.dashboardTitle} — IS応対品質可視化ツール
      </footer>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          updateSettings={updateSettings}
          members={members}
          addMember={addMember}
          updateMember={updateMember}
          removeMember={removeMember}
          syncStatus={syncStatus}
          hasToken={hasToken}
          token={token}
          updateToken={updateToken}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
