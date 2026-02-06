'use client';

import { MousePointerClick, Heart, UserPlus } from 'lucide-react';

interface Totals {
  select: number;
  save: number;
  subscribe: number;
}

export default function SummaryCards({ totals }: { totals: Totals }) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const cards = [
    {
      title: '전체 Select',
      value: totals.select,
      formatted: formatNumber(totals.select),
      icon: MousePointerClick,
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      title: '전체 Save',
      value: totals.save,
      formatted: formatNumber(totals.save),
      icon: Heart,
      color: 'from-pink-500/20 to-pink-600/20',
      borderColor: 'border-pink-500/30',
      iconColor: 'text-pink-400',
    },
    {
      title: '전체 Subscribe',
      value: totals.subscribe,
      formatted: formatNumber(totals.subscribe),
      icon: UserPlus,
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.color} backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:border-opacity-50 hover:shadow-xl hover:shadow-black/20`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2 font-medium">{card.title}</p>
                <p className="text-4xl font-bold text-white mb-1 tracking-tight">
                  {card.formatted}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(card.value).toLocaleString()}건
                </p>
              </div>
              <div
                className={`p-3 rounded-xl bg-black/30 group-hover:bg-black/40 transition-colors ${card.iconColor}`}
              >
                <Icon size={24} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        );
      })}
    </div>
  );
}
