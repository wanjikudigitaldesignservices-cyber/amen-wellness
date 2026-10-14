import type { RegionId } from '../config/regions';

export type UserRole =
  | 'super_admin'
  | 'region_admin'
  | 'receptionist'
  | 'therapist'
  | 'content_editor'
  | 'customer';

export type Permission =
  | 'admin:all'
  | 'admin:settings:read'
  | 'admin:settings:write'
  | 'admin:users:manage'
  | 'bookings:read'
  | 'bookings:write'
  | 'bookings:cancel'
  | 'services:read'
  | 'services:write'
  | 'therapists:read'
  | 'therapists:write'
  | 'rooms:read'
  | 'rooms:write'
  | 'customers:read'
  | 'customers:write'
  | 'intake:read_sensitive'
  | 'finance:read'
  | 'finance:refund'
  | 'cms:read'
  | 'cms:write'
  | 'audit:read';

export interface UserAppMetadata {
  role: UserRole;
  region_ids: RegionId[];
  mfa_enabled?: boolean;
  mfa_verified?: boolean;
  permissions?: Permission[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  regionIds: RegionId[];
  mfaEnabled: boolean;
  mfaVerified: boolean;
  firstName?: string;
  lastName?: string;
  assignedTherapistId?: string;
  createdAt: string;
  lastSignInAt?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

export interface MfaChallenge {
  id: string;
  factorId: string;
  type: 'totp';
  expiresAt: number;
}

export interface LoginThrottlingState {
  attempts: number;
  lockoutUntil: number | null;
  lastAttemptAt: number | null;
}
