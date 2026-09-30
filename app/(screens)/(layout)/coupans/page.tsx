import { Suspense } from "react";
import CoupanClient from "./coupan";

export default function CoupanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CoupanClient />
    </Suspense>
  );
}
