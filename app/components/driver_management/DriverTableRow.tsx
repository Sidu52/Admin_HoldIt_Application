import { Driver } from "@/app/types/driverManager";
import { parseTimestamp } from "@/app/utils/helper";
import { MdVisibility } from "react-icons/md";

interface DriverTableRowProps {
  driver: Driver;
  onViewDetails: (driverId: string) => void;
}

export default function DriverTableRow({
  driver,
  onViewDetails,
}: DriverTableRowProps) {
  return (
    <tr className="group  dark:bg-[#1e293b] transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {driver.first_name} {driver.last_name}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell">
        {driver.email}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border `}
        >
          {driver?.auth_user_id?.role?.replaceAll("_", " ").toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border`}
        >
          {driver?.status?.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
        {parseTimestamp(driver?.createdAt).date}
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => onViewDetails(driver?._id)}
          className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-[#232f48] transition-colors"
          title="View Details"
        >
          <span className="material-symbols-outlined">
            <MdVisibility />
          </span>
        </button>
      </td>
    </tr>
  );
}
