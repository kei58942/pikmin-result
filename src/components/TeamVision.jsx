import { Trophy } from 'lucide-react';

export default function TeamVision() {
  return (
    <div className="mb-8 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-3xl border border-green-200/50 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3">
        <p className="text-white text-center text-sm font-bold tracking-wide">
          Team Vision
        </p>
        <p className="text-emerald-100 text-center text-xs mt-0.5">
          ~ 運べ、広げろ。顧客の心に「楽園」を ~
        </p>
      </div>

      {/* ビジョン本文 */}
      <div className="px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">
              我々が目指すべき「楽園」の姿
            </h3>
            <p className="text-sm font-bold text-emerald-700 mb-2">
              LTVの最大化：一輪の花を咲かせ、一生の付き合いへ
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              一度きりの回収で終わらせず、ピクミンが蜜を吸って花を咲かせるように、一軒の顧客から「次も、次も」と依頼が続く、リユースの楽園を構築します。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
