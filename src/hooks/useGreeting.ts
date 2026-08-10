import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { greetingForTime } from '@/utils/date';

/**
 * Returns a greeting that's always based on the current time, not just
 * whatever it was when the screen first mounted. Two things keep it fresh:
 *  - Recomputes every time the Routine screen regains focus (covers the
 *    common case: app backgrounded in the afternoon, reopened at night).
 *  - Recomputes on a 60-second timer while the screen is focused (covers the
 *    rarer case: app left open, sitting right on an hour boundary).
 * Without either of these, the greeting is only ever as fresh as the last
 * unrelated re-render — usually fine, but not guaranteed, and "the greeting
 * is wrong" is confusing enough to be worth being defensive about.
 */
export function useGreeting(): string {
  const [greeting, setGreeting] = useState(() => greetingForTime());

  useFocusEffect(
    useCallback(() => {
      setGreeting(greetingForTime());
      const interval = setInterval(() => setGreeting(greetingForTime()), 60_000);
      return () => clearInterval(interval);
    }, [])
  );

  return greeting;
}
