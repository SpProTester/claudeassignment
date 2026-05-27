import type { UUID, Timestamp } from "./common";
import type { WorkMode, ExperienceLevel } from "./job";

export interface SeekerProfile {
  userId: UUID;
  headline: string | null;
  bio: string | null;
  currentTitle: string | null;
  currentCompany: string | null;
  location: string | null;
  country: string | null;
  skills: string[];
  experienceLevel: ExperienceLevel | null;
  preferredWorkMode: WorkMode | null;
  preferredSalaryMin: number | null;
  preferredSalaryMax: number | null;
  preferredCurrency: string;
  isOpenToWork: boolean;
  isProfilePublic: boolean;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  updatedAt: Timestamp;
}

export interface SavedJob {
  id: UUID;
  seekerId: UUID;
  jobId: UUID;
  savedAt: Timestamp;
  notes: string | null;
}

export interface JobAlert {
  id: UUID;
  seekerId: UUID;
  name: string;
  keywords: string[];
  location: string | null;
  jobType: string[];
  workMode: string[];
  salaryMin: number | null;
  frequency: "immediately" | "daily" | "weekly";
  isActive: boolean;
  createdAt: Timestamp;
}
