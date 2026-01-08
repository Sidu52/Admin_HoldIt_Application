"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
}
