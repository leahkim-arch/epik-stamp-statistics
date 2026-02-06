'use client';

import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

interface BestPack {
  no: number;
  name: string;
  thumbnail: string | null;
  assetCount: number;
  releaseWeek: string;
  periods: Array<{
    period: string;
    nonSubsSelect: number;
    nonSubsSubsView: number;
    nonSubsSubsSuccess: number;
    subsSelect: number;
    subsSave: number;
  }>;
}

interface WeekData {
  week: number;
  weekName: string;
  packages: Array<{
    no: number;
    name: string;
    thumbnail: string | null;
    assetCount: number;
    nonSubsSelect: number;
    nonSubsSubsView: number;
    nonSubsSubsSuccess: number;
    select: number;
    save: number;
  }>;
  topAssets: Array<{
    rank: number;
    title: string;
    categories: string;
    thumbnail: string | null;
    select: number;
    save: number;
    savePercent: number;
    editorFavorite: number;
  }>;
}

interface NewStampPackData {
  bestPack: {
    packs: BestPack[];
  };
  weeks: WeekData[];
}

export default function NewStampPack() {
  const [data, setData] = useState<NewStampPackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'bestPack' | number>('bestPack');
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  useEffect(() => {
    fetch('/new-stamp-pack.json')
      .then((res) => res.json())
      .then((data: NewStampPackData) => {
        setData(data);
        if (data.weeks.length > 0) {
          setSelectedWeek(data.weeks[0].week);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('신규 스탬프 팩 데이터 로딩 실패:', err);
        setLoading(false);
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

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">데이터를 불러올 수 없습니다</div>
          <div className="text-gray-500 text-sm">new-stamp-pack.json 파일을 확인해주세요</div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  const formatPercent = (num: number) => {
    if (num < 0.1) return '<0.1%';
    if (num > 1000) return num.toFixed(0) + '%';
    if (num > 100) return num.toFixed(1) + '%';
    return num.toFixed(1) + '%';
  };

  const currentWeekData = selectedWeek ? data.weeks.find(w => w.week === selectedWeek) : null;

  return (
    <div className="space-y-8">
      {/* 뷰 선택 */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-gray-400 text-sm font-medium">뷰 선택:</span>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setSelectedView('bestPack');
              setSelectedWeek(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
              selectedView === 'bestPack'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
            }`}
          >
            <Sparkles size={14} className="inline mr-2" />
            1월 합산 (BEST PACK)
          </button>
          {data.weeks.map((week) => (
            <button
              key={week.week}
              onClick={() => {
                setSelectedView(week.week);
                setSelectedWeek(week.week);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                selectedView === week.week
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              {week.weekName}
            </button>
          ))}
        </div>
      </div>

      {/* BEST PACK 뷰 */}
      {selectedView === 'bestPack' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold text-white">BEST PACK (1월 합산)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.bestPack.packs.map((pack) => {
              // 출시주와 1주경과 데이터 분리
              const launchWeek = pack.periods.find(p => p.period.includes('출시주'));
              const afterWeek = pack.periods.find(p => p.period.includes('1주경과'));
              
              // 합산 데이터
              // const totalNonSubsSelect = pack.periods.reduce((sum, p) => sum + p.nonSubsSelect, 0);
              const totalNonSubsSubsSuccess = pack.periods.reduce((sum, p) => sum + p.nonSubsSubsSuccess, 0);
              // const totalSubsSelect = pack.periods.reduce((sum, p) => sum + p.subsSelect, 0);
              const totalSubsSave = pack.periods.reduce((sum, p) => sum + p.subsSave, 0);
              // const totalSelect = totalNonSubsSelect + totalSubsSelect; // 사용하지 않음
              const totalSave = totalSubsSave;

              return (
                <div
                  key={pack.no}
                  className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300"
                >
                  {/* 썸네일 - Performance 스타일처럼 크게 */}
                  <div className="mb-6">
                    {pack.thumbnail && (
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-800/30 mb-4">
                        <img
                          src={pack.thumbnail}
                          alt={pack.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/280x280.png?text=No+Image';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-400 font-bold text-xl">#{pack.no}</span>
                      <h3 className="text-white font-semibold text-lg line-clamp-2">
                        {pack.name.replace(/^\d{6}_/, '').replace(/_pro$/, '').replace(/_/g, ' ')}
                      </h3>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {pack.releaseWeek} • {pack.assetCount}개 에셋
                    </div>
                  </div>

                  {/* 합산 통계 */}
                  <div className="mb-4">
                    <div className="text-gray-400 text-xs mb-2 font-medium">전체 합산</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-800/50 rounded-lg p-2">
                        <div className="text-gray-400 text-xs mb-0.5">구독성공</div>
                        <div className="text-purple-400 font-bold text-sm">{formatNumber(totalNonSubsSubsSuccess)}</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2">
                        <div className="text-gray-400 text-xs mb-0.5">Save</div>
                        <div className="text-white font-bold text-sm">{formatNumber(totalSave)}</div>
                      </div>
                    </div>
                  </div>

                  {/* 출시주 / 1주경과 탭 */}
                  <div className="space-y-3">
                    {launchWeek && (
                      <div className="border border-blue-500/30 rounded-lg p-3 bg-blue-500/5">
                        <div className="text-blue-400 text-xs font-medium mb-2">출시주</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-gray-400">NonSubs Select</div>
                            <div className="text-white font-bold">{formatNumber(launchWeek.nonSubsSelect)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">NonSubs 성공</div>
                            <div className="text-purple-400 font-bold">{formatNumber(launchWeek.nonSubsSubsSuccess)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Subs Select</div>
                            <div className="text-white font-bold">{formatNumber(launchWeek.subsSelect)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Subs Save</div>
                            <div className="text-pink-400 font-bold">{formatNumber(launchWeek.subsSave)}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {afterWeek && (
                      <div className="border border-green-500/30 rounded-lg p-3 bg-green-500/5">
                        <div className="text-green-400 text-xs font-medium mb-2">1주경과</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-gray-400">NonSubs Select</div>
                            <div className="text-white font-bold">{formatNumber(afterWeek.nonSubsSelect)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">NonSubs 성공</div>
                            <div className="text-purple-400 font-bold">{formatNumber(afterWeek.nonSubsSubsSuccess)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Subs Select</div>
                            <div className="text-white font-bold">{formatNumber(afterWeek.subsSelect)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Subs Save</div>
                            <div className="text-pink-400 font-bold">{formatNumber(afterWeek.subsSave)}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 주차별 뷰 */}
      {selectedView !== 'bestPack' && currentWeekData && (
        <div className="space-y-8">
          {/* 패키지 결산 */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-blue-400" size={24} />
              <h3 className="text-2xl font-bold text-white">스탬프 패키지 결산</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentWeekData.packages.map((pkg) => (
                <div
                  key={pkg.no}
                  className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300"
                >
                  {/* 썸네일 - Performance 스타일처럼 크게 */}
                  <div className="mb-6">
                    {pkg.thumbnail && (
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-800/30 mb-4">
                        <img
                          src={pkg.thumbnail}
                          alt={pkg.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/280x280.png?text=No+Image';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-400 font-bold text-xl">#{pkg.no}</span>
                      <h3 className="text-white font-semibold text-lg line-clamp-2">
                        {pkg.name.replace(/^\d{6}_/, '').replace(/_pro$/, '').replace(/_/g, ' ')}
                      </h3>
                    </div>
                    <div className="text-gray-400 text-sm">{pkg.assetCount}개 에셋</div>
                  </div>

                  {/* 통계 데이터 */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-1">구독성공</div>
                      <div className="text-purple-400 font-bold text-base">{formatNumber(pkg.nonSubsSubsSuccess)}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-1">Select</div>
                      <div className="text-white font-bold text-base">{formatNumber(pkg.select)}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-1">Save</div>
                      <div className="text-white font-bold text-base">{formatNumber(pkg.save)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 개별 스탬프 에셋 Top 20 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-pink-400" size={18} />
              <h3 className="text-lg font-bold text-white">가장 많이 저장된 개별 스탬프 에셋 Top 20</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {currentWeekData.topAssets.map((asset) => (
                <div
                  key={asset.rank}
                  className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-2 hover:border-pink-500/50 transition-all duration-300"
                >
                  <div className="relative mb-2">
                    {asset.thumbnail && (
                      <img
                        src={asset.thumbnail}
                        alt={asset.title}
                        className="w-full aspect-square rounded-md object-cover"
                        style={{
                          imageRendering: 'crisp-edges',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/280x280.png?text=No+Image';
                        }}
                      />
                    )}
                    <div className="absolute top-1 left-1 bg-pink-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      #{asset.rank}
                    </div>
                  </div>
                  <div className="text-white font-semibold text-[10px] mb-1.5 line-clamp-2 leading-tight">
                    {asset.title.replace(/^\d{6}_/, '').replace(/_pro$/, '').replace(/_/g, ' ')}
                  </div>
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">S</span>
                      <span className="text-white font-bold">{formatNumber(asset.select)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sv</span>
                      <span className="text-white font-bold">{formatNumber(asset.save)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">%</span>
                      <span className="text-pink-400 font-bold">{formatPercent(asset.savePercent)}</span>
                    </div>
                    {asset.editorFavorite > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">⭐</span>
                        <span className="text-yellow-400 font-bold">{asset.editorFavorite}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
