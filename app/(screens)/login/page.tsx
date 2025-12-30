"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import LoadingSpinner from "@/app/components/Common/LoadingSpinner";
import {
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaKey,
  FaMailBulk,
} from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";

export default function LoginPage() {
  const { login, logoutLoading: isLoading, loginError: error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  console.log("isLoading", isLoading);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top center glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full opacity-40"></div>
        {/* Bottom right accent */}
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-indigo-900/20 blur-[100px] rounded-full opacity-30"></div>
      </div>

      <div className="layout-container flex h-full grow flex-col relative z-10 items-center justify-center p-4 sm:p-6">
        {/* Login Card */}
        <div className="w-full max-w-[460px] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden backdrop-blur-sm">
          {/* Header Section */}
          <div className="px-8 pt-10 pb-6 flex flex-col items-center">
            {/* Logo */}
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
              <RiAdminFill className="text-white text-[32px]" />
            </div>
            <h2 className="text-gray-900 dark:text-white tracking-tight text-[28px] font-bold leading-tight text-center">
              Admin Portal
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal pt-2 text-center max-w-[320px]">
              Welcome back to Admin Portal. Please enter your details to sign
              in.
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-10 w-full">
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </p>
                </div>
              )}

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-gray-700 dark:text-gray-200 text-sm font-medium leading-normal"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaMailBulk className="text-gray-400 group-focus-within:text-blue-600 transition-colors text-[20px]" />
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-0 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-blue-600 dark:focus:border-blue-500 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 pl-11 pr-4 text-base font-normal leading-normal transition-all shadow-sm"
                    id="email"
                    placeholder="admin@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-gray-700 dark:text-gray-200 text-sm font-medium leading-normal"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                    href="#"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative flex w-full flex-1 items-stretch rounded-lg group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <FaKey className="text-gray-400 group-focus-within:text-blue-600 transition-colors text-[20px]" />
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-0 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-blue-600 dark:focus:border-blue-500 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 pl-11 pr-12 text-base font-normal leading-normal transition-all shadow-sm z-0"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer z-10 focus:outline-none disabled:opacity-50"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-[20px]" />
                    ) : (
                      <FaEye className="text-[20px]" />
                    )}
                  </button>
                </div>
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 h-12 px-5 text-white text-base font-bold leading-normal tracking-wide shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <FaShieldAlt className="text-lg" />
                    <span>Log In</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 px-8 py-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Don't have an account?{" "}
              <span className="text-gray-400 dark:text-gray-600 cursor-not-allowed">
                Contact Super Admin
              </span>
            </p>
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
