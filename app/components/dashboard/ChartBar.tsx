"use client";
import { useAppSelector } from "@/app/store/hooks";
import NoData from "@/app/NoData";
const ChartBar = () => {
  const { chart } = useAppSelector((state) => state.dashboard);

  const maxValue = Math.max(...chart.map((item) => item.maxValue));

  if (chart && chart.length == 0) {
    return <NoData />;
  }

  return (
    <div className="relative h-48 w-full flex items-end justify-between gap-2 px-2">
      {chart.map((item, index) => {
        const heightPercentage = (item.value / maxValue) * 100;

        return (
          <div
            key={index}
            className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group transition-all duration-300"
            style={{ height: `${heightPercentage}%` }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {item.day}
            </div>
            <div
              className="w-full h-full bg-gradient-to-t from-primary/60 to-primary rounded-t-lg transition-all duration-300 group-hover:from-primary/80 group-hover:to-primary"
              style={{
                background: `linear-gradient(to top, 
                  rgba(59, 130, 246, ${0.2 + index * 0.1}), 
                  rgba(37, 99, 235, ${0.4 + index * 0.1}))`,
              }}
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-500 dark:text-slate-400">
              {item.day}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChartBar;
