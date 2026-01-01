
const ActiveTableSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shadow-sm animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111722]/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex flex-col gap-1">
                      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-2 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="inline-block h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ActiveTableSkeleton;
