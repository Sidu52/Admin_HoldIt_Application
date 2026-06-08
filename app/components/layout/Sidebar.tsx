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
  FaMapMarkedAlt,
  FaCog,
} from "react-icons/fa";
import { RiAdminFill, RiDashboardLine, RiUserLine, RiTruckLine, RiStore2Line, RiTeamLine, RiMapPinUserLine, RiCalendarCheckLine, RiProfileLine } from "react-icons/ri";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { hasAccess } from "@/app/utils/role";

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
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <RiDashboardLine />,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      id: "users",
      label: "User Manager",
      icon: <RiUserLine />,
      href: "/users",
      active: pathname.startsWith("/users"),
    },
    {
      id: "drivers",
      label: "Driver Manager",
      icon: <RiTruckLine />,
      href: "/drivers",
      active: pathname.startsWith("/drivers"),
    },
    {
      id: "stores",
      label: "Store Manager",
      icon: <RiStore2Line />,
      href: "/store",
      active: pathname === "/store" || pathname.startsWith("/store/"),
    },
    {
      id: "store-owners",
      label: "Store Owners",
      icon: <RiMapPinUserLine />,
      href: "/storeowner",
      active: pathname.startsWith("/storeowner"),
    },
    {
      id: "teams",
      label: "Team Manager",
      icon: <RiTeamLine />,
      href: "/team",
      active: pathname.startsWith("/team"),
    },
    {
      id: "bookings",
      label: "Booking Manager",
      icon: <RiCalendarCheckLine />,
      href: "/bookings",
      active: pathname.startsWith("/booking"),
    },
    {
      id: "serviceable-areas",
      label: "Serviceable Areas",
      icon: <FaMapMarkedAlt />,
      href: "/serviceable-areas",
      active: pathname.startsWith("/serviceable-areas"),
    },
    {
      id: "profile",
      label: "Profile",
      icon: <RiProfileLine />,
      href: "/profile",
      active: pathname === "/profile",
    },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:relative h-screen z-50 transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "w-20" : "w-72"} 
          flex flex-col border-r border-slate-200 dark:border-white/5 
          bg-slate-50 dark:bg-[#0b0f1a] shadow-sm`}
      >
        {/* Header Section */}
        <div className="p-6 flex flex-col gap-8 flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div
              className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"
                } shrink-0`}
            >
              <div className="bg-primary flex items-center justify-center rounded-xl h-10 w-10 shrink-0 shadow-lg shadow-primary/20">
                <RiAdminFill className="text-white text-xl" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <h1 className="text-text-main-light dark:text-text-main-dark text-xl font-bold tracking-tight leading-tight">
                    Holdit
                  </h1>
                  <p className="text-text-muted-light dark:text-text-muted-dark text-[10px] font-bold uppercase tracking-widest">
                    Enterprise
                  </p>
                </div>
              )}
            </div>

            {/* Toggle Button */}
            {!isMobileOpen && (
              <button
                onClick={onToggle}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-background-light dark:bg-background-dark text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-all border border-transparent hover:border-border-light dark:hover:border-border-dark"
              >
                {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5">
            {sidebarItems.filter((item) => hasAccess(user?.role, item.id)).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onMobileToggle();
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                  ${item.active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-text-main-light dark:hover:text-text-main-dark"
                  }
                  ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <span className={`text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${item.active ? "text-primary" : ""}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span
                    className={`text-sm tracking-wide truncate ${item.active ? "font-bold" : "font-medium"
                      }`}
                  >
                    {item.label}
                  </span>
                )}
                {item.active && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(19,91,236,0.6)]" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer / Support */}
        <div className="p-4 border-t border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50">
          <button className="flex w-full items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-all group">
            <FaCog className="text-xl shrink-0 group-hover:rotate-90 transition-transform duration-500" />
            {!isCollapsed && (
              <span className="text-sm font-semibold tracking-wide">System Settings</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
