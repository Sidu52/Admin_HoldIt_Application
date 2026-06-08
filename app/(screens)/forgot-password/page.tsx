"use client";

import { useState } from "react";
import { useForgotPasswordMutation } from "../../services/authApi";
import { useToast } from "../../hooks/useToast";
import Link from "next/link";
import { FaMailBulk } from "react-icons/fa";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email).unwrap();
      setSuccess(true);
      toast.success("Reset link sent to your email");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send reset email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        
        {success ? (
          <div className="text-center space-y-4">
            <p className="text-green-600 bg-green-50 p-4 rounded-lg">
              Check your email for a password reset link.
            </p>
            <Link href="/login" className="text-blue-600 hover:underline block">
              Back to logic
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <p className="text-sm text-gray-600 text-center">
              Enter your email address to receive a password reset link.
            </p>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMailBulk className="text-gray-400" />
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : "Send Reset Link"}
            </button>
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
