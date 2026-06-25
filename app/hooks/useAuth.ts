// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "@/app/store";
// import { logout as logoutAction } from "@/app/store/slices/authSlice";
// import { useLogoutApiMutation, useVerifySessionQuery } from "@/app/services/authApi";
// import { useRouter, usePathname } from "next/navigation";
// import { useEffect } from "react";

// export const useAuth = () => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const dispatch = useDispatch();
  
//   const user = useSelector((state: RootState) => state.auth.user);
//   const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

//   const isPublicRoute = ["/login", "/signup", "/forgot-password", "/reset-password"].some(
//     (route) => pathname?.startsWith(route)
//   );

//   const { data: verifiedUser, isLoading, isError, error } = useVerifySessionQuery(undefined, {
//     skip: isAuthenticated || isPublicRoute, // skip query if already authenticated or on a public route
//   });

//   const [logoutApi, { isLoading: logoutLoading, isSuccess: logoutSuccess }] = useLogoutApiMutation();

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//     } catch (err) {
//       console.error("Logout API failed, continuing client logout", err);
//     } finally {
//       dispatch(logoutAction());
//       router.push("/login");
//     }
//   };

//   return {
//     user: user || verifiedUser,
//     isLoading,
//     isAuthenticated: isAuthenticated || !!verifiedUser,
//     logout: handleLogout,
//     logoutSuccess,
//     logoutLoading,
//     error: error ? (error as any)?.data?.message || "Session verification failed" : undefined,
//   };
// };


import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/store";
import { logout as logoutAction, setUser } from "@/app/store/slices/authSlice";
import {
  useLogoutApiMutation,
  useVerifySessionQuery,
  useSignupMutation,
} from "@/app/services/authApi";
import { useRouter, usePathname } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const isPublicRoute = ["/login", "/signup", "/forgot-password", "/reset-password"].some(
    (route) => pathname?.startsWith(route)
  );

  const { data: verifiedUser, isLoading, isError, error } = useVerifySessionQuery(undefined, {
    skip: isAuthenticated || isPublicRoute,
  });

  const [logoutApi, { isLoading: logoutLoading, isSuccess: logoutSuccess }] = useLogoutApiMutation();

  // NEW: signup mutation
  const [signupApi, { isLoading: signupLoading, error: signupError }] = useSignupMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (err) {
      console.error("Logout API failed, continuing client logout", err);
    } finally {
      dispatch(logoutAction());
      router.push("/login");
    }
  };

  // NEW: signup handler
  const handleSignup = async (payload: any) => {
    const result = await signupApi(payload).unwrap(); // throws on failure
    dispatch(setUser(result)); // adjust to however your slice stores the user
    return result;
  };

  return {
    user: user || verifiedUser,
    isLoading,
    isAuthenticated: isAuthenticated || !!verifiedUser,
    logout: handleLogout,
    logoutSuccess,
    logoutLoading,
    signup: handleSignup,      // <-- now actually exists
    signupLoading,
    error: error ? (error as any)?.data?.message || "Session verification failed" : undefined,
    signupError: signupError ? (signupError as any)?.data?.message : undefined,
  };
};