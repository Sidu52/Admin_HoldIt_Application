import { Suspense } from "react";
import Team from "./team";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Team />
    </Suspense>
  );
}
