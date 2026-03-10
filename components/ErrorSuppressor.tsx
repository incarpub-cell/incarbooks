'use client';

import { useEffect } from 'react';

/**
 * Suppresses common, harmless React/Next.js/Firebase AbortErrors in development
 * that clutter the console during hot-reloading or unmounting.
 */
export function ErrorSuppressor() {
  useEffect(() => {
    // Only apply in development
    if (process.env.NODE_ENV !== 'development') return;

    const originalError = console.error;
    const originalWarn = console.warn;

    const isAbortError = (args: any[]) => {
      const msg = args.join(' ');
      return (
        msg.includes('AbortError') ||
        msg.includes('The user aborted a request') ||
        msg.includes('cancelled')
      );
    };

    console.error = (...args: any[]) => {
      if (isAbortError(args)) return;
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      if (isAbortError(args)) return;
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
