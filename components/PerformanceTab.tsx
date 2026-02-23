'use client';

import { useEffect, useState } from 'react';
import SummaryCards from '@/components/SummaryCards';
import StampList from '@/components/StampList';

interface WeeklyData {
  weeks: Array<{
    week: number;
    weekName: string;
    totals: {
      select: number;
      save: number;
      subscribe: number;
    };
    stamps: Array<{
      categoryId: string;
      categoryName: string;
      type: string;
      position: string;
      select: number;
      save: number;
      subscribe: number;
      savePercent: number;
      thumbnail: string | null;
      isNew?: boolean;
    }>;
  }>;
}

interface PerformanceTabProps {
  searchQuery: string;
  onThumbnailUpdate: (stampName: string, thumbnailUrl: string) => void;
}

export default function PerformanceTab({ searchQuery, onThumbnailUpdate }: PerformanceTabProps) {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [useAllWeeks, setUseAllWeeks] = useState(true);

  useEffect(() => {
    const basePath = '/epik-stamp-statistics';
    fetch(`${basePath}/weekly-data.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: WeeklyData) => {
        setWeeklyData(data);
        if (data.weeks.length > 0) {
          setSelectedWeek(data.weeks[0].week);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('주차별 데이터 로딩 실패:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // 전체 주차 데이터도 함께 로드 (기본값)
    const basePath = '/epik-stamp-statistics';
    fetch(`${basePath}/data.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((res) => res.json())
      .catch((err) => {
        console.error('전체 데이터 로딩 실패:', err);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <div className="text-gray-400 text-lg">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!weeklyData || weeklyData.weeks.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">주차별 데이터를 불러올 수 없습니다</div>
          <div className="text-gray-500 text-sm">weekly-data.json 파일을 확인해주세요</div>
        </div>
      </div>
    );
  }

  // 전체 주차 합산 데이터
  const allWeeksData = weeklyData.weeks.reduce(
    (acc, week) => {
      // 스탬프 합산 (중복 제거)
      const stampMap = new Map<string, typeof week.stamps[0]>();
      
      // 기존 스탬프와 새 주차 스탬프 합산
      acc.stamps.forEach((stamp) => {
        const key = stamp.categoryName.toLowerCase().trim();
        stampMap.set(key, { ...stamp });
      });
      
      week.stamps.forEach((stamp) => {
        const key = stamp.categoryName.toLowerCase().trim();
        if (stampMap.has(key)) {
          const existing = stampMap.get(key)!;
          existing.select += stamp.select;
          existing.save += stamp.save;
          existing.subscribe += stamp.subscribe;
          existing.savePercent = (existing.save / existing.select) * 100;
        } else {
          stampMap.set(key, { ...stamp });
        }
      });
      
      acc.stamps = Array.from(stampMap.values());
      
      // 합산된 스탬프 데이터로 totals 재계산
      acc.totals.select = acc.stamps.reduce((sum, s) => sum + s.select, 0);
      acc.totals.save = acc.stamps.reduce((sum, s) => sum + s.save, 0);
      acc.totals.subscribe = acc.stamps.reduce((sum, s) => sum + s.subscribe, 0);
      
      return acc;
    },
    {
      totals: { select: 0, save: 0, subscribe: 0 },
      stamps: [] as typeof weeklyData.weeks[0]['stamps']
    }
  );

  // 전체 주차 데이터 정렬
  allWeeksData.stamps.sort((a, b) => b.subscribe - a.subscribe);

  const currentData = useAllWeeks 
    ? allWeeksData 
    : weeklyData.weeks.find(w => w.week === selectedWeek) || weeklyData.weeks[0];

  const filteredStamps = (currentData.stamps || []).filter((stamp) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const displayName = stamp.categoryName
      .replace(/^\d{6}_/, '')
      .replace(/_/g, ' ')
      .replace(/_pro$/, '')
      .trim()
      .toLowerCase();
    return displayName.includes(query) || stamp.categoryName.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      {/* 주차 선택 */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-gray-400 text-sm font-medium">주차 선택:</span>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setUseAllWeeks(true);
              setSelectedWeek(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
              useAllWeeks
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
            }`}
          >
            1월 ALL
          </button>
          {weeklyData.weeks.map((week) => (
            <button
              key={week.week}
              onClick={() => {
                setUseAllWeeks(false);
                setSelectedWeek(week.week);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                !useAllWeeks && selectedWeek === week.week
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              {week.weekName}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-10">
        <SummaryCards totals={currentData.totals} />
      </div>

      {/* Stamp List */}
      <StampList
        stamps={filteredStamps}
        onThumbnailUpdate={onThumbnailUpdate}
      />
    </div>
  );
}
