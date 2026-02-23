'use client';

import { useState } from 'react';
import { AdminProvider } from '@/contexts/AdminContext';
import AdminToggle from '@/components/AdminToggle';
import Tabs, { TabContent } from '@/components/Tabs';
import CountryRanking from '@/components/CountryRanking';
import PerformanceTab from '@/components/PerformanceTab';
import NewStampPack from '@/components/NewStampPack';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleThumbnailUpdate = (stampName: string, thumbnailUrl: string) => {
    // PerformanceTab 내부에서 처리하므로 여기서는 빈 함수로 유지
    console.log('Thumbnail updated:', stampName, thumbnailUrl);
  };

  return (
    <AdminProvider>
      <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-[#ededed]">
        <AdminToggle />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-16 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 rounded-full"></div>
              <div>
                <h1 
                  onClick={() => {
                    // Performance 탭으로 전환
                    const performanceButton = document.querySelector('button[data-tab="performance"]') as HTMLElement;
                    if (performanceButton) {
                      performanceButton.click();
                    }
                  }}
                  className="text-6xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                >
                  EPIK STAMP
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-500 text-sm">Statistics</span>
                </div>
              </div>
            </div>
          </header>

          {/* Tabs */}
          <Tabs
            tabs={[
              { id: 'performance', label: '📁 Summary' },
              { id: 'country-ranking', label: '🌏 Country Ranking' },
              { id: 'new-stamp-pack', label: '✨ Monthly statistics' }
            ]}
            defaultTab="performance"
          >
            <TabContent tabId="performance">
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative max-w-2xl">
                  <input
                    type="text"
                    placeholder="Search stamps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 pl-12 bg-gray-900/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm"
                  />
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Performance Tab with Weekly Categories */}
              <PerformanceTab 
                searchQuery={searchQuery}
                onThumbnailUpdate={handleThumbnailUpdate}
              />
            </TabContent>

            <TabContent tabId="country-ranking">
              <CountryRanking />
            </TabContent>

            <TabContent tabId="new-stamp-pack">
              <NewStampPack />
            </TabContent>
          </Tabs>
        </div>
      </main>
    </AdminProvider>
  );
}
