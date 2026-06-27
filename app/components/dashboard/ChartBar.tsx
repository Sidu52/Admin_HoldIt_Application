"use client";
import { useMemo } from "react";
import NoData from "@/app/NoData";

// ── Color palette for chart segments ──
const CHART_COLORS = [
  { fill: "#6366f1", gradient: ["#818cf8", "#4f46e5"], bg: "rgba(99,102,241,0.12)" },
  { fill: "#f59e0b", gradient: ["#fbbf24", "#d97706"], bg: "rgba(245,158,11,0.12)" },
  { fill: "#10b981", gradient: ["#34d399", "#059669"], bg: "rgba(16,185,129,0.12)" },
  { fill: "#ef4444", gradient: ["#f87171", "#dc2626"], bg: "rgba(239,68,68,0.12)" },
  { fill: "#8b5cf6", gradient: ["#a78bfa", "#7c3aed"], bg: "rgba(139,92,246,0.12)" },
  { fill: "#ec4899", gradient: ["#f472b6", "#db2777"], bg: "rgba(236,72,153,0.12)" },
  { fill: "#14b8a6", gradient: ["#2dd4bf", "#0d9488"], bg: "rgba(20,184,166,0.12)" },
  { fill: "#f97316", gradient: ["#fb923c", "#ea580c"], bg: "rgba(249,115,22,0.12)" },
  { fill: "#06b6d4", gradient: ["#22d3ee", "#0891b2"], bg: "rgba(6,182,212,0.12)" },
  { fill: "#84cc16", gradient: ["#a3e635", "#65a30d"], bg: "rgba(132,204,22,0.12)" },
  { fill: "#e879f9", gradient: ["#f0abfc", "#c026d3"], bg: "rgba(232,121,249,0.12)" },
  { fill: "#64748b", gradient: ["#94a3b8", "#475569"], bg: "rgba(100,116,139,0.12)" },
];

const getColor = (i: number) => CHART_COLORS[i % CHART_COLORS.length];

// ── Types ──
interface ChartDataItem {
  label: string;
  value: number;
}

interface ChartBarProps {
  data: { chart?: ChartDataItem[]; total?: number; entity?: string; range?: string } | null;
  chartType?: "bar" | "pie";
}

