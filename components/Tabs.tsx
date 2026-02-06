'use client';

import { useState, ReactNode, Children, isValidElement } from 'react';

interface TabsProps {
  children: ReactNode;
  tabs: Array<{ id: string; label: string }>;
  defaultTab?: string;
}

interface TabContentProps {
  tabId: string;
  children: ReactNode;
}

export function TabContent({ tabId, children }: TabContentProps) {
  return <div data-tab-id={tabId}>{children}</div>;
}

export default function Tabs({ children, tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-gray-800/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium text-sm transition-all duration-300 relative ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {Children.map(children, (child) => {
          if (isValidElement(child) && child.props.tabId === activeTab) {
            return child;
          }
          return null;
        })}
      </div>
    </div>
  );
}
