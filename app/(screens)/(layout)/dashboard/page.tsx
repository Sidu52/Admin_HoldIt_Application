import { Suspense } from "react";
import DashboardClient from "./dashboard";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
