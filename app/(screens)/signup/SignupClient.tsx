"use client";
import { useSearchParams } from "next/navigation";
import InvalidLinkPage from "@/app/components/verification/Invalid_Link";
import SignupPage from "@/app/components/verification/Signup";
import VerificationPage from "@/app/components/verification/Verification";
import { useVerifyInvite } from "@/app/hooks/useVerifyInvite";

export default function Signup() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { data, isLoading, error } = useVerifyInvite(token);

  if (isLoading) return <VerificationPage isLoading={true} error={error} />;

  if (error || !data?.success || !token) {
    return <InvalidLinkPage />;
  }
  return (
    <div>
      {/* Signup form here */}
      <SignupPage data={data.data} token={token} />
    </div>
  );
}
