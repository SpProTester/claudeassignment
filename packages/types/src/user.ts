import type { UUID, Timestamp } from "./common";

export type UserRole = "job_seeker" | "employer" | "admin" | "super_admin";

export interface User {
  id: UUID;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  isMfaEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp | null;
}

export interface UserProfile {
  userId: UUID;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phone: string | null;
  timezone: string;
  locale: string;
}
