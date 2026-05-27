import type { UUID, Timestamp } from "./common";

export interface AtsStage {
  id: UUID;
  jobId: UUID;
  name: string;
  position: number;
  color: string;
  isDefault: boolean;
}

export interface AtsCandidate {
  applicationId: UUID;
  jobId: UUID;
  stageId: UUID;
  position: number;
  score: number | null;
  tags: string[];
  assignedTo: UUID | null;
  movedAt: Timestamp;
}

export interface Interview {
  id: UUID;
  applicationId: UUID;
  scheduledAt: Timestamp;
  durationMinutes: number;
  interviewType: "phone" | "video" | "onsite" | "technical" | "panel";
  location: string | null;
  meetingUrl: string | null;
  interviewerIds: UUID[];
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  feedbackSubmitted: boolean;
  createdAt: Timestamp;
}

export interface InterviewFeedback {
  id: UUID;
  interviewId: UUID;
  interviewerId: UUID;
  overallRating: 1 | 2 | 3 | 4 | 5;
  technicalRating: number | null;
  communicationRating: number | null;
  recommendation: "strong_yes" | "yes" | "no" | "strong_no";
  notes: string;
  createdAt: Timestamp;
}
