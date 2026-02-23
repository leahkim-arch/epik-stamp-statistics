'use client';

import { useState } from 'react';
import { MousePointerClick, Heart, UserPlus, TrendingUp, Edit2, Plus } from 'lucide-react';
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

  // 메달 아이콘 컴포넌트 - 이모지 스타일 (🥇)
  const MedalIcon = ({ rank }: { rank: number }) => {
    const medalConfig = {
      1: { 
        medalColor: '#FFD700', // 금색
        medalShadow: '#FFA500', // 금색 그림자
        ribbonColor: '#EF4444', // 빨간색 리본
        textColor: '#FFFFFF'
      },
      2: { 
        medalColor: '#C0C0C0', // 은색
        medalShadow: '#808080', // 은색 그림자
        ribbonColor: '#3B82F6', // 파란색 리본
        textColor: '#FFFFFF'
      },
      3: { 
        medalColor: '#CD7F32', // 동색
        medalShadow: '#8B4513', // 동색 그림자
        ribbonColor: '#10B981', // 초록색 리본
        textColor: '#FFFFFF'
      },
      4: { 
        medalColor: '#CD7F32', // 동색
        medalShadow: '#8B4513', // 동색 그림자
        ribbonColor: '#10B981', // 초록색 리본
        textColor: '#FFFFFF'
      },
      5: { 
        medalColor: '#CD7F32', // 동색
        medalShadow: '#8B4513', // 동색 그림자
        ribbonColor: '#10B981', // 초록색 리본
        textColor: '#FFFFFF'
      },
    };
    
    const config = medalConfig[rank as keyof typeof medalConfig] || medalConfig[3];
    
    return (
      <div className="relative flex items-center justify-center" style={{ width: '36px', height: '40px' }}>
        <svg 
          style={{ width: '36px', height: '40px' }}
          viewBox="0 0 36 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 리본 (V자 형태, 메달 위쪽 중앙) */}
          <path 
            d="M12 8 L18 2 L24 8 L24 12 L18 10 L12 12 Z" 
            fill={config.ribbonColor}
          />
          {/* 리본 하이라이트 */}
          <path 
            d="M12 8 L18 2 L24 8 L24 10 L18 8 L12 10 Z" 
            fill="rgba(255, 255, 255, 0.3)"
          />
          {/* 리본 그림자 */}
          <path 
            d="M12 8 L18 2 L24 8 L24 12 L18 10 L12 12 Z" 
            fill="rgba(0, 0, 0, 0.2)"
            transform="translate(0, 1)"
          />
          
          {/* 메달 원형 (이모지 스타일) - 입체감을 위한 그라데이션 */}
          <defs>
            <radialGradient id={`medalGradient-${rank}`} cx="50%" cy="30%">
              <stop offset="0%" stopColor={config.medalColor} stopOpacity="1" />
              <stop offset="100%" stopColor={config.medalShadow} stopOpacity="1" />
            </radialGradient>
          </defs>
          
          {/* 메달 그림자 (뒤쪽) */}
          <circle 
            cx="18" 
            cy="26" 
            r="11" 
            fill="rgba(0, 0, 0, 0.3)"
            transform="translate(1, 1)"
          />
          
          {/* 메달 원형 */}
          <circle 
            cx="18" 
            cy="25" 
            r="11" 
            fill={`url(#medalGradient-${rank})`}
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="0.8"
          />
          
          {/* 메달 상단 하이라이트 */}
          <ellipse 
            cx="18" 
            cy="18" 
            rx="7" 
            ry="4" 
            fill="rgba(255, 255, 255, 0.3)"
          />
          
          {/* 메달 내부 테두리 */}
          <circle 
            cx="18" 
            cy="25" 
            r="9" 
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="0.5"
          />
          
          {/* 숫자 */}
          <text 
            x="18" 
            y="29" 
            fontSize="13" 
            fontWeight="bold" 
            fill={config.textColor}
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth="0.8"
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
          key={`${stamp.categoryName}-${currentThumbnail || stamp.thumbnail}`} // key를 추가하여 썸네일 변경 시 이미지 강제 리로드
          src={(() => {
            // 썸네일 URL 생성 로직 - 로컬 썸네일 이미지 우선 사용
            // 업데이트된 썸네일이 있으면 우선 사용
            const thumbnailToUse = currentThumbnail || stamp.thumbnail;
            
            // 1. CategoryName이 없으면 플레이스홀더 (이미 process-data.js에서 제외되지만 안전장치)
            if (!stamp.categoryName || stamp.categoryName.trim() === '') {
              return 'https://via.placeholder.com/280x280.png?text=No+Name';
            }
            
            // 2. thumbnail 필드 검증 및 사용
            let finalUrl = '';
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
                finalUrl = thumbStr;
              }
            }
            
            // 3. CategoryName 기반 로컬 썸네일 경로 생성
            if (!finalUrl) {
              const cleanName = stamp.categoryName.trim();
              finalUrl = `/thumbnails/${cleanName}.png`;
            }
            
            // 업로드된 썸네일인 경우 타임스탬프 추가하여 캐시 무시
            if (currentThumbnail && finalUrl.startsWith('/thumbnails/')) {
              return `${finalUrl}?t=${Date.now()}`;
            }
            
            return finalUrl;
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

      {/* Subscribe - Main Metric */}
      <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-purple-500/15 border border-purple-500/30 group-hover:border-purple-400/40 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-purple-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-300 font-medium">Subscribe</span>
              <span className="text-[10px] text-gray-500">구독자 수</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Plus size={16} className="text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              {formatNumber(stamp.subscribe)}
            </span>
          </div>
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
          <TrendingUp size={16} className="text-purple-400 mb-1.5" />
          <span className="text-xs text-gray-400 mb-1 font-medium">Save%</span>
          <span className="text-xs font-bold text-white">
            {formatPercent(stamp.savePercent)}
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
          // 쿼리 파라미터 제거하고 순수 URL만 저장
          const cleanUrl = imageUrl.split('?')[0];
          setCurrentThumbnail(cleanUrl);
          if (onThumbnailUpdate) {
            onThumbnailUpdate(stampName, cleanUrl);
          }
        }}
      />
    </div>
  );
}