// ═══════════════════════════════════════════════
//  BAR CHART (pure CSS + inline SVG grid)
// ═══════════════════════════════════════════════
const BarChart = ({ chart, maxValue }: { chart: ChartDataItem[]; maxValue: number }) => {
  // Decide how many Y‑axis tick marks to show (max 5)
  const ticks = useMemo(() => {
    if (maxValue === 0) return [0];
    const step = Math.ceil(maxValue / 4);
    const arr: number[] = [];
    for (let v = 0; v <= maxValue; v += step) arr.push(v);
    if (arr[arr.length - 1] < maxValue) arr.push(maxValue);
    return arr;
  }, [maxValue]);

  // Determine if labels should be rotated (many items)
  const manyBars = chart.length > 12;

  return (
    <div className="flex h-full w-full gap-0">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between items-end pr-3 py-1 shrink-0 w-10">
        {[...ticks].reverse().map((t, i) => (
          <span key={i} className="text-[10px] font-semibold text-text-muted-light dark:text-text-muted-dark leading-none">
            {t}
          </span>
        ))}
      </div>

      {/* Chart area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Bars area with gridlines */}
        <div className="relative flex-1 flex items-end gap-[3px] sm:gap-1">
          {/* Horizontal grid lines */}
          {ticks.map((t, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-dashed border-border-light/50 dark:border-border-dark/50 pointer-events-none"
              style={{ bottom: `${(t / maxValue) * 100}%` }}
            />
          ))}

          {/* Bars */}
          {chart.map((item, index) => {
            const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            const color = getColor(index);

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-end min-w-0 relative group"
                style={{ height: "100%" }}
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                  <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap">
                    {item.label}: {item.value}
                  </div>
                </div>

                {/* Value label */}
                {item.value > 0 && (
                  <span className="text-[9px] font-bold text-text-muted-light dark:text-text-muted-dark mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.value}
                  </span>
                )}

                {/* Bar */}
                <div
                  className="w-full rounded-t-md transition-all duration-500 ease-out group-hover:brightness-110 group-hover:scale-x-105"
                  style={{
                    height: `${Math.max(pct, item.value > 0 ? 3 : 0)}%`,
                    background: `linear-gradient(to top, ${color.gradient[1]}, ${color.gradient[0]})`,
                    boxShadow: `0 -2px 8px ${color.fill}30`,
                    transition: "height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="flex gap-[3px] sm:gap-1 pt-2 border-t border-border-light/30 dark:border-border-dark/30 mt-1">
          {chart.map((item, i) => (
            <div key={i} className="flex-1 min-w-0 flex justify-center">
              <span
                className={`text-[9px] sm:text-[10px] font-semibold text-text-muted-light dark:text-text-muted-dark truncate ${
                  manyBars ? "writing-mode-vertical rotate-[-45deg] origin-top-left translate-y-1 translate-x-2" : ""
                }`}
                title={item.label}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
//  DONUT / PIE CHART (pure SVG)
// ═══════════════════════════════════════════════
const DonutChart = ({ chart, total }: { chart: ChartDataItem[]; total: number }) => {
  const size = 220;
  const strokeWidth = 38;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Filter out zero values for cleaner rendering
  const nonZero = chart.filter((d) => d.value > 0);
  const displayTotal = total || nonZero.reduce((s, d) => s + d.value, 0);

  // Build segments
  const segments = useMemo(() => {
    let accumulated = 0;
    return nonZero.map((item, i) => {
      const fraction = displayTotal > 0 ? item.value / displayTotal : 0;
      const dashLength = fraction * circumference;
      const offset = circumference - accumulated;
      accumulated += dashLength;

      return {
        ...item,
        fraction,
        dashArray: `${dashLength} ${circumference - dashLength}`,
        dashOffset: offset,
        color: getColor(i),
        index: i,
      };
    });
  }, [nonZero, displayTotal, circumference]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 h-full w-full py-4">
      {/* SVG Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border-light/20 dark:text-border-dark/20"
          />

          {/* Data segments */}
          {segments.map((seg) => (
            <circle
              key={seg.index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color.fill}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-700 ease-out hover:brightness-125"
              style={{
                filter: `drop-shadow(0 0 4px ${seg.color.fill}40)`,
              }}
            >
              <animate
                attributeName="stroke-dasharray"
                from={`0 ${circumference}`}
                to={seg.dashArray}
                dur="0.8s"
                fill="freeze"
                begin={`${seg.index * 0.1}s`}
              />
            </circle>
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold font-display text-text-main-light dark:text-text-main-dark tracking-tight">
            {displayTotal}
          </span>
          <span className="text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">
            Total
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar w-full lg:w-auto">
        {segments.length === 0 ? (
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark font-medium">No data</p>
        ) : (
          segments.map((seg) => (
            <div
              key={seg.index}
              className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-surface-light/60 dark:hover:bg-surface-dark/60 group cursor-default"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-surface-light dark:ring-offset-surface-dark transition-transform group-hover:scale-125"
                style={{ backgroundColor: seg.color.fill }}
              />
              <span className="text-xs font-semibold text-text-main-light dark:text-text-main-dark truncate flex-1">
                {seg.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-main-light dark:text-text-main-dark">
                  {seg.value}
                </span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: seg.color.bg, color: seg.color.fill }}
                >
                  {(seg.fraction * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════
const ChartBar = ({ data, chartType = "bar" }: ChartBarProps) => {
  const { chart, total } = data || {};

  if (!chart || chart.length === 0) {
    return <NoData />;
  }

  const maxValue = Math.max(...chart.map((item) => item.value || 0), 1);
  const computedTotal = total ?? chart.reduce((s, d) => s + d.value, 0);

  return (
    <div className="h-full w-full">
      {chartType === "pie" ? (
        <DonutChart chart={chart} total={computedTotal} />
      ) : (
        <BarChart chart={chart} maxValue={maxValue} />
      )}
    </div>
  );
};

export default ChartBar;
