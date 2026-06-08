import { Suspense } from "react";
import StoreOwnerClient from "./storeOwner";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StoreOwnerClient />
    </Suspense>
  );
}
