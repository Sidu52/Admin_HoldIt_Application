// SkeletonLoader.tsx
const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      {/* Profile Header (Avatar & Name) */}
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-8 border-b border-[#232f48] pb-8">
        {/* Avatar Skeleton */}
        <div className="relative group">
          <div className="bg-gray-500 h-28 w-28 rounded-full"></div>
        </div>
        {/* Name & Role Skeleton */}
        <div className="flex-1">
          <div className="h-6 bg-gray-500 w-3/4 mb-2 rounded"></div>
          <div className="h-4 bg-gray-500 w-1/2 mb-4 rounded"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-500 w-32 rounded-lg"></div>
            <div className="h-10 bg-gray-500 w-32 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-gray-500 w-1/3 mb-2 rounded"></div>
          <div className="h-12 bg-gray-500 w-full rounded-lg"></div>
        </div>
        {/* Last Name Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-gray-500 w-1/3 mb-2 rounded"></div>
          <div className="h-12 bg-gray-500 w-full rounded-lg"></div>
        </div>
        {/* Email Skeleton */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <div className="h-4 bg-gray-500 w-1/3 mb-2 rounded"></div>
          <div className="h-12 bg-gray-500 w-full rounded-lg"></div>
        </div>
        {/* Phone Number Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-gray-500 w-1/3 mb-2 rounded"></div>
          <div className="h-12 bg-gray-500 w-full rounded-lg"></div>
        </div>
        {/* Location Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-gray-500 w-1/3 mb-2 rounded"></div>
          <div className="h-12 bg-gray-500 w-full rounded-lg"></div>
        </div>
        {/* Bio Skeleton */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <div className="h-4 bg-gray-500 w-1/3 mb-2 rounded"></div>
          <div className="h-24 bg-gray-500 w-full rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonLoader;
