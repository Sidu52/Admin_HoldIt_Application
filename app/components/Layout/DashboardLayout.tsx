"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const userData = {
  name: "Alex Johnson",
  email: "alex.j@holdit.com",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAAzYfl7BKRe8Yq0Ky4eMt1zaqyrEuHMDr4I6_douAxszB0BSuk973GrnoYiLKeou3Wlo0MqudMSMWm-9jaVjn3wSbg_jNEoELHdzr_QC4lHwKzY10qz8bb9Du8-rMlbrm194Op99OQmzDOdWGOuBiIBMIlZ9Ol-fAdp_3fXzGEqOiubwCQDby2CY9uER33f0hX2TvjL1_c0vk3vv1JOBU263NNmssgUTIlfgu4U6-mbiaQt29pT43jQOvl2nc_7HKeIFVHyaCD6Wwn",
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      <div className="relative flex h-screen w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          user={userData}
        />

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#111722] z-10">
              <Sidebar
                isCollapsed={false}
                onToggle={() => {}}
                user={userData}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Topbar */}
          <Topbar
            onMenuClick={toggleMobileMenu}
            isDarkMode={theme === "dark"}
            onToggleDarkMode={toggleTheme}
            user={userData}
          />

          {/* Main Content */}
          <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
