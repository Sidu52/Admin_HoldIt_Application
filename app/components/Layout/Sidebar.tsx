"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaGlobe,
  FaUsers,
  FaCalendarAlt,
  FaTruck,
  FaStore,
  FaUserTie,
  FaUserFriends,
  FaUser,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { RiAdminFill } from "react-icons/ri";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  isActive?: boolean;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export default function Sidebar({ isCollapsed, onToggle, user }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("dashboard");

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <MdDashboard />,
      path: "/dashboard",
    },
    { id: "websites", label: "Websites", icon: <FaGlobe />, path: "/websites" },
    { id: "users", label: "User Manager", icon: <FaUsers />, path: "/users" },
    {
      id: "bookings",
      label: "Booking Manager",
      icon: <FaCalendarAlt />,
      path: "/bookings",
    },
    {
      id: "drivers",
      label: "Driver Manager",
      icon: <FaTruck />,
      path: "/drivers",
    },
    {
      id: "stores",
      label: "Store Manager",
      icon: <FaStore />,
      path: "/stores",
    },
    {
      id: "store-owners",
      label: "Store Owner Manager",
      icon: <FaUserTie />,
      path: "/store-owners",
    },
    {
      id: "teams",
      label: "Team Manager",
      icon: <FaUserFriends />,
      path: "/teams",
    },
    { id: "divider", label: "divider", icon: null },
    {
      id: "profile",
      label: "Profile Update",
      icon: <FaUser />,
      path: "/profile",
    },
  ];

  const handleItemClick = (item: SidebarItem) => {
    if (item.path && item.id !== "divider") {
      setActiveItem(item.id);
      router.push(item.path);
    }
  };

  const handleLogout = () => {
    // Implement logout logic
    console.log("Logout clicked");
    router.push("/login");
  };

  useEffect(() => {
    // Set active item based on current path
    const currentItem = sidebarItems.find(
      (item) => item.path && pathname.startsWith(item.path)
    );
    if (currentItem) {
      setActiveItem(currentItem.id);
    }
  }, [pathname]);

  return (
    <aside
      className={`
      hidden lg:flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 
      bg-white dark:bg-[#111722] p-4 transition-all duration-300 ease-in-out
      ${isCollapsed ? "w-[80px]" : "w-[280px]"}
    `}
    >
      {/* Logo Section */}
      <div className="flex flex-col gap-6 overflow-y-auto">
        <div className="flex items-center gap-3 px-2 shrink-0">
          <div className="bg-primary/10 flex items-center justify-center rounded-lg h-10 w-10">
            <RiAdminFill className="text-primary text-xl" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
                Holdit
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                Admin Portal
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            if (item.id === "divider") {
              return (
                <div
                  key={item.id}
                  className="my-2 h-px bg-slate-200 dark:bg-slate-800 w-full"
                ></div>
              );
            }

            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && (
                  <p
                    className={`text-sm leading-normal ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile & Logout Section */}
      <div className="flex flex-col gap-4 shrink-0 mt-4">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a2332]">
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 shadow-sm"
                style={{ backgroundImage: `url(${user.avatar})` }}
              />
              <div className="flex flex-col min-w-0">
                <h2 className="text-slate-900 dark:text-white text-sm font-bold truncate">
                  {user.name}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold transition-colors"
            >
              <FaSignOutAlt className="text-lg" />
              <span className="truncate">Logout</span>
            </button>
          </>
        ) : (
          // Collapsed user section
          <div className="flex flex-col items-center gap-2">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 shadow-sm"
              style={{ backgroundImage: `url(${user.avatar})` }}
            />
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          </div>
        )}

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-shadow"
        >
          {isCollapsed ? (
            <FaChevronRight className="text-slate-600 dark:text-slate-400" />
          ) : (
            <FaChevronLeft className="text-slate-600 dark:text-slate-400" />
          )}
        </button>
      </div>
    </aside>
  );
}
