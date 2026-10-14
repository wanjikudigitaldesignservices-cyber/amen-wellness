import { createContext } from 'react';
import type { RegionId } from '../../config/regions';
import type { AuthSession, AuthUser, Permission, UserRole } from '../../types/auth';

export interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isMfaRequired: boolean;
  isMfaVerified: boolean;
  pendingMfaUser: AuthUser | null;
  activeRegion: RegionId;
  canAccess: (region: RegionId) => boolean;
  hasPerm: (perm: Permission, targetRegion?: RegionId) => boolean;
  hasUserRole: (role: UserRole | UserRole[]) => boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean }>;
  verifyMfa: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  switchActiveRegion: (region: RegionId) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
