
const ChartSkeleton = () => {
  return (
    <div className="relative w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] p-6 shadow-sm overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>

      {/* Chart Skeleton */}
      <div className="relative h-48 w-full flex items-end justify-between gap-2 px-2">
        <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-lg flex items-end justify-between gap-4 p-4">
          {/* Simulated Bars */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[30%]"></div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[50%]"></div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[40%]"></div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[70%]"></div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[80%]"></div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[60%]"></div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[45%]"></div>
        </div>
      </div>
    </div>
  );
};

export default ChartSkeleton;
