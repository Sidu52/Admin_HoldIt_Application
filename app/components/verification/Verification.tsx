"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import { RiShieldCheckFill, RiTimer2Fill } from "react-icons/ri";

type VerificationStatus = "verifying" | "success" | "error" | "expired";

export default function VerificationPage({
  isLoading,
  error,
}: {
  isLoading: boolean;
  error: any;
}) {
  const [status, setStatus] = useState<VerificationStatus>("verifying");

  useEffect(() => {
    if (isLoading) {
      setStatus("verifying");
    } else {
      setStatus("success");
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden py-10">
      {/* Background Pattern Effect */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-indigo-900/20 blur-[100px] rounded-full opacity-30"></div>
        {/* Animated dots */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-500/20 dark:bg-blue-400/20 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="layout-container flex h-full grow flex-col relative z-10 items-center justify-center p-4 sm:p-6">
        {/* Verification Card */}
        <div className="w-full max-w-[480px] flex flex-col bg-white dark:bg-[#1A2232] rounded-xl shadow-2xl border border-gray-200 dark:border-[#232f48] overflow-hidden backdrop-blur-sm">
          <div className="px-8 pt-10 pb-8 flex flex-col items-center">
            {/* Animated Status Icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75"></div>
              <div className="flex items-center justify-center p-5 rounded-full bg-primary/10 dark:bg-primary/20 shadow-lg shadow-primary/10 relative">
                {status === "verifying" ? (
                  <RiTimer2Fill className="text-primary text-5xl animate-spin" />
                ) : status === "success" ? (
                  <RiShieldCheckFill className="text-green-500 text-5xl animate-bounce" />
                ) : (
                  <RiShieldCheckFill className="text-red-500 text-5xl animate-pulse" />
                )}
              </div>
            </div>

            {/* Status Message */}
            <div className="text-center space-y-3 mt-6">
              {status === "verifying" && (
                <>
                  <h1 className="text-gray-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight">
                    Verifying Your Link...
                  </h1>
                  <p className="text-gray-500 dark:text-[#93a1b4] text-base font-normal leading-relaxed max-w-[380px]">
                    Please wait while we verify your signup invitation. This may
                    take a few moments.
                  </p>
                </>
              )}

              {status === "success" && (
                <>
                  <h1 className="text-gray-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight">
                    Verification Complete!
                  </h1>
                  <p className="text-gray-500 dark:text-[#93a1b4] text-base font-normal leading-relaxed max-w-[380px]">
                    Your invitation has been successfully verified. Redirecting
                    to signup page...
                  </p>
                </>
              )}

              {(status === "error" || status === "expired") && (
                <>
                  <h1 className="text-gray-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight">
                    Verification Failed
                  </h1>
                  <p className="text-gray-500 dark:text-[#93a1b4] text-base font-normal leading-relaxed max-w-[380px]">
                    {status === "expired"
                      ? "This invitation link has expired. Please request a new one."
                      : "We couldn't verify your invitation link. Please try again."}
                  </p>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full mt-8">
              {status === "verifying" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <LoadingSpinner size="sm" className="text-blue-500" />
                    <span>Checking invitation validity...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {status === "verifying" &&
                  "This process is secure and encrypted"}
                {status === "success" &&
                  "Your data is protected with end-to-end encryption"}
                {status === "error" &&
                  "Please check your internet connection and try again"}
                {status === "expired" &&
                  "Invitation links expire after 24 hours for security"}
              </p>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Need help?{" "}
                <button className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  Contact Support
                </button>
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Secure Connection
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Footer */}
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
    </div>
  );
}
