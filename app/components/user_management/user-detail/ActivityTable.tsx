'use client';

import { useState } from 'react';

interface ActivityItem {
  id: number;
  action: string;
  icon: string;
  color: string;
  details: string;
  date: string;
  ipAddress: string;
}

const initialActivities: ActivityItem[] = [
  {
    id: 1,
    action: 'Updated Settings',
    icon: 'settings',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-[#3b82f6]',
    details: 'Changed notification preferences',
    date: 'Oct 24, 2023 14:30',
    ipAddress: '192.168.1.1',
  },
  {
    id: 2,
    action: 'Password Change',
    icon: 'lock',
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    details: 'User updated security credentials',
    date: 'Oct 22, 2023 09:15',
    ipAddress: '192.168.1.1',
  },
  {
    id: 3,
    action: 'Added to Group',
    icon: 'group_add',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    details: "Added to 'Product Managers'",
    date: 'Oct 20, 2023 11:45',
    ipAddress: '10.0.0.5',
  },
  {
    id: 4,
    action: 'Logged In',
    icon: 'login',
    color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    details: 'Successful login via Web',
    date: 'Oct 18, 2023 08:00',
    ipAddress: '192.168.1.1',
  },
];

export default function ActivityTable() {
  const [activities] = useState<ActivityItem[]>(initialActivities);

  return (
    <>
      <div className="flex items-center justify-between p-5 border-b border-[#e5e7eb] dark:border-[#324467]">
        <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight">
          Recent Activity
        </h3>
        <button className="text-[#3b82f6] text-sm font-bold hover:underline transition-colors">
          View All
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#1a2336]">
              <th className="p-4 text-xs font-medium text-[#637588] dark:text-[#92a4c9] uppercase tracking-wider">
                Action
              </th>
              <th className="p-4 text-xs font-medium text-[#637588] dark:text-[#92a4c9] uppercase tracking-wider">
                Details
              </th>
              <th className="p-4 text-xs font-medium text-[#637588] dark:text-[#92a4c9] uppercase tracking-wider">
                Date
              </th>
              <th className="p-4 text-xs font-medium text-[#637588] dark:text-[#92a4c9] uppercase tracking-wider text-right">
                IP Address
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#324467]">
            {activities.map((activity) => (
              <tr 
                key={activity.id} 
                className="group hover:bg-gray-50 dark:hover:bg-[#2a3855] transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-full flex items-center justify-center ${activity.color}`}>
                      <span className="material-symbols-outlined text-[18px]">{activity.icon}</span>
                    </div>
                    <span className="text-[#111418] dark:text-white font-medium text-sm">
                      {activity.action}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-[#637588] dark:text-[#92a4c9] text-sm">
                    {activity.details}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-[#111418] dark:text-white text-sm">{activity.date}</span>
                </td>
                <td className="p-4 text-right">
                  <span className="text-[#637588] dark:text-[#92a4c9] font-mono text-xs">
                    {activity.ipAddress}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-[#e5e7eb] dark:border-[#324467] bg-gray-50 dark:bg-[#1a2336] flex justify-center">
        <button className="text-[#637588] dark:text-[#92a4c9] hover:text-[#111418] dark:hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
          Load older activity <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
      </div>
    </>
  );
}