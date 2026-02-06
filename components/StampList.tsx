'use client';

import StampCard from './StampCard';

interface Stamp {
  categoryId: string;
  categoryName: string;
  type: string;
  position: string;
  select: number;
  save: number;
  subscribe: number;
  savePercent: number;
  thumbnail: string | null;
  sources?: string[];
  isNew?: boolean;
}

interface StampListProps {
  stamps: Stamp[];
  onThumbnailUpdate?: (stampName: string, thumbnailUrl: string) => void;
}

export default function StampList({ stamps, onThumbnailUpdate }: StampListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">
            스탬프 목록
          </h2>
          <p className="text-sm text-gray-400">구독자수(Subscribe) 기준 정렬</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">
            {stamps.length.toLocaleString()}
          </span>
          <span className="text-sm text-gray-400 block">개 스탬프</span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-fr">
              {stamps.map((stamp, index) => (
                <StampCard 
                  key={stamp.categoryId || stamp.categoryName || index} 
                  stamp={stamp} 
                  rank={index + 1}
                  onThumbnailUpdate={onThumbnailUpdate}
                />
              ))}
      </div>
    </div>
  );
}
