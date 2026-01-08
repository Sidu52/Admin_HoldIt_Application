"use client";
import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply opacity-70 blur-xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply opacity-70 blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#f8fafc_1px,transparent_1px),linear-gradient(#f8fafc_1px,transparent_1px)] bg-[size:32px_32px] opacity-10"></div>
      </div>

      <div className="layout-container flex h-full grow flex-col relative z-10 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[440px] flex flex-col bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/80 overflow-hidden">
          <div className="relative px-8 pt-10 pb-8 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mb-6 group hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <RiAdminFill className="text-white text-[34px] relative z-10" />
              <div className="absolute inset-0 rounded-2xl border-2 border-white/30 group-hover:border-white/40 transition-colors"></div>
            </div>
            <h2 className="text-gray-900 text-[32px] font-bold leading-tight text-center tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-base font-normal leading-relaxed pt-3 text-center max-w-[320px]">
              Sign in to your admin account to continue
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-10 w-full">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 animate-fadeIn">
                  <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
                    {error}
                  </p>
                </div>
              )}

              {/* Email Field */}
              <div className="flex flex-col gap-3">
                <label
                  className="text-gray-700 text-sm font-semibold leading-normal tracking-wide"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <div className="p-2 rounded-lg bg-blue-50 group-focus-within:bg-blue-100 transition-colors">
                      <FaMailBulk className="text-blue-500 group-focus-within:text-blue-600 text-[18px]" />
                    </div>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border-2 border-gray-200 bg-white/50 hover:bg-white h-14 placeholder:text-gray-400 pl-[68px] pr-4 text-base font-normal leading-normal transition-all duration-200 hover:border-gray-300 shadow-sm"
                    id="email"
                    placeholder="admin@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label
                    className="text-gray-700 text-sm font-semibold leading-normal tracking-wide"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors cursor-pointer hover:underline"
                    href="#"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative flex w-full flex-1 items-stretch rounded-xl group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <div className="p-2 rounded-lg bg-blue-50 group-focus-within:bg-blue-100 transition-colors">
                      <FaKey className="text-blue-500 group-focus-within:text-blue-600 text-[18px]" />
                    </div>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border-2 border-gray-200 bg-white/50 hover:bg-white h-14 placeholder:text-gray-400 pl-[68px] pr-14 text-base font-normal leading-normal transition-all duration-200 hover:border-gray-300 shadow-sm"
                    id="password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-0 top-0 h-14 w-14 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:rounded-lg disabled:opacity-50"
                  >
                    {showPassword ? (
                      <div className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <FaEyeSlash className="text-[20px]" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <FaEye className="text-[20px]" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 active:from-blue-800 active:to-cyan-800 h-14 px-5 text-white text-base font-bold leading-normal tracking-wide shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <div className="p-1.5 rounded-lg bg-white/20">
                      <FaShieldAlt className="text-lg" />
                    </div>
                    <span>Sign in to Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}