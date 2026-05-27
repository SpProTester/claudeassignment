import type { WorkMode, JobType, ExperienceLevel } from "./job";

export interface JobSearchParams {
  query?: string;
  location?: string;
  country?: string;
  jobType?: JobType[];
  workMode?: WorkMode[];
  experienceLevel?: ExperienceLevel[];
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  companyIds?: string[];
  categoryIds?: string[];
  postedWithinDays?: number;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "relevance" | "date" | "salary" | "applications";
  sortOrder?: "asc" | "desc";
}

export interface CompanySearchParams {
  query?: string;
  industry?: string;
  location?: string;
  companySize?: string[];
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchSuggestion {
  type: "job_title" | "skill" | "company" | "location";
  value: string;
  count: number;
}
