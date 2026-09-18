import { useState, useCallback } from 'react';

const STORAGE_KEYS = {
  jobseeker: 'demo_jobseeker_uses',
  hr: 'demo_hr_uses',
} as const;

type DemoType = keyof typeof STORAGE_KEYS;

interface UseDemoLimitReturn {
  /** Number of uses remaining (0 = limit reached) */
  usesRemaining: number;
  /** Total uses consumed so far */
  usesConsumed: number;
  /** Maximum allowed uses */
  maxUses: number;
  /** Whether the limit has been reached */
  isLimitReached: boolean;
  /** Record a single use — call after a successful demo action */
  recordUse: () => void;
  /** Reset the counter (for testing/admin) */
  reset: () => void;
}

function getStoredUses(key: string): number {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return 0;
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  } catch {
    return 0;
  }
}

function setStoredUses(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // localStorage may be full or disabled — silently fail
  }
}

/**
 * Browser-based rate limiter for demo pages.
 * Persists usage count in localStorage.
 *
 * @param type - "jobseeker" or "hr"
 * @param maxUses - Maximum number of free uses (default: 2)
 */
export function useDemoLimit(type: DemoType, maxUses: number = 2): UseDemoLimitReturn {
  const storageKey = STORAGE_KEYS[type];

  const [usesConsumed, setUsesConsumed] = useState<number>(() => getStoredUses(storageKey));

  const usesRemaining = Math.max(0, maxUses - usesConsumed);
  const isLimitReached = usesConsumed >= maxUses;

  const recordUse = useCallback(() => {
    setUsesConsumed((prev) => {
      const next = prev + 1;
      setStoredUses(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const reset = useCallback(() => {
    setStoredUses(storageKey, 0);
    setUsesConsumed(0);
  }, [storageKey]);

  return {
    usesRemaining,
    usesConsumed,
    maxUses,
    isLimitReached,
    recordUse,
    reset,
  };
}
