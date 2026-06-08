import { useSelector } from "react-redux";
import { RootState } from "../store";

export const usePermission = (allowedRoles: string[]) => {
  const user = useSelector((state: RootState) => state.auth.user);
  console.log("user", user)
  console.log("allowedRoles", allowedRoles)

  if (!user || !user.role) {
    return false;
  }
  console.log("allowedRoles.includes(user.role)",allowedRoles.includes(user.role.toUpperCase()))
  return allowedRoles.includes(user.role.toUpperCase());
};
