import { FaEllipsisVertical } from "react-icons/fa6";

interface ActivityItem {
  id: string;
  name: string;
  description: string;
  manager: {
    name: string;
    avatar: string;
  };
  status:
    | "active"
    | "inactive"
    | "pending"
    | "warning"
    | "on-route"
    | "maintenance";
  type: "website" | "driver" | "store" | "booking" | "user";
  lastUpdated: string;
  initials: string;
  color: string;
}

interface RecentActivityTableProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export default function RecentActivityTable({
  activities,
  isLoading = false,
}: RecentActivityTableProps) {
  const getStatusColor = (status: ActivityItem["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
      case "on-route":
        return "bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
      case "maintenance":
        return "bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
      case "pending":
        return "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-600";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-600";
    }
  };

  const getTypeLabel = (type: ActivityItem["type"]) => {
    switch (type) {
      case "website":
        return "Website";
      case "driver":
        return "Driver";
      case "store":
        return "Store";
      case "booking":
        return "Booking";
      case "user":
        return "User";
      default:
        return type;
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111722]/50">
              {[
                "Entity Name",
                "Manager/Owner",
                "Status",
                "Type",
                "Last Updated",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading
              ? // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              : activities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#252f44] transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ background: activity.color }}
                        >
                          {activity.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {activity.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {activity.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${activity.manager.avatar})`,
                          }}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {activity.manager.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`
                      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border
                      ${getStatusColor(activity.status)}
                    `}
                      >
                        {activity.status.charAt(0).toUpperCase() +
                          activity.status.slice(1)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {getTypeLabel(activity.type)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {activity.lastUpdated}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-slate-400 hover:text-[#135bec] dark:hover:text-[#135bec] transition-colors">
                        <FaEllipsisVertical />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Showing{" "}
          <span className="font-medium text-slate-900 dark:text-white">1</span>{" "}
          to{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {activities.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            124
          </span>{" "}
          results
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
            Previous
          </button>
          <button className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
