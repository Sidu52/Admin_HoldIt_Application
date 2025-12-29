'use client';

import { useEffect, useRef } from 'react';
import { useRefreshToken } from '@/app/hooks/useRefreshToken';
import { shouldRefreshToken, getTimeUntilExpiry } from '@/app/utils/cookies';

export default function TokenMonitor() {
  const { mutate: refreshToken } = useRefreshToken();
  const refreshAttemptedRef = useRef(false);
  const lastRefreshTimeRef = useRef<number>(0);

  useEffect(() => {
    console.log('TokenMonitor: Started');
    
    const checkAndRefreshToken = () => {
      const now = Date.now();
      if (now - lastRefreshTimeRef.current < 30000) {
        return;
      }
      // Check if token needs refresh
      if (shouldRefreshToken() && !refreshAttemptedRef.current) {
        console.log('TokenMonitor: Token needs refresh');
        refreshAttemptedRef.current = true;
        lastRefreshTimeRef.current = now;
        
        refreshToken();
      }
      
      // Reset flag if token is now valid
      const timeLeft = getTimeUntilExpiry();
      if (timeLeft > 300000) { // 5 minutes
        refreshAttemptedRef.current = false;
      }
      
      console.log('TokenMonitor: Status', {
        timeLeft: Math.round(timeLeft / 1000) + 's',
        shouldRefresh: shouldRefreshToken(),
        refreshAttempted: refreshAttemptedRef.current
      });
    };
    
    // Check immediately
    checkAndRefreshToken();
    
    // Check every 10 seconds
    const interval = setInterval(checkAndRefreshToken, 10000);
    
    return () => {
      console.log('TokenMonitor: Cleanup');
      clearInterval(interval);
    };
  }, [refreshToken]);
  
  return null;
}