// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { AUTH_TOKEN } from "@/app/config/constants";
// import { getAccessToken } from "./utils/cookies";

// const protectedRoutes = ["/dashboard", "/settings", "/users"];
// const authRoutes = ["/login"];

// export function middleware(request: NextRequest) {
//   const token = getAccessToken("accessToken");
//   console.log("token", token);
//   const { pathname } = request.nextUrl;

//   const isProtectedRoute = protectedRoutes.some((route) =>
//     pathname.startsWith(route)
//   );
//   const isAuthRoute = authRoutes.includes(pathname);

//   // Redirect to login if accessing protected route without token
//   // if (isProtectedRoute && !token) {
//   //   const loginUrl = new URL('/login', request.url)
//   //   loginUrl.searchParams.set('redirect', pathname)
//   //   return NextResponse.redirect(loginUrl)
//   // }

//   // Redirect to dashboard if accessing auth route with token
//   if (isAuthRoute && token) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths (accessible without login)
const publicPaths = ["/login", "/signup"];

// Regex routes
const loginVerificationRegex = /^\/login\/verification\/[^/]+$/;
const signupVerificationRegex = /^\/signup\/verify\/[^/]+$/;

// Redirect helper
const redirect = (url: string, request: NextRequest) =>
  NextResponse.redirect(new URL(url, request.url));

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("refreshToken")?.value;

  console.log("token ", token);
  const isPublicRoute =
    publicPaths.includes(path) ||
    loginVerificationRegex.test(path) ||
    signupVerificationRegex.test(path) ||
    (path === "/qr-code-generator" &&
      process.env.NEXT_PUBLIC_ENV_TYPE === "production");

  /**
   * ✅ USER IS AUTHENTICATED
   */
  if (token) {
    // Prevent access to login/signup after login
    if (
      path === "/login" ||
      path === "/signup" ||
      loginVerificationRegex.test(path) ||
      signupVerificationRegex.test(path)
    ) {
      return redirect("/dashboard", request);
    }

    return NextResponse.next();
  }

  if (!isPublicRoute) {
    return redirect("/login", request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard","/users","/profile"],
};
