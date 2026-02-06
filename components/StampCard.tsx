'use client';

import { useState } from 'react';
import { MousePointerClick, Heart, UserPlus, TrendingUp, Edit2 } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import ThumbnailUploadModal from './ThumbnailUploadModal';

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

interface StampCardProps {
  stamp: Stamp;
  rank: number;
  onThumbnailUpdate?: (stampName: string, thumbnailUrl: string) => void;
}

export default function StampCard({ stamp, rank, onThumbnailUpdate }: StampCardProps) {
  const { isAdminMode } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentThumbnail, setCurrentThumbnail] = useState(stamp.thumbnail);

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
    // 100%를 넘는 경우도 정확하게 표시 (데이터 특성상 가능)
    if (num > 1000) {
      return num.toFixed(0) + '%';
    }
    if (num > 100) {
      return num.toFixed(1) + '%';
    }
    return num.toFixed(1) + '%';
  };

  // CategoryName에서 날짜 부분 제거하고 깔끔하게 표시
  const displayName = stamp.categoryName
    .replace(/^\d{6}_/, '')
    .replace(/_/g, ' ')
    .replace(/_pro$/, '')
    .trim();

  // 메달 아이콘 컴포넌트 - 플랫 디자인
  const MedalIcon = ({ rank }: { rank: number }) => {
    const medalConfig = {
      1: { 
        medalColor: '#FFD700', // 금색
        ribbonColor: '#EF4444', // 빨간색
        textColor: '#FFFFFF'
      },
      2: { 
        medalColor: '#C0C0C0', // 은색
        ribbonColor: '#3B82F6', // 파란색
        textColor: '#FFFFFF'
      },
      3: { 
        medalColor: '#CD7F32', // 동색
        ribbonColor: '#10B981', // 초록색
        textColor: '#FFFFFF'
      },
      4: { 
        medalColor: '#CD7F32', // 동색
        ribbonColor: '#10B981', // 초록색
        textColor: '#FFFFFF'
      },
      5: { 
        medalColor: '#CD7F32', // 동색
        ribbonColor: '#10B981', // 초록색
        textColor: '#FFFFFF'
      },
    };
    
    const config = medalConfig[rank as keyof typeof medalConfig] || medalConfig[3];
    
    return (
      <div className="relative flex items-center justify-center" style={{ width: '26px', height: '26px' }}>
        {/* V자 리본 */}
        <svg 
          className="absolute left-1/2 -translate-x-1/2" 
          style={{ top: '-8px', width: '16px', height: '10px' }}
          viewBox="0 0 12 8" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0 8 L6 0 L12 8 Z" 
            fill={config.ribbonColor}
          />
        </svg>
        
        {/* 메달 원형 */}
        <svg 
          style={{ width: '26px', height: '26px' }}
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle 
            cx="10" 
            cy="10" 
            r="9" 
            fill={config.medalColor}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="0.5"
          />
          <text 
            x="10" 
            y="14" 
            fontSize="12" 
            fontWeight="bold" 
            fill={config.textColor}
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {rank}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/40 via-gray-900/30 to-black/40 backdrop-blur-sm p-5 transition-all duration-300 hover:border-gray-700/60 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02] hover:-translate-y-1">
      {/* Rank Medal Badge - 1위부터 5위까지 */}
      {rank <= 5 && (
        <div className="absolute top-3 left-3 z-10">
          <MedalIcon rank={rank} />
        </div>
      )}

      {/* NEW Badge */}
      {stamp.isNew && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <div className="flex items-center justify-center px-2.5 py-1 rounded-full bg-gradient-to-r from-green-500/40 to-emerald-500/40 border-2 border-green-400/60 text-xs font-bold text-white shadow-lg shadow-green-500/30">
            NEW
          </div>
        </div>
      )}

      {/* Thumbnail */}
      <div className="w-full aspect-square mb-4 rounded-xl overflow-hidden bg-gray-800/30 border border-gray-700/30 group-hover:border-gray-600/50 transition-colors relative group/thumbnail">
        {/* Edit Button - 관리자 모드일 때만 표시 */}
        {isAdminMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-gray-300 hover:text-white transition-all opacity-0 group-hover/thumbnail:opacity-100 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50"
            title="썸네일 편집"
          >
            <Edit2 size={14} />
          </button>
        )}
        <img
          src={(() => {
            // 썸네일 URL 생성 로직 - 로컬 썸네일 이미지 우선 사용
            // 업데이트된 썸네일이 있으면 우선 사용
            const thumbnailToUse = currentThumbnail || stamp.thumbnail;
            
            // 1. CategoryName이 없으면 플레이스홀더 (이미 process-data.js에서 제외되지만 안전장치)
            if (!stamp.categoryName || stamp.categoryName.trim() === '') {
              return 'https://via.placeholder.com/280x280.png?text=No+Name';
            }
            
            // 2. thumbnail 필드 검증 및 사용
            if (thumbnailToUse && typeof thumbnailToUse === 'string') {
              const thumbStr = thumbnailToUse.trim();
              
              // ID 패턴 완전 차단: MongoDB ObjectId (24자 hex), 짧은 hex, /로 시작하는 ID 등
              const isIdPattern = /^[a-f0-9]{24}$/i.test(thumbStr) || // MongoDB ObjectId
                                  /^[a-f0-9]{12,32}$/i.test(thumbStr) || // 일반 hex ID
                                  /^\/[a-f0-9]/i.test(thumbStr) || // /로 시작하는 ID
                                  /^[a-f0-9-]{20,}$/i.test(thumbStr); // 하이픈 포함 ID
              
              // 유효한 경로인지 확인
              // /thumbnails/로 시작하는 로컬 경로 또는 http로 시작하는 외부 URL
              if ((thumbStr.startsWith('/thumbnails/') || thumbStr.startsWith('http')) && 
                  thumbStr.length > 10 &&
                  !isIdPattern) {
                return thumbStr;
              }
            }
            
            // 3. CategoryName 기반 로컬 썸네일 경로 생성
            const cleanName = stamp.categoryName.trim();
            return `/thumbnails/${cleanName}.png`;
          })()}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // 이미지 로드 실패 시 Fallback 이미지로 교체
            const target = e.target as HTMLImageElement;
            const currentSrc = target.src || '';
            
            // 현재 src가 ID 패턴인지 확인 (혹시 모를 경우 대비)
            const isIdPattern = /^[a-f0-9]{24}$/i.test(currentSrc) ||
                                /^[a-f0-9]{12,32}$/i.test(currentSrc) ||
                                /\/[a-f0-9]{12,32}$/i.test(currentSrc);
            
            // ID 패턴이거나 이미 fallback이 아니면 교체
            if (isIdPattern || !currentSrc.includes('via.placeholder.com')) {
              target.src = 'https://via.placeholder.com/280x280.png?text=No+Image';
              target.onerror = null; // 무한 루프 방지
            }
          }}
        />
      </div>

      {/* Category Name */}
      <h3 className="text-sm font-semibold text-white mb-4 line-clamp-2 min-h-[2.5rem] group-hover:text-gray-100 transition-colors">
        {displayName}
      </h3>

      {/* Save% - Main Metric */}
      <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-purple-500/15 border border-purple-500/30 group-hover:border-purple-400/40 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-300 font-medium">Save%</span>
              <span className="text-[10px] text-gray-500">(Save/Select)</span>
            </div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {formatPercent(stamp.savePercent)}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="flex flex-col items-center p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/30 group-hover:bg-gray-800/40 group-hover:border-blue-500/30 transition-all">
          <MousePointerClick size={16} className="text-blue-400 mb-1.5" />
          <span className="text-xs text-gray-400 mb-1 font-medium">Select</span>
          <span className="text-xs font-bold text-white">
            {formatNumber(stamp.select)}
          </span>
        </div>
        <div className="flex flex-col items-center p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/30 group-hover:bg-gray-800/40 group-hover:border-pink-500/30 transition-all">
          <Heart size={16} className="text-pink-400 mb-1.5" />
          <span className="text-xs text-gray-400 mb-1 font-medium">Save</span>
          <span className="text-xs font-bold text-white" title={`저장된 총 건수: ${stamp.save.toLocaleString()}건`}>
            {formatNumber(stamp.save)}
          </span>
        </div>
        <div className="flex flex-col items-center p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/30 group-hover:bg-gray-800/40 group-hover:border-purple-500/30 transition-all">
          <UserPlus size={16} className="text-purple-400 mb-1.5" />
          <span className="text-xs text-gray-400 mb-1 font-medium">Subs</span>
          <span className="text-xs font-bold text-white">
            {formatNumber(stamp.subscribe)}
          </span>
        </div>
      </div>

      {/* Type & Position Badge */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        {stamp.type && (
          <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 font-medium">
            {stamp.type}
          </span>
        )}
        {stamp.position && (
          <span className="text-xs px-2.5 py-1 rounded-lg bg-green-500/20 text-green-300 border border-green-500/40 font-medium">
            {stamp.position}
          </span>
        )}
      </div>

      {/* Hover Effect Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-purple-500/5 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      {/* Thumbnail Upload Modal */}
      <ThumbnailUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stampName={stamp.categoryName}
        currentThumbnail={currentThumbnail || undefined}
        onUploadSuccess={(stampName, imageUrl) => {
          setCurrentThumbnail(imageUrl);
          if (onThumbnailUpdate) {
            onThumbnailUpdate(stampName, imageUrl);
          }
        }}
      />
    </div>
  );
}
