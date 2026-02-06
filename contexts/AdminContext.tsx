'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(false);

  // 키보드 단축키 (Cmd+Shift+K 또는 Ctrl+Shift+K)로 관리자 모드 토글
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+K (Mac) 또는 Ctrl+Shift+K (Windows/Linux)
      // 대소문자 구분 없이 처리
      const isKKey = e.key === 'k' || e.key === 'K';
      const isModifierPressed = (e.metaKey || e.ctrlKey) && e.shiftKey;
      
      if (isModifierPressed && isKKey && !e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        setIsAdminMode((prev) => {
          const newState = !prev;
          console.log('관리자 모드:', newState ? 'ON' : 'OFF');
          return newState;
        });
      }
    };

    // capture phase에서 이벤트를 잡아서 브라우저 기본 동작 방지
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const toggleAdminMode = () => {
    setIsAdminMode((prev) => !prev);
  };

  return (
    <AdminContext.Provider value={{ isAdminMode, toggleAdminMode }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
