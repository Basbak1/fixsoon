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
          className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] flex flex-col justify-between gap-5 animate-pulse"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#E2E8F0] dark:bg-[#1E293B] shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-28 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
                <div className="h-5 w-44 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
                <div className="h-3 w-24 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
              <div className="h-3.5 w-5/6 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-3">
            <div className="h-3.5 w-24 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 rounded-lg bg-[#E2E8F0] dark:bg-[#1E293B]" />
              <div className="h-8 w-20 rounded-lg bg-[#E2E8F0] dark:bg-[#1E293B]" />
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
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
          <div className="h-4 w-72 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 rounded-lg bg-[#E2E8F0] dark:bg-[#1E293B]" />
          <div className="h-9 w-24 rounded-lg bg-[#E2E8F0] dark:bg-[#1E293B]" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-3"
          >
            <div className="h-3 w-24 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
            <div className="h-7 w-16 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
          </div>
        ))}
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4"
          >
            <div className="h-5 w-40 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
            <div className="space-y-3">
              <div className="h-20 w-full rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B]" />
              <div className="h-20 w-full rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
