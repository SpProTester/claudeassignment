import type { UUID, Timestamp, Status } from "./common";

export type JobType = "full_time" | "part_time" | "contract" | "internship" | "freelance";
export type ExperienceLevel = "entry" | "junior" | "mid" | "senior" | "lead" | "executive";
export type WorkMode = "onsite" | "remote" | "hybrid";

export interface JobListing {
  id: UUID;
  companyId: UUID;
  postedById: UUID;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  responsibilities: string;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  workMode: WorkMode;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  location: string;
  country: string;
  city: string | null;
  skills: string[];
  benefits: string[];
  status: Status;
  isFeatured: boolean;
  applicationDeadline: Timestamp | null;
  viewCount: number;
  applicationCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp | null;
}

export interface JobCategory {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  parentId: UUID | null;
  jobCount: number;
}

export interface JobSkill {
  id: UUID;
  name: string;
  slug: string;
  category: string;
}
