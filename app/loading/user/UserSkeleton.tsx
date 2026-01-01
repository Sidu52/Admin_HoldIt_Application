export function UserHeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-8 md:h-10 w-64 bg-slate-200 dark:bg-[#2a3553] rounded-md" />
        <div className="h-4 w-80 bg-slate-200 dark:bg-[#2a3553] rounded-md" />
      </div>
    </div>
  );
}

export function UserFiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-[#1e293b] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-[#232f48] animate-pulse">
      {/* Search input */}
      <div className="h-12 w-full bg-slate-200 dark:bg-[#2a3553] rounded-lg" />

      {/* Status chips */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#232f48]">
        <div className="h-4 w-16 bg-slate-200 dark:bg-[#2a3553] rounded-md mr-2" />

        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 bg-slate-200 dark:bg-[#2a3553] rounded-full"
          />
        ))}

        <div className="flex-1" />

        <div className="h-4 w-28 bg-slate-200 dark:bg-[#2a3553] rounded-md" />
      </div>
    </div>
  );
}

export function UsersTableSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-[#324467] overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#192233]">
              {[...Array(6)].map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-[#2a3553] rounded-md" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-[#324467]">
            {[...Array(6)].map((_, row) => (
              <tr key={row}>
                <td className="px-6 py-4">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-[#2a3553] rounded-md" />
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <div className="h-4 w-48 bg-slate-200 dark:bg-[#2a3553] rounded-md" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-[#2a3553] rounded-md" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 w-20 bg-slate-200 dark:bg-[#2a3553] rounded-full" />
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-[#2a3553] rounded-md" />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-[#2a3553] rounded-md ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-[#324467]">
        <div className="h-4 w-32 bg-slate-200 dark:bg-[#2a3553] rounded-md" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-8 bg-slate-200 dark:bg-[#2a3553] rounded-md"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function UserSkeleton() {
  return (
    <div className="w-full max-w-7xl flex flex-col gap-6 py-6 px-4 md:px-8 mx-auto">
      <UserHeaderSkeleton />
      <UserFiltersSkeleton />
      <UsersTableSkeleton />
    </div>
  );
}

export default UserSkeleton;
