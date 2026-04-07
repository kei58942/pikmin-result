import { useState, useEffect } from 'react';
import { Rocket, Shield, Trophy, Heart, MessageCircle } from 'lucide-react';

const STORAGE_KEY = 'pikmin-daily-briefing-date';

const BRIEFINGS = [
  {
    icon: Rocket,
    title: '出撃と帰還の点呼',
    color: 'text-green-500',
    bg: 'bg-green-50',
    text: '朝の始業時と夕方の終業時には必ずサイトをチェック！仲間の「開花状況」を確認して、チームの士気を高めよう。',
  },
  {
    icon: Trophy,
    title: 'ランキングは「称え合い」の証',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    text: '順位は競うためではなく、互いの「情熱（赤）」「感度（黄）」「信頼（青）」を称えるためのもの。上位隊員の動きを真似して、みんなでお宝（ホット）を探そう！',
  },
  {
    icon: MessageCircle,
    title: 'ナイス引っこ抜き！の連鎖',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    text: '素敵な「好事例」を見つけたら、チャットで本人に直接伝えよう。良い行動の連鎖が「楽園（LTV最大化）」への近道です。',
  },
  {
    icon: Shield,
    title: '原生生物（外敵）への情報封鎖',
    color: 'text-red-500',
    bg: 'bg-red-50',
    text: 'サイトのスクショや内部情報は、絶対に部外者に見せてはいけません。みんなの安心・安全な探索のために、機密保持を徹底しよう！',
  },
];

export default function DailyBriefing() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem(STORAGE_KEY);
    if (lastShown !== today) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEY, today);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* カード */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-white rounded-3xl shadow-2xl overflow-hidden animate-briefing-in">
        {/* ヘッダー：司令部通信風 */}
        <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 px-6 pt-6 pb-5 text-white overflow-hidden">
          {/* 背景装飾 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-6" />

          <div className="relative flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
              🚀
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-green-200 font-bold">Daily Briefing</p>
              <h2 className="text-lg font-extrabold leading-tight">本日の探索心得</h2>
            </div>
          </div>
          <p className="relative text-xs text-green-100 mt-1">
            ～ 司令部より全隊員へ通達 ～
          </p>
        </div>

        {/* 心得リスト */}
        <div className="px-5 py-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {BRIEFINGS.map(({ icon: Icon, title, color, bg, text }, i) => (
            <div key={i} className={`flex gap-3 p-3 rounded-2xl ${bg} border border-white`}>
              <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${bg} flex items-center justify-center mt-0.5`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-800 mb-0.5">{title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* アクションボタン */}
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={handleDismiss}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-base font-extrabold shadow-lg shadow-green-200 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-95"
          >
            🌿 了解して出撃！
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-2">※ このメッセージは1日1回表示されます</p>
        </div>
      </div>
    </div>
  );
}
