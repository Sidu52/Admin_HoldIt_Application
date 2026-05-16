import { Suspense } from "react";
import Store from "./store";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Store />
    </Suspense>
  );
}
