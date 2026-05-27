import type { UUID, Timestamp } from "./common";

export interface Resume {
  id: UUID;
  seekerId: UUID;
  title: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  isDefault: boolean;
  parsedData: ParsedResumeData | null;
  aiScore: number | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ParsedResumeData {
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  summary: string | null;
  totalExperienceYears: number;
}

export interface WorkExperience {
  company: string;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  skills: string[];
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  gpa: number | null;
}

export interface Certification {
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate: string | null;
  credentialId: string | null;
}

export interface Language {
  language: string;
  proficiency: "basic" | "conversational" | "professional" | "native";
}
