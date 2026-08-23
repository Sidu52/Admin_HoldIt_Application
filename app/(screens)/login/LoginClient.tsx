"use client";
import { useState } from "react";
import { useLoginMutation, useRequestJoinTeamMutation } from "../../services/authApi";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Link from "next/link";
import { setCredentials } from "@/app/store/slices/authSlice";
import {
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaKey,
  FaMailBulk,
  FaUserPlus,
  FaTimes,
} from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const [requestJoinTeam, { isLoading: isSubmittingJoin }] = useRequestJoinTeamMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Join Team Request State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinForm, setJoinForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    desired_role: "customer_support",
    experience_notes: "",
  });

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestJoinTeam(joinForm).unwrap();
      toast.success("Your team join request has been submitted for admin review!");
      setShowJoinModal(false);
      setJoinForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        desired_role: "customer_support",
        experience_notes: "",
      });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit join request");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login({ email, password }).unwrap();
      if (response?.data?.user) {
        dispatch(setCredentials({ user: response.data.user }));
      }
      toast.success("Successfully logged in");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#0b0f1a] dark:via-[#111827] dark:to-[#0b0f1a] relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 dark:bg-blue-950/20 rounded-full mix-blend-multiply opacity-70 blur-xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-100 dark:bg-cyan-950/20 rounded-full mix-blend-multiply opacity-70 blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/10 dark:to-cyan-950/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#f8fafc_1px,transparent_1px),linear-gradient(#f8fafc_1px,transparent_1px)] dark:bg-[linear-gradient(90deg,#1f2937_1px,transparent_1px),linear-gradient(#1f2937_1px,transparent_1px)] bg-[size:32px_32px] opacity-10"></div>
      </div>

      <div className="layout-container flex h-full grow flex-col relative z-10 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[440px] flex flex-col bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/80 dark:border-slate-800/80 overflow-hidden">
          <div className="relative px-8 pt-10 pb-8 flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mb-6 group hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <RiAdminFill className="text-white text-[34px] relative z-10" />
              <div className="absolute inset-0 rounded-2xl border-2 border-white/30 group-hover:border-white/40 transition-colors"></div>
            </div>
            <h2 className="text-gray-900 dark:text-white text-[32px] font-bold leading-tight text-center tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-relaxed pt-3 text-center max-w-[320px]">
              Sign in to your admin account to continue
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-10 w-full">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>


              {/* Email Field */}
              <div className="flex flex-col gap-3">
                <label
                  className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal tracking-wide"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800 group-focus-within:bg-blue-100 dark:group-focus-within:bg-slate-700 transition-colors">
                      <FaMailBulk className="text-blue-500 dark:text-blue-400 group-focus-within:text-blue-600 text-[18px]" />
                    </div>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border-2 border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-[#1f2937]/50 hover:bg-white dark:hover:bg-[#1f2937] h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 pl-[68px] pr-4 text-base font-normal leading-normal transition-all duration-200 hover:border-gray-300 dark:hover:border-slate-700 shadow-sm"
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
                    className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal tracking-wide"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Link
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transition-colors cursor-pointer hover:underline"
                    href="/forgot-password"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex w-full flex-1 items-stretch rounded-xl group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800 group-focus-within:bg-blue-100 dark:group-focus-within:bg-slate-700 transition-colors">
                      <FaKey className="text-blue-500 dark:text-blue-400 group-focus-within:text-blue-600 text-[18px]" />
                    </div>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border-2 border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-[#1f2937]/50 hover:bg-white dark:hover:bg-[#1f2937] h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 pl-[68px] pr-14 text-base font-normal leading-normal transition-all duration-200 hover:border-gray-300 dark:hover:border-slate-700 shadow-sm"
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
                    className="absolute right-0 top-0 h-14 w-14 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:rounded-lg disabled:opacity-50"
                  >
                    {showPassword ? (
                      <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                        <FaEyeSlash className="text-[20px]" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
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

              {/* Join Team Request Footer */}
              <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Interested in joining our team?{" "}
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(true)}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1"
                  >
                    Request to Join Team
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── JOIN TEAM REQUEST MODAL ── */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaUserPlus className="text-blue-500" /> Apply to Join Team
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Submit your details for admin review. If approved, you will receive an invitation link via email.
                </p>
              </div>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={joinForm.first_name}
                    onChange={(e) => setJoinForm({ ...joinForm, first_name: e.target.value })}
                    placeholder="e.g. Rahul"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={joinForm.last_name}
                    onChange={(e) => setJoinForm({ ...joinForm, last_name: e.target.value })}
                    placeholder="e.g. Sharma"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={joinForm.email}
                  onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                  placeholder="rahul@example.com"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={joinForm.phone}
                    onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Desired Role *</label>
                  <select
                    value={joinForm.desired_role}
                    onChange={(e) => setJoinForm({ ...joinForm, desired_role: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="customer_support">Customer Support</option>
                    <option value="operation_manager">Operation Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Experience / Application Notes</label>
                <textarea
                  rows={3}
                  value={joinForm.experience_notes}
                  onChange={(e) => setJoinForm({ ...joinForm, experience_notes: e.target.value })}
                  placeholder="Tell us about your background or why you want to join..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJoin}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmittingJoin ? "Submitting..." : "Submit Join Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
