import { Suspense } from "react";
import UserClient from "./user";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserClient />
    </Suspense>
  );
}
