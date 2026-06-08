import Cookies from "js-cookie";

export const getAccessToken = (key: string) => Cookies.get(key);
