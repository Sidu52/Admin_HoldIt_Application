import Cookies from 'js-cookie';
import { AUTH_TOKEN } from '@/app/config/constants';
const TOKEN_EXPIRY_KEY = 'token_expiry_timestamp';

// Note: Refresh token is now HTTP-only and handled by browser
export const setAuthTokens = (accessToken: string, expiresIn: number) => {
  const expiryTimestamp = Date.now() + expiresIn * 1000;
  const expiryDate = new Date(expiryTimestamp);
  // Store access token in regular cookie
  Cookies.set(AUTH_TOKEN, accessToken, {
    expires: expiryDate,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
    if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTimestamp.toString());
  }

    console.log('Token stored:', {
    expiresIn,
    expiry: new Date(expiryTimestamp).toLocaleTimeString()
  });
  
};

export const getAccessToken = () => Cookies.get(AUTH_TOKEN);

export const clearAuthTokens = () => {
  Cookies.remove(AUTH_TOKEN);
  
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

};

export const isTokenExpired = (): boolean => {
  if (typeof window === 'undefined') return true;
  
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryStr) return true;

   const expiryTimestamp = parseInt(expiryStr, 10);
  const now = Date.now();

  return expiryTimestamp - 60000 <= now;
};

// Check if user has a valid token
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if we have expiry timestamp
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryStr) return false;
  
  const expiryTimestamp = parseInt(expiryStr, 10);
  const now = Date.now();
  
  // Token is valid if expiry is in the future
  return expiryTimestamp > now;
};

// Get time until token expires (in milliseconds)
export const getTimeUntilExpiry = (): number => {
  if (typeof window === 'undefined') return 0;
  
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryStr) return 0;
  
  const expiryTimestamp = parseInt(expiryStr, 10);
  return Math.max(0, expiryTimestamp - Date.now());
};

// Check if token needs refresh (less than 2 minutes left)
export const shouldRefreshToken = (): boolean => {
  const timeUntilExpiry = getTimeUntilExpiry();
  return timeUntilExpiry > 0 && timeUntilExpiry < 120000; // Less than 2 minutes
};