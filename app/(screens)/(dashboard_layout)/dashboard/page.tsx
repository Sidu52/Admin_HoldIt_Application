import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
