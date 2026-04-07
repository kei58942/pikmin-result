import { MessageCircle, Sparkles, CalendarDays, User } from 'lucide-react';
import PikminBar from './PikminBar';

export default function ResultCard({ data }) {
  const { id, date, memberName, scoreRed, scoreYellow, scoreBlue, feedback, killerPhrase } = data;

  // 総合スコアに応じたボーダーカラー
  const avg = Math.round((scoreRed + scoreYellow + scoreBlue) / 3);
  const borderColor =
    avg >= 85 ? 'border-l-pikmin-red' :
    avg >= 70 ? 'border-l-pikmin-yellow' :
    'border-l-pikmin-blue';

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${borderColor} overflow-hidden`}>
      {/* ヘッダー */}
      <div className="flex justify-between items-center px-6 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <User className="w-4 h-4 text-green-600" />
          </div>
          <span className="font-bold text-gray-800 text-sm">{memberName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{date}</span>
          <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-mono">{id}</span>
        </div>
      </div>

      {/* 総合スコアバッジ */}
      <div className="px-6 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pikmin-red-light via-pikmin-yellow-light to-pikmin-blue-light">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-bold text-gray-700">総合スコア: {avg}</span>
        </div>
      </div>

      {/* 果実メーター */}
      <div className="px-6 py-3 space-y-2.5">
        <PikminBar type="red" score={scoreRed} />
        <PikminBar type="yellow" score={scoreYellow} />
        <PikminBar type="blue" score={scoreBlue} />
      </div>

      {/* AI総評 */}
      <div className="mx-6 mt-2 p-4 bg-green-50 rounded-2xl relative">
        <div className="absolute -top-2 left-4 w-4 h-4 bg-green-50 rotate-45" />
        <div className="flex items-start gap-2">
          <MessageCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-700 leading-relaxed">{feedback}</p>
        </div>
      </div>

      {/* お守りフレーズ */}
      <div className="mx-6 mt-3 mb-5 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm">🍎</span>
          <span className="text-[10px] font-bold text-amber-700 tracking-wide">本日のお宝フレーズ</span>
        </div>
        <p className="text-xs text-amber-900 font-medium leading-relaxed">{killerPhrase}</p>
      </div>
    </div>
  );
}
