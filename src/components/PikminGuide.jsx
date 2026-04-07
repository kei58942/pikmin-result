import { useState } from 'react';
import { Flame, Ear, Droplets, ChevronDown, ChevronUp } from 'lucide-react';

const GUIDES = [
  {
    type: 'red',
    title: '赤の情熱：農機具×通常リユースの二刀流',
    icon: Flame,
    color: 'text-pikmin-red',
    bg: 'bg-pikmin-red-light',
    border: 'border-pikmin-red/20',
    description:
      'どんな固い土壌（難案件）も突き破る「火に強い赤」のように、農機具から通常品まで商材を問わず、全てのニーズを引っこ抜きます。クロスバイを徹底し、一案件の価値を最大まで膨らませます。',
  },
  {
    type: 'yellow',
    title: '黄の感度：傾聴・深掘り・ニーズ把握',
    icon: Ear,
    color: 'text-pikmin-yellow',
    bg: 'bg-pikmin-yellow-light',
    border: 'border-pikmin-yellow/20',
    description:
      '高く飛び、遠くを見渡す「耳の大きな黄」のように、顧客の言葉の裏にある微細なニーズを察知します。丁寧なヒアリング（深掘り）で、顧客自身も気づいていない「お困りごと」を掘り起こします。',
  },
  {
    type: 'blue',
    title: '青の信頼：納得感のあるプレゼン',
    icon: Droplets,
    color: 'text-pikmin-blue',
    bg: 'bg-pikmin-blue-light',
    border: 'border-pikmin-blue/20',
    description:
      '水の中でも自由に動ける「適応力の青」のように、どんな顧客層にもフィットする柔軟で誠実な提案を徹底します。納得感のあるプレゼンを通じて、深い「信頼」という名の水を絶やさぬ関係性を築きます。',
  },
];

export default function PikminGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-green-700 font-medium hover:text-green-800 transition-colors cursor-pointer"
      >
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        ピクミン・スコアとは？
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {GUIDES.map(({ type, title, icon: Icon, color, bg, border, description }) => (
            <div
              key={type}
              className={`${bg} rounded-2xl p-4 border ${border}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${color}`} />
                <h4 className={`text-sm font-bold ${color}`}>{title}</h4>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
