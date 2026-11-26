import React from 'react';

export function DirectorySkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading service providers"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col justify-between gap-5 animate-pulse"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#D8D4C7] dark:bg-[#145443] shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-28 rounded bg-[#D8D4C7] dark:bg-[#145443]" />
                <div className="h-5 w-44 rounded bg-[#D8D4C7] dark:bg-[#145443]" />
                <div className="h-3 w-24 rounded bg-[#D8D4C7] dark:bg-[#145443]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded bg-[#D8D4C7] dark:bg-[#145443]" />
              <div className="h-3.5 w-5/6 rounded bg-[#D8D4C7] dark:bg-[#145443]" />
            </div>
          </div>

          <div className="pt-4 border-t border-[#D8D4C7] dark:border-[#1E4438] flex items-center justify-between gap-3">
            <div className="h-3.5 w-24 rounded bg-[#D8D4C7] dark:bg-[#145443]" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 rounded-lg bg-[#D8D4C7] dark:bg-[#145443]" />
              <div className="h-8 w-20 rounded-lg bg-[#D8D4C7] dark:bg-[#145443]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading dashboard"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-pulse"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8D4C7] dark:border-[#1E4438]">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded bg-[#D8D4C7] dark:bg-[#145443]" />
          <div className="h-4 w-72 rounded bg-[#D8D4C7] dark:bg-[#145443]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 rounded-lg bg-[#D8D4C7] dark:bg-[#145443]" />
          <div className="h-9 w-24 rounded-lg bg-[#D8D4C7] dark:bg-[#145443]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-3"
          >
            <div className="h-3 w-24 rounded bg-[#D8D4C7] dark:bg-[#145443]" />
            <div className="h-7 w-16 rounded bg-[#D8D4C7] dark:bg-[#145443]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4"
          >
            <div className="h-5 w-40 rounded bg-[#D8D4C7] dark:bg-[#145443]" />
            <div className="space-y-3">
              <div className="h-20 w-full rounded-lg bg-[#F6F2E8] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438]" />
              <div className="h-20 w-full rounded-lg bg-[#F6F2E8] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
