'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Lock, Unlock } from 'lucide-react';

export default function AdminToggle() {
  const { isAdminMode, toggleAdminMode } = useAdmin();
  const [showHint, setShowHint] = useState(false);

      // 컴포넌트 마운트 시 키보드 이벤트 테스트
  useEffect(() => {
    const testKeyHandler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'k' || e.key === 'K')) {
        console.log('키보드 이벤트 감지됨:', {
          metaKey: e.metaKey,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          key: e.key,
        });
      }
    };
    
    document.addEventListener('keydown', testKeyHandler, true);
    return () => document.removeEventListener('keydown', testKeyHandler, true);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => {
          toggleAdminMode();
          setShowHint(false);
        }}
        onMouseEnter={() => setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          text-xs font-medium transition-all duration-200
          ${isAdminMode 
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30' 
            : 'bg-gray-800/50 text-gray-400 border border-gray-700/30 hover:bg-gray-800/70'
          }
          backdrop-blur-sm shadow-lg
        `}
        title={isAdminMode ? '관리자 모드 끄기 (Cmd+Shift+K / Ctrl+Shift+K)' : '관리자 모드 켜기 (Cmd+Shift+K / Ctrl+Shift+K)'}
      >
        {isAdminMode ? (
          <>
            <Unlock size={14} />
            <span>관리자 모드</span>
          </>
        ) : (
          <>
            <Lock size={14} />
            <span>일반 모드</span>
          </>
        )}
      </button>
      
      {/* 힌트 메시지 */}
      {showHint && !isAdminMode && (
          <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 whitespace-nowrap shadow-lg">
          클릭하거나 Cmd+Shift+K를 눌러주세요
        </div>
      )}
    </div>
  );
}
