import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths (accessible without login)
const publicPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];

// Regex routes
const loginVerificationRegex = /^\/login\/verification\/[^/]+$/;
const signupVerificationRegex = /^\/signup\/verify\/[^/]+$/;

// Redirect helper
const redirect = (url: string, request: NextRequest) =>
    NextResponse.redirect(new URL(url, request.url));

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get("admin_accessToken")?.value || request.cookies.get("accessToken")?.value;
    const hasSession = request.cookies.get("admin_hasSession")?.value || request.cookies.get("hasSession")?.value;
    const isAuthenticated = token || hasSession;

    const isPublicRoute =
        publicPaths.includes(path) ||
        loginVerificationRegex.test(path) ||
        signupVerificationRegex.test(path) ||
        (path === "/qr-code-generator" &&
            process.env.NEXT_PUBLIC_ENV_TYPE === "production");

    /**
     * USER IS AUTHENTICATED OR HAS ACTIVE SESSION
     */
    if (isAuthenticated) {
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
    matcher: [
        "/",
        "/dashboard",
        "/users",
        "/users/:path*",
        "/drivers",
        "/drivers/:path*",
        "/store",
        "/store/:path*",
        "/storeowner",
        "/storeowner/:path*",
        "/bookings",
        "/bookings/:path*",
        "/serviceable-areas",
        "/serviceable-areas/:path*",
        "/payments",
        "/payments/:path*",
        "/reports",
        "/reports/:path*",
        "/teams",
        "/teams/:path*",
        "/profile",
        "/profile/:path*",
        "/login",
        "/login/:path*",
    ],
};
