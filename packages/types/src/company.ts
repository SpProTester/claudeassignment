import type { UUID, Timestamp, Status } from "./common";

export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1001-5000" | "5000+";

export interface Company {
  id: UUID;
  ownerId: UUID;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  website: string | null;
  industry: string;
  companySize: CompanySize;
  foundedYear: number | null;
  headquarters: string | null;
  country: string;
  isVerified: boolean;
  status: Status;
  followersCount: number;
  activeJobCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CompanyCulture {
  companyId: UUID;
  values: string[];
  benefits: string[];
  techStack: string[];
  workStyle: string | null;
  diversityStatement: string | null;
}
