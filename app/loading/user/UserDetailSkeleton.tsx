const UserProfileDetailSkeleton = () => {
  return (
    <div className="layout-container bg-background text-foreground flex h-full grow flex-col">
      <div className="px-4 md:px-10 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
          {/* Breadcrumbs Skeleton */}
          <div className="flex flex-wrap gap-2 px-4 py-2 mb-4">
            <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
            <div className="w-2 h-4 bg-gray-300 dark:bg-gray-600 mx-2 rounded-md"></div>
            <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
            <div className="w-2 h-4 bg-gray-300 dark:bg-gray-600 mx-2 rounded-md"></div>
            <div className="w-40 h-4 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
          </div>

          {/* Profile Header Skeleton */}
          <div className="flex px-4 py-2 mb-6">
            <div className="flex w-full flex-col gap-6 lg:flex-row lg:justify-between lg:items-end">
              <div className="flex gap-6 items-start">
                <div className="w-32 h-28 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                <div className="flex flex-col pt-2 w-full">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-40 h-6 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                    <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                  </div>
                  <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse mt-1"></div>
                  <div className="w-40 h-4 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse mt-2"></div>
                </div>
              </div>
              <div className="flex w-full lg:w-auto gap-3 flex-wrap">
                <div className="w-24 h-10 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                <div className="w-24 h-10 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                <div className="w-12 h-10 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 px-4">
            {/* Left Column Skeleton */}
            <div className="flex flex-col gap-6">
              {/* Contact Card Skeleton */}
              <div className="bg-white dark:bg-[#232f48] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
                <div className="w-36 h-6 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse mb-4"></div>
                <div className="flex flex-col gap-4">
                  {[...Array(3)].map((_, idx) => (
                    <div className="flex items-start gap-3" key={idx}>
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                      <div className="flex flex-col w-full">
                        <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse mb-2"></div>
                        <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Details Card Skeleton */}
              <div className="bg-white dark:bg-[#232f48] rounded-xl p-5 border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
                <div className="w-36 h-6 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse mb-4"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, idx) => (
                    <div
                      className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#324467]"
                      key={idx}
                    >
                      <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                      <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetailSkeleton;
