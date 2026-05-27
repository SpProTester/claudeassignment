import type { UUID, Timestamp } from "./common";

export interface EmployerProfile {
  userId: UUID;
  companyId: UUID;
  jobTitle: string | null;
  department: string | null;
  isHiringManager: boolean;
  canPostJobs: boolean;
  canViewApplications: boolean;
  canManageTeam: boolean;
  updatedAt: Timestamp;
}

export interface EmployerTeamMember {
  id: UUID;
  companyId: UUID;
  userId: UUID;
  role: "owner" | "admin" | "recruiter" | "hiring_manager" | "viewer";
  invitedById: UUID;
  invitedAt: Timestamp;
  joinedAt: Timestamp | null;
}
