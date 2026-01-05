import Link from "next/link";
import { BiHome } from "react-icons/bi";

export default function Breadcrumbs() {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2 mb-4">
      <Link
        href="/"
        className="text-[#637588] dark:text-[#92a4c9] text-base font-medium leading-normal flex items-center gap-1 hover:text-[#3b82f6] transition-colors"
      >
        <span className="material-symbols-outlined text-sm">
          <BiHome />
        </span>
        Home
      </Link>
      <span className="text-[#637588] dark:text-[#92a4c9] text-base font-medium leading-normal">
        /
      </span>
      <Link
        href="/"
        className="text-[#637588] dark:text-[#92a4c9] text-base font-medium leading-normal hover:text-[#3b82f6] transition-colors"
      >
        Driver Manager
      </Link>
      <span className="text-[#637588] dark:text-[#92a4c9] text-base font-medium leading-normal">
        /
      </span>
      <span className="text-[#111418] dark:text-white text-base font-medium leading-normal truncate">
        deatils
      </span>
    </div>
  );
}
