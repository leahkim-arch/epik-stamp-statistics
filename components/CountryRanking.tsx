'use client';

import { useEffect, useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

// 국가별 아이콘 함수
const getCountryIcon = (country: string) => {
  if (country.includes('KR')) {
    return '🇰🇷';
  } else if (country.includes('JP')) {
    return '🇯🇵';
  } else {
    return '🌏';
  }
};

interface CountryRankingData {
  weeks: Array<{
    week: number;
    countries: Array<{
      country: string;
      stamps: Array<{
        categoryId: string;
        categoryName: string;
        type: string;
        position: string;
        select: number;
        save: number;
        subscribe: number;
        savePercent: number;
        rank: number;
      }>;
    }>;
  }>;
}

export default function CountryRanking() {
  const [data, setData] = useState<CountryRankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [useAllWeeks, setUseAllWeeks] = useState(false);

  useEffect(() => {
    const basePath = '/epik-stamp-statistics';
    fetch(`${basePath}/country-ranking.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setData(data);
        if (data && data.weeks && data.weeks.length > 0) {
          // 기본값: 첫 번째 주차 선택
          setUseAllWeeks(false);
          setSelectedWeek(data.weeks[0].week);
          if (data.weeks[0].countries && data.weeks[0].countries.length > 0) {
            setSelectedCountry(data.weeks[0].countries[0].country);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('국가별 랭킹 데이터 로딩 실패:', err);
        setLoading(false);
      });
  }, []);

  // 1월 합산 데이터 계산 (useMemo로 최적화) - early return 전에 호출해야 함!
  const allWeeksData = useMemo(() => {
    if (!data || !data.weeks || data.weeks.length === 0) return null;

    try {
      const countryMap = new Map<string, {
        country: string;
        stamps: Map<string, {
          categoryId: string;
          categoryName: string;
          type: string;
          position: string;
          select: number;
          save: number;
          subscribe: number;
          savePercent: number;
        }>;
      }>();

      // 모든 주차의 데이터를 순회하며 합산
      data.weeks.forEach(week => {
        if (!week || !week.countries || !Array.isArray(week.countries)) return;
        
        week.countries.forEach(country => {
          if (!country || !country.country || !country.stamps || !Array.isArray(country.stamps)) return;
          
          // 국가별 데이터 초기화
          if (!countryMap.has(country.country)) {
            countryMap.set(country.country, {
              country: country.country,
              stamps: new Map()
            });
          }

          const countryData = countryMap.get(country.country);
          if (!countryData) return;

          // 각 스탬프의 데이터를 합산
          country.stamps.forEach(stamp => {
            if (!stamp || !stamp.categoryName) return;
            const key = stamp.categoryName.toLowerCase().trim();
            
            if (countryData.stamps.has(key)) {
              // 이미 존재하는 스탬프면 수치를 합산
              const existing = countryData.stamps.get(key);
              if (existing) {
                existing.select += stamp.select || 0;
                existing.save += stamp.save || 0;
                existing.subscribe += stamp.subscribe || 0;
                // Save% 재계산
                if (existing.select > 0) {
                  existing.savePercent = (existing.save / existing.select) * 100;
                }
              }
            } else {
              // 새로운 스탬프면 추가
              countryData.stamps.set(key, {
                categoryId: stamp.categoryId || '',
                categoryName: stamp.categoryName,
                type: stamp.type || '',
                position: stamp.position || '',
                select: stamp.select || 0,
                save: stamp.save || 0,
                subscribe: stamp.subscribe || 0,
                savePercent: stamp.savePercent || 0
              });
            }
          });
        });
      });

      // 합산된 데이터를 배열로 변환하고 Subscribe 기준으로 정렬하여 순위 부여
      return Array.from(countryMap.values()).map(country => ({
        ...country,
        stamps: Array.from(country.stamps.values())
          .sort((a, b) => (b.subscribe || 0) - (a.subscribe || 0))
          .map((stamp, idx) => ({ ...stamp, rank: idx + 1 }))
      }));
    } catch (error) {
      console.error('1월 합산 데이터 계산 중 오류:', error);
      return null;
    }
  }, [data]);

  // 현재 선택된 주차 데이터
  const currentWeekData = useAllWeeks ? null : (data?.weeks?.find(w => w.week === selectedWeek) || null);
  
  // 현재 선택된 국가 데이터
  const currentCountryData = useMemo(() => {
    if (useAllWeeks) {
      if (!allWeeksData || !selectedCountry) return null;
      return allWeeksData.find(c => c && c.country === selectedCountry) || null;
    } else {
      if (!currentWeekData || !selectedCountry) return null;
      return currentWeekData.countries?.find(c => c && c.country === selectedCountry) || null;
    }
  }, [useAllWeeks, allWeeksData, currentWeekData, selectedCountry]);

  // 사용 가능한 국가 목록
  const availableCountries = useMemo(() => {
    if (useAllWeeks) {
      return allWeeksData || [];
    } else {
      return currentWeekData?.countries || [];
    }
  }, [useAllWeeks, allWeeksData, currentWeekData]);

  // early return은 모든 hooks 호출 후에!
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <div className="text-gray-400 text-lg">국가별 랭킹 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!data || !data.weeks || data.weeks.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">데이터를 불러올 수 없습니다</div>
          <div className="text-gray-500 text-sm">country-ranking.json 파일을 확인해주세요</div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatPercent = (num: number) => {
    if (num < 0.1) {
      return '<0.1%';
    }
    if (num > 1000) {
      return num.toFixed(0) + '%';
    }
    if (num > 100) {
      return num.toFixed(1) + '%';
    }
    return num.toFixed(1) + '%';
  };

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
              if (allWeeksData && allWeeksData.length > 0) {
                // 선택된 국가가 없거나 합산 데이터에 없는 경우 첫 번째 국가 선택
                if (!selectedCountry || !allWeeksData.find(c => c && c.country === selectedCountry)) {
                  setSelectedCountry(allWeeksData[0]?.country || null);
                }
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
              useAllWeeks
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
            }`}
          >
            1월 합산
          </button>
          {data?.weeks.map((week) => (
            <button
              key={week.week}
              onClick={() => {
                setUseAllWeeks(false);
                setSelectedWeek(week.week);
                if (week.countries && week.countries.length > 0) {
                  setSelectedCountry(week.countries[0].country);
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                !useAllWeeks && selectedWeek === week.week
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              {week.week}주차
            </button>
          ))}
        </div>
      </div>

      {/* 국가 선택 */}
      {availableCountries && availableCountries.length > 0 && (
        <div className="flex items-center gap-4 mb-6">
          <span className="text-gray-400 text-sm font-medium">국가 선택:</span>
          <div className="flex gap-2">
            {availableCountries.map((country) => {
              if (!country || !country.country) return null;
              return (
                <button
                  key={country.country}
                  onClick={() => setSelectedCountry(country.country)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCountry === country.country
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
                  }`}
                >
                  <span className="text-lg">{getCountryIcon(country.country)}</span>
                  {country.country}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 랭킹 테이블 */}
      {currentCountryData && currentCountryData.stamps && currentCountryData.stamps.length > 0 ? (
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-800/50">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp size={24} className="text-purple-400" />
              {useAllWeeks ? '1월 합산' : (selectedWeek ? `${selectedWeek}주차` : '')} {currentCountryData.country || ''} 랭킹
            </h2>
            <p className="text-sm text-gray-400">총 {currentCountryData.stamps.length}개 스탬프</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">순위</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">스탬프</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Select</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Save</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Subscribe</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Save%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {currentCountryData.stamps.map((stamp) => {
                  if (!stamp || !stamp.categoryName) return null;
                  const displayName = stamp.categoryName
                    .replace(/^\d{6}_/, '')
                    .replace(/_/g, ' ')
                    .replace(/_pro$/, '')
                    .trim();

                  return (
                    <tr
                      key={stamp.categoryId || stamp.categoryName}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          stamp.rank <= 3
                            ? stamp.rank === 1
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : stamp.rank === 2
                              ? 'bg-gray-400/20 text-gray-300'
                              : 'bg-amber-600/20 text-amber-300'
                            : 'bg-gray-800/50 text-gray-400'
                        }`}>
                          {stamp.rank || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{displayName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {stamp.type && <span className="mr-2">{stamp.type}</span>}
                          {stamp.position && <span>{stamp.position}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                        {formatNumber(stamp.select || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                        {formatNumber(stamp.save || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-purple-300 font-medium">
                        {formatNumber(stamp.subscribe || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-pink-300 font-medium">
                        {formatPercent(stamp.savePercent || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : currentCountryData ? (
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-8 text-center">
          <p className="text-gray-400">선택한 국가의 데이터가 없습니다.</p>
        </div>
      ) : null}
    </div>
  );
}
