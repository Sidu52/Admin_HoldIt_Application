"use client";

import { useState } from "react";
import LoadingSpinner from "@/app/components/Common/LoadingSpinner";
import { FaQuestionCircle, FaRedoAlt } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { FaLink } from "react-icons/fa6";

export default function InvalidLinkPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestNewLink = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle new link request logic here
      console.log("New link requested");
    }, 1500);
  };

  const handleContactSupport = () => {
    // Handle contact support logic
    console.log("Contact support clicked");
  };

  return (
    <div className="h-screen flex items-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top center glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full opacity-40"></div>
        {/* Bottom right accent */}
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-indigo-900/20 blur-[100px] rounded-full opacity-30"></div>
      </div>

      <div className="layout-container flex h-full grow flex-col relative z-10">
        {/* Header */}
        <header className="flex items-center justify-center py-6 px-10 border-b border-transparent">
          <div className="flex items-center gap-4 text-[#111418] dark:text-white">
            <div className="w-8 h-8 text-primary">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"
                  fill="currentColor"
                ></path>
                <path
                  clipRule="evenodd"
                  d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
              Holdit
            </h2>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 md:px-40 flex flex-1 items-center justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[480px]">
            {/* Error Card - Styled similarly to login card */}
            <div className="flex flex-col items-center gap-6 p-8 rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden backdrop-blur-sm">
              {/* Status Icon Container */}
              <div className="flex items-center justify-center p-5 rounded-full bg-[#182D57] dark:bg-[#182D57] shadow-lg shadow-[#182D57]">
                <FaLink
                  fontSize={28}
                  className="text-[#1454D5] dark:text-[#1454D5]"
                />
              </div>

              {/* Headlines & Text */}
              <div className="text-center space-y-3">
                <h1 className="text-gray-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight">
                  Link Invalid or Expired
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-relaxed max-w-[380px]">
                  We couldn't verify this signup invitation. It may have expired
                  after 24 hours, or it might have been revoked by an
                  administrator.
                </p>
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col gap-4 mt-2">
                <button
                  onClick={handleRequestNewLink}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 h-12 px-5 text-white text-base font-bold leading-normal tracking-wide shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="text-white" />
                      <span>Requesting...</span>
                    </>
                  ) : (
                    <>
                      <FaRedoAlt className="text-lg" />
                      <span>Request New Link</span>
                    </>
                  )}
                </button>

                <div className="flex justify-center">
                  <button
                    onClick={handleContactSupport}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <FaQuestionCircle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    Contact Support
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Help Section */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 dark:text-gray-600 text-sm">
                Need immediate assistance?{" "}
                <a
                  href="mailto:support@example.com"
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Email our support team
                </a>
              </p>
            </div>

            {/* Page Footer - Matching login page style */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 dark:text-gray-600 text-xs">
                © {new Date().getFullYear()} Admin Portal Inc. ·{" "}
                <a
                  className="hover:text-gray-400 dark:hover:text-gray-500 transition-colors cursor-pointer"
                  href="#"
                >
                  Privacy
                </a>{" "}
                ·{" "}
                <a
                  className="hover:text-gray-400 dark:hover:text-gray-500 transition-colors cursor-pointer"
                  href="#"
                >
                  Terms
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
