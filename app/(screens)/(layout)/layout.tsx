"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useTheme } from "../../providers/ThemeProvider";
import { useGetProfileQuery } from "../../services/adminApi";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "@/app/store/slices/authSlice";
import { api } from "../../services/api";
import { usePathname } from "next/navigation";
import { RootState } from "@/app/store";
import { hasAccess } from "@/app/utils/role";
import { RiShieldKeyholeLine } from "react-icons/ri";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: profileData } = useGetProfileQuery();

  useEffect(() => {
    if (profileData?.data) {
      dispatch(setCredentials({ user: profileData.data }));
    }
  }, [profileData, dispatch]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Close mobile sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const getModuleFromPathname = (path: string): string | null => {
    if (path === "/dashboard") return "dashboard";
    if (path.startsWith("/users")) return "users";
    if (path.startsWith("/drivers")) return "drivers";
    if (path.startsWith("/storeowner")) return "store-owners";
    if (path.startsWith("/store")) return "stores";
    if (path.startsWith("/team")) return "teams";
    if (path.startsWith("/bookings")) return "bookings";
    if (path.startsWith("/serviceable-areas")) return "serviceable-areas";
    if (path.startsWith("/profile")) return "profile";
    if (path.startsWith("/support")) return "support";
    return null;
  };

  const moduleId = getModuleFromPathname(pathname);
  // Wait to determine if it is unauthorized until profile details are fetched.
  const isAuthorized = moduleId && user?.role ? hasAccess(user.role, moduleId) : true;

  return (
    <div className="h-screen bg-background-light dark:bg-background-dark overflow-hidden scrollbar ">
      <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
            isMobileOpen={isMobileSidebarOpen}
            onMobileToggle={toggleMobileSidebar}
          />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar
              onMenuClick={toggleMobileSidebar}
              isDarkMode={theme === "dark"}
              onToggleDarkMode={toggleTheme}
            />
            <div className="flex-1 overflow-y-auto">
              {isAuthorized ? (
                children
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
                  <div className="bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 p-6 rounded-2xl mb-6 shadow-lg shadow-rose-500/5 animate-pulse">
                    <RiShieldKeyholeLine size={48} />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-2">
                    Access Restricted
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm md:text-base leading-relaxed mb-8">
                    Your current role does not have authorization to view this section. If you believe this is an error, please contact the administrator.
                  </p>
                  <button
                    onClick={() => window.location.href = "/dashboard"}
                    className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
