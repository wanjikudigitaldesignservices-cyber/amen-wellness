import type { LoginThrottlingState } from '../../types/auth';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_PREFIX = 'amen_auth_throttle_';

function getStorageKey(identifier: string): string {
  return `${STORAGE_PREFIX}${identifier.toLowerCase().trim()}`;
}

export function getThrottlingState(identifier: string): LoginThrottlingState {
  try {
    const raw = localStorage.getItem(getStorageKey(identifier));
    if (!raw) {
      return { attempts: 0, lockoutUntil: null, lastAttemptAt: null };
    }
    const state = JSON.parse(raw) as LoginThrottlingState;
    // Check if lockout has expired
    if (state.lockoutUntil && Date.now() > state.lockoutUntil) {
      resetThrottling(identifier);
      return { attempts: 0, lockoutUntil: null, lastAttemptAt: null };
    }
    return state;
  } catch {
    return { attempts: 0, lockoutUntil: null, lastAttemptAt: null };
  }
}

export function isLockedOut(identifier: string): {
  locked: boolean;
  remainingSeconds: number;
} {
  const state = getThrottlingState(identifier);
  if (!state.lockoutUntil) {
    return { locked: false, remainingSeconds: 0 };
  }
  const remainingMs = state.lockoutUntil - Date.now();
  if (remainingMs <= 0) {
    resetThrottling(identifier);
    return { locked: false, remainingSeconds: 0 };
  }
  return { locked: true, remainingSeconds: Math.ceil(remainingMs / 1000) };
}

export function recordFailedAttempt(identifier: string): {
  attempts: number;
  remainingAttempts: number;
  locked: boolean;
  remainingSeconds: number;
} {
  const state = getThrottlingState(identifier);
  const newAttempts = state.attempts + 1;
  const now = Date.now();
  let lockoutUntil: number | null = null;

  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    lockoutUntil = now + LOCKOUT_DURATION_MS;
  }

  const newState: LoginThrottlingState = {
    attempts: newAttempts,
    lockoutUntil,
    lastAttemptAt: now,
  };

  try {
    localStorage.setItem(getStorageKey(identifier), JSON.stringify(newState));
  } catch {
    // Non-blocking in headless environments
  }

  return {
    attempts: newAttempts,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - newAttempts),
    locked: lockoutUntil !== null,
    remainingSeconds: lockoutUntil ? Math.ceil(LOCKOUT_DURATION_MS / 1000) : 0,
  };
}

export function resetThrottling(identifier: string): void {
  try {
    localStorage.removeItem(getStorageKey(identifier));
  } catch {
    // Non-blocking in headless environments
  }
}
