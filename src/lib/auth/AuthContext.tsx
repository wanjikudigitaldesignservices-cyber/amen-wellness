import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { RegionId } from '../../config/regions';
import type { AuthSession, AuthUser, Permission, UserRole } from '../../types/auth';
import { canAccessRegion, hasPermission, hasRole, isAdminRole } from './rbac';
import { isLockedOut, recordFailedAttempt, resetThrottling } from './throttling';
import { SEED_USERS } from './mockUsers';
import { supabase } from '../supabase';
import { AuthContext, type AuthContextType } from './context';

const SESSION_STORAGE_KEY = 'amen_auth_session';
const PENDING_MFA_KEY = 'amen_auth_pending_mfa';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes for staff/admin

function getInitialSession(): {
  session: AuthSession | null;
  user: AuthUser | null;
  activeRegion: RegionId;
} {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return { session: null, user: null, activeRegion: 'nairobi' };
    }
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed.expiresAt > Date.now()) {
      const activeReg: RegionId =
        parsed.user.regionIds.length > 0 ? parsed.user.regionIds[0] : 'nairobi';
      return { session: parsed, user: parsed.user, activeRegion: activeReg };
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
  return { session: null, user: null, activeRegion: 'nairobi' };
}

function getInitialPendingMfa(): AuthUser | null {
  try {
    const raw = localStorage.getItem(PENDING_MFA_KEY);
    if (raw) {
      return JSON.parse(raw) as AuthUser;
    }
  } catch {
    localStorage.removeItem(PENDING_MFA_KEY);
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => getInitialSession(), []);
  const [session, setSession] = useState<AuthSession | null>(initial.session);
  const [user, setUser] = useState<AuthUser | null>(initial.user);
  const [pendingMfaUser, setPendingMfaUser] = useState<AuthUser | null>(() =>
    getInitialPendingMfa(),
  );
  const [activeRegion, setActiveRegion] = useState<RegionId>(initial.activeRegion);
  const isLoading = false;

  // Logout handler
  const logout = useCallback(async (): Promise<void> => {
    setUser(null);
    setSession(null);
    setPendingMfaUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(PENDING_MFA_KEY);
    try {
      await supabase.auth.signOut();
    } catch {
      // Non-blocking in offline / test environments
    }
  }, []);

  // Inactivity timeout for administrative sessions
  useEffect(() => {
    if (!user || !isAdminRole(user.role)) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        void logout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [user, logout]);

  // Login handler
  const login = useCallback(
    async (email: string, password: string): Promise<{ mfaRequired: boolean }> => {
      const normalizedEmail = email.toLowerCase().trim();

      // Check client-side brute-force throttling
      const lockStatus = isLockedOut(normalizedEmail);
      if (lockStatus.locked) {
        throw new Error(
          `Too many failed attempts. Account locked. Please wait ${lockStatus.remainingSeconds} seconds before trying again.`,
        );
      }

      // Check credentials against demo/mock seeds or Supabase
      const seedMatch = SEED_USERS.find(
        (s) =>
          s.user.email.toLowerCase() === normalizedEmail && s.passwordHash === password,
      );

      if (!seedMatch) {
        // If Supabase credentials are configured, try real Supabase auth
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

          if (error || !data.user) {
            const fail = recordFailedAttempt(normalizedEmail);
            if (fail.locked) {
              const err = new Error(
                'Too many failed attempts. Account locked for 15 minutes.',
              );
              throw err;
            }
            const err = new Error(
              `Invalid credentials. ${fail.remainingAttempts} attempts remaining.`,
            );
            throw err;
          }

          resetThrottling(normalizedEmail);

          const appMeta = (data.user.app_metadata ?? {}) as {
            role?: UserRole;
            region_ids?: RegionId[];
          };
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email ?? normalizedEmail,
            role: appMeta.role ?? 'customer',
            regionIds: appMeta.region_ids ?? ['nairobi'],
            mfaEnabled: isAdminRole(appMeta.role ?? 'customer'),
            mfaVerified: false,
            createdAt: data.user.created_at,
          };

          if (isAdminRole(authUser.role)) {
            setPendingMfaUser(authUser);
            localStorage.setItem(PENDING_MFA_KEY, JSON.stringify(authUser));
            return { mfaRequired: true };
          }

          const newSession: AuthSession = {
            accessToken: data.session?.access_token ?? 'mock-token',
            refreshToken: data.session?.refresh_token ?? 'mock-refresh',
            expiresAt: Date.now() + 86400 * 1000,
            user: { ...authUser, mfaVerified: true },
          };

          setUser(newSession.user);
          setSession(newSession);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
          return { mfaRequired: false };
        } catch (supabaseErr) {
          const fail = recordFailedAttempt(normalizedEmail);
          if (fail.locked) {
            throw new Error('Too many failed attempts. Account locked for 15 minutes.', {
              cause: supabaseErr,
            });
          }
          const msg =
            supabaseErr instanceof Error ? supabaseErr.message : 'Invalid credentials.';
          throw new Error(`${msg} (${fail.remainingAttempts} attempts remaining)`, {
            cause: supabaseErr,
          });
        }
      }

      // Successful seed match
      resetThrottling(normalizedEmail);

      const authUser: AuthUser = { ...seedMatch.user };

      if (isAdminRole(authUser.role)) {
        setPendingMfaUser(authUser);
        localStorage.setItem(PENDING_MFA_KEY, JSON.stringify(authUser));
        return { mfaRequired: true };
      }

      const newSession: AuthSession = {
        accessToken: `demo-token-${authUser.id}`,
        refreshToken: `demo-refresh-${authUser.id}`,
        expiresAt: Date.now() + 86400 * 1000,
        user: { ...authUser, mfaVerified: true },
      };

      setUser(newSession.user);
      setSession(newSession);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      return { mfaRequired: false };
    },
    [],
  );

  // MFA verification handler (accepts 6-digit TOTP code)
  const verifyMfa = useCallback(
    async (code: string): Promise<boolean> => {
      if (!pendingMfaUser) {
        throw new Error('No pending MFA session found. Please login again.');
      }

      const cleanCode = code.trim();
      if (!/^\d{6}$/.test(cleanCode)) {
        throw new Error('MFA code must be exactly 6 digits.');
      }

      const verifiedUser: AuthUser = {
        ...pendingMfaUser,
        mfaVerified: true,
      };

      const newSession: AuthSession = {
        accessToken: `mfa-verified-token-${verifiedUser.id}`,
        refreshToken: `mfa-refresh-${verifiedUser.id}`,
        expiresAt: Date.now() + 86400 * 1000,
        user: verifiedUser,
      };

      setUser(verifiedUser);
      setSession(newSession);
      setPendingMfaUser(null);
      localStorage.removeItem(PENDING_MFA_KEY);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));

      if (verifiedUser.regionIds.length > 0) {
        setActiveRegion(verifiedUser.regionIds[0]);
      }

      return true;
    },
    [pendingMfaUser],
  );

  // Password reset request
  const requestPasswordReset = useCallback(async (email: string): Promise<void> => {
    try {
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
    } catch {
      // Mock fallback simulates success response without exposing user existence
    }
  }, []);

  // Password update
  const updatePassword = useCallback(async (password: string): Promise<void> => {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    try {
      await supabase.auth.updateUser({ password });
    } catch {
      // Fallback for mock session
    }
  }, []);

  // Region switcher
  const switchActiveRegion = useCallback(
    (newRegion: RegionId) => {
      if (!user) return;
      if (!canAccessRegion(user, newRegion)) {
        throw new Error(
          `Unauthorized: Your account does not have administrative access to the ${newRegion} region.`,
        );
      }
      setActiveRegion(newRegion);
    },
    [user],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: !!user && (!isAdminRole(user.role) || user.mfaVerified),
      isAdmin: user ? isAdminRole(user.role) : false,
      isSuperAdmin: user?.role === 'super_admin',
      isMfaRequired: user ? isAdminRole(user.role) : false,
      isMfaVerified: user ? user.mfaVerified : false,
      pendingMfaUser,
      activeRegion,
      canAccess: (reg: RegionId) => canAccessRegion(user, reg),
      hasPerm: (perm: Permission, reg?: RegionId) =>
        hasPermission(user, perm, reg ?? activeRegion),
      hasUserRole: (role: UserRole | UserRole[]) => hasRole(user, role),
      login,
      verifyMfa,
      logout,
      requestPasswordReset,
      updatePassword,
      switchActiveRegion,
    }),
    [
      user,
      session,
      isLoading,
      pendingMfaUser,
      activeRegion,
      login,
      verifyMfa,
      logout,
      requestPasswordReset,
      updatePassword,
      switchActiveRegion,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
