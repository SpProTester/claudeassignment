import type { UUID, Timestamp } from "./common";
import type { UserRole } from "./user";

export interface AuthSession {
  userId: UUID;
  role: UserRole;
  email: string;
  expiresAt: Timestamp;
}

export interface OAuthProvider {
  provider: "google" | "linkedin";
  providerId: string;
  userId: UUID;
  createdAt: Timestamp;
}

export interface MfaChallenge {
  challengeId: UUID;
  userId: UUID;
  expiresAt: Timestamp;
}

export interface PasswordResetToken {
  token: string;
  userId: UUID;
  expiresAt: Timestamp;
  usedAt: Timestamp | null;
}
