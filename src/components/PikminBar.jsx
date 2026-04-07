import { Flame, Ear, Droplets } from 'lucide-react';

const PIKMIN_CONFIG = {
  red: {
    label: '情熱',
    icon: Flame,
    barColor: 'bg-pikmin-red',
    bgColor: 'bg-pikmin-red-light',
    textColor: 'text-pikmin-red',
  },
  yellow: {
    label: '感度',
    icon: Ear,
    barColor: 'bg-pikmin-yellow',
    bgColor: 'bg-pikmin-yellow-light',
    textColor: 'text-pikmin-yellow',
  },
  blue: {
    label: '信頼',
    icon: Droplets,
    barColor: 'bg-pikmin-blue',
    bgColor: 'bg-pikmin-blue-light',
    textColor: 'text-pikmin-blue',
  },
};

export default function PikminBar({ type, score }) {
  const config = PIKMIN_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor}`}>
        <Icon className={`w-4 h-4 ${config.textColor}`} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-gray-600">{config.label}</span>
          <span className={`text-xs font-bold ${config.textColor}`}>{score}</span>
        </div>
        <div className={`h-2.5 rounded-full ${config.bgColor} overflow-hidden`}>
          <div
            className={`h-full rounded-full ${config.barColor} transition-all duration-700 ease-out`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}
