"use client";

import {
  FaUsers,
  FaTruck,
  FaStore,
  FaUserTie,
  FaUsersCog,
  FaUserEdit,
  FaCalendarAlt,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { MdDashboard } from "react-icons/md";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
}
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const Sidebar = ({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileToggle,
}: SidebarProps) => {
  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <MdDashboard />,
      href: "/dashboard",
      active: true,
    },
    { id: "users", label: "User Manager", icon: <FaUsers />, href: "/users" },
    {
      id: "drivers",
      label: "Driver Manager",
      icon: <FaTruck />,
      href: "/driver",
    },
    { id: "stores", label: "Store Manager", icon: <FaStore />, href: "/store" },
    {
      id: "store-owners",
      label: "Store Owner Manager",
      icon: <FaUserTie />,
      href: "/store-owner",
    },
    { id: "teams", label: "Team Manager", icon: <FaUsersCog />, href: "/team" },
    {
      id: "profile",
      label: "Profile Update",
      icon: <FaUserEdit />,
      href: "/profile",
    },
    {
      id: "bookings",
      label: "Booking Manager",
      icon: <FaCalendarAlt />,
      href: "/booking",
    },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:relative h-screen z-50 transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "w-20" : "w-64"} 
          flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 
          bg-white dark:bg-[#111722] p-4`}
      >
        {/* Header Section */}
        <div className="flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "gap-3 px-2"
              } shrink-0`}
            >
              {!isCollapsed && (
                <>
                  <div className="bg-primary/10 flex items-center justify-center rounded-lg h-10 w-10 shrink-0">
                    <RiAdminFill className="text-primary text-xl" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight truncate">
                      Holdit
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate">
                      Admin Portal
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Toggle Button */}
            <button
              onClick={onToggle}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mx-auto"
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            {sidebarItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }
                  ${isCollapsed ? "justify-center" : ""}`}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <p
                    className={`text-sm leading-normal truncate ${
                      item.active ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </p>
                )}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-4 shrink-0 mt-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg h-10 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold transition-colors">
            <FaSignOutAlt className="text-lg" />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
