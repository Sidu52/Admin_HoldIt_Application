import { Suspense } from "react";
import Profile from "./profile";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Profile />
    </Suspense>
  );
}
