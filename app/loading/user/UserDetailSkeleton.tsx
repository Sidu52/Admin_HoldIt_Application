function BreadcrumbsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2 mb-4">
      {[60, 80, 70].map((w, i) => (
        <div
          key={i}
          className="h-4 rounded-md bg-slate-200 dark:bg-slate-700"
          style={{ width: w }}
        />
      ))}
    </div>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <div className="flex px-4 py-2 mb-6">
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:justify-between lg:items-end">
        {/* Left */}
        <div className="flex gap-6 items-start">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-[#232f48]" />

          {/* Name + Role */}
          <div className="flex flex-col pt-2 gap-2">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-md" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full lg:w-auto gap-3 flex-wrap">
          {[120, 150, 40].map((w, i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-slate-200 dark:bg-slate-700"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AccountDetailsSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded-md mb-2" />
        <div className="h-3 w-56 bg-slate-200 dark:bg-slate-700 rounded-md" />
      </div>

      {/* Rows */}
      <div className="px-5 py-4 space-y-4">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2"
          >
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UserEditOverlaySkeleton() {
  return (
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center animate-pulse">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-6 space-y-4">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded-md" />
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md"
          />
        ))}
        <div className="flex justify-end gap-3 pt-4">
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function UserProfileDetailSkeleton() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white overflow-x-hidden animate-pulse">
      <div className="relative flex min-h-screen flex-col">
        <div className="layout-container flex grow flex-col">
          <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
              <BreadcrumbsSkeleton />
              <ProfileHeaderSkeleton />
              <div className="w-full gap-8 px-4">
                <AccountDetailsSkeleton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


