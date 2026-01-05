import { Suspense } from "react";
import ProfileClient from "./page";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileClient />
    </Suspense>
  );
}


                        // "primary": "#135bec",
                        // "background-light": "#f6f6f8",
                        // "background-dark": "#101622",
                        // "surface-dark": "#111722",
                        // "surface-card": "#232f48",
                        // "text-muted": "#92a4c9"
                        //  "display": ["Manrope", "Noto Sans", "sans-serif"],
                        // "body": ["Manrope", "Noto Sans", "sans-serif"]

