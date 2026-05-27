import type { UUID, Timestamp } from "./common";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "interview_scheduled"
  | "interview_completed"
  | "offer_extended"
  | "offer_accepted"
  | "offer_declined"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: UUID;
  jobId: UUID;
  seekerId: UUID;
  resumeId: UUID;
  coverLetter: string | null;
  status: ApplicationStatus;
  appliedAt: Timestamp;
  updatedAt: Timestamp;
  withdrawnAt: Timestamp | null;
  withdrawalReason: string | null;
}

export interface ApplicationNote {
  id: UUID;
  applicationId: UUID;
  authorId: UUID;
  content: string;
  isInternal: boolean;
  createdAt: Timestamp;
}

export interface ApplicationTimeline {
  id: UUID;
  applicationId: UUID;
  status: ApplicationStatus;
  note: string | null;
  changedById: UUID;
  changedAt: Timestamp;
}
