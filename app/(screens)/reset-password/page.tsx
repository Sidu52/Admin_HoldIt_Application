"use client";

import { useState, useEffect } from "react";
import { useResetPasswordMutation, useVerifyResetTokenQuery } from "../../services/authApi";
import { useToast } from "../../hooks/useToast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { Suspense } from "react";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const { data, isLoading: verifying, error: verifyError } = useVerifyResetTokenQuery(token || "", { skip: !token });
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const toast = useToast();
  const router = useRouter();

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500 bg-white p-6 rounded shadow">Invalid password reset link. Token missing.</p>
      </div>
    );
  }

  if (verifying) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (verifyError || !data?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded shadow max-w-sm w-full text-center space-y-4">
          <p className="text-red-500">The reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="text-blue-600 hover:underline block">Request a new one</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword({ token, password }).unwrap();
      toast.success("Password reset successfully. You can now log in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
