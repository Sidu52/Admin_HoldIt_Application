"use client";

import React from "react";

// ── Generic Pulse Box ──
export const SkeletonBox = ({ className = "" }: { className?: string }) => (
  <div className={`bg-slate-200 dark:bg-slate-700/60 animate-pulse rounded-lg ${className}`} />
);

// ── Table Skeleton ──
export const TableSkeleton = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => (
  <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1a2332]">
    <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
      <SkeletonBox className="h-5 w-32" />
      <SkeletonBox className="h-5 w-20" />
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-800/50 p-4 space-y-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center justify-between gap-4 py-2">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBox key={c} className={`h-4 ${c === 0 ? "w-36" : c === cols - 1 ? "w-16" : "w-24"}`} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ── Stat Card Skeleton ──
export const StatCardSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-8 w-8 rounded-xl" />
        </div>
        <SkeletonBox className="h-8 w-16" />
        <SkeletonBox className="h-3 w-32" />
      </div>
    ))}
  </div>
);

// ── Detail Page Skeleton (for Booking Details, User Details, etc.) ──
export const DetailsPageSkeleton = () => (
  <div className="flex-1 flex flex-col h-full bg-background p-6 space-y-6 overflow-y-auto">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between bg-white dark:bg-[#1a2332] p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
      <div className="flex items-center gap-4">
        <SkeletonBox className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <SkeletonBox className="h-6 w-48" />
          <SkeletonBox className="h-4 w-32" />
        </div>
      </div>
      <SkeletonBox className="h-8 w-24 rounded-full" />
    </div>

    {/* Tabs Bar Skeleton */}
    <div className="flex gap-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonBox key={i} className="h-9 w-28 rounded-lg" />
      ))}
    </div>

    {/* Section Cards Skeleton Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#1a2332] p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <SkeletonBox className="h-6 w-6 rounded-lg" />
            <SkeletonBox className="h-5 w-36" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <SkeletonBox className="h-4 w-24" />
              <SkeletonBox className="h-4 w-36" />
            </div>
            <div className="flex justify-between">
              <SkeletonBox className="h-4 w-28" />
              <SkeletonBox className="h-4 w-24" />
            </div>
            <div className="flex justify-between">
              <SkeletonBox className="h-4 w-20" />
              <SkeletonBox className="h-4 w-40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Chat / Conversation Thread Skeleton (for Support Ticket Details) ──
export const ChatSkeleton = () => (
  <div className="flex-1 flex flex-col h-full bg-background p-6 space-y-6">
    <div className="flex items-center justify-between bg-white dark:bg-[#1a2332] p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
      <div className="flex items-center gap-3">
        <SkeletonBox className="h-9 w-9 rounded-xl" />
        <div className="space-y-1">
          <SkeletonBox className="h-5 w-36" />
          <SkeletonBox className="h-3 w-48" />
        </div>
      </div>
      <SkeletonBox className="h-8 w-24 rounded-lg" />
    </div>

    {/* Chat Bubble Messages Skeleton */}
    <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 flex-1 space-y-6">
      <div className="flex flex-col items-start gap-2">
        <SkeletonBox className="h-3 w-28" />
        <SkeletonBox className="h-16 w-3/4 rounded-2xl rounded-bl-none" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <SkeletonBox className="h-3 w-28" />
        <SkeletonBox className="h-14 w-2/3 rounded-2xl rounded-br-none" />
      </div>
      <div className="flex flex-col items-start gap-2">
        <SkeletonBox className="h-3 w-28" />
        <SkeletonBox className="h-20 w-4/5 rounded-2xl rounded-bl-none" />
      </div>
    </div>
  </div>
);
