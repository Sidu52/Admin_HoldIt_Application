import { Suspense } from "react";
import DriverClient from "./driver";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DriverClient />
    </Suspense>
  );
}
