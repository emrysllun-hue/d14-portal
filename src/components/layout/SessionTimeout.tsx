'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// 20 minutes in milliseconds (20 * 60 * 1000)
const TIMEOUT_MS = 1200000; 

export default function SessionTimeout() {
  const router = useRouter();
  const supabase = createClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Timeout sign out error:", error);
    } finally {
      router.push('/login');
      router.refresh();
    }
  }, [router, supabase.auth]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Set a new timer for 20 minutes
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    // List of events that count as "activity"
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

    const handleActivity = () => {
      resetTimer();
    };

    // Initialize the timer when the component loads
    resetTimer();

    // Add event listeners to the window
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup function (runs when the component unmounts)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer]);

  // This component doesn't display anything on the screen
  return null;
}