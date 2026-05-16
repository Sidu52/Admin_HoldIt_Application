"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useTheme } from "../../providers/ThemeProvider";
import { useGetProfileQuery } from "../../services/adminApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/app/store/slices/authSlice";
import { api } from "../../services/api";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();

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
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
