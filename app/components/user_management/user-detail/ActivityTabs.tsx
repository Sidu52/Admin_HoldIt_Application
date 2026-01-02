'use client';

import { useState } from 'react';
import ActivityTable from './ActivityTable';

type TabType = 'overview' | 'activity' | 'login-history' | 'notes';

export default function ActivityTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'activity', label: 'Activity Log', icon: 'history' },
    { id: 'login-history', label: 'Login History', icon: 'vpn_key' },
    { id: 'notes', label: 'Notes', icon: 'description' },
  ] as const;

  return (
    <>
      {/* Tabs */}
      <div className="pb-6">
        <div className="flex border-b border-[#e5e7eb] dark:border-[#324467] gap-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-[3px] pb-[13px] pt-2 px-1 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-[#3b82f6] text-[#111418] dark:text-white'
                  : 'border-b-transparent text-[#637588] dark:text-[#92a4c9] hover:text-[#111418] dark:hover:text-white hover:border-b-gray-300 dark:hover:border-b-gray-600'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">{tab.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-[#232f48] rounded-xl border border-[#e5e7eb] dark:border-[#324467] overflow-hidden shadow-sm">
        {activeTab === 'overview' && <ActivityTable />}
        {activeTab === 'activity' && <div className="p-5">Activity Log Content</div>}
        {activeTab === 'login-history' && <div className="p-5">Login History Content</div>}
        {activeTab === 'notes' && <div className="p-5">Notes Content</div>}
      </div>
    </>
  );
}