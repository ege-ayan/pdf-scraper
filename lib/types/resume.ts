import { EmploymentType, LocationType, Degree, LanguageLevel } from "./enums";

export interface ResumeData {
  profile: {
    name: string;
    surname: string;
    email: string;
    headline: string;
    professionalSummary: string;
    linkedIn: string | null;
    website: string | null;
    country: string;
    city: string;
    relocation: boolean;
    remote: boolean;
  };
  workExperiences: Array<{
    jobTitle: string;
    employmentType: EmploymentType;
    locationType: LocationType;
    company: string;
    startMonth: number | null;
    startYear: number | null;
    endMonth: number | null;
    endYear: number | null;
    current: boolean;
    description: string;
  }>;
  educations: Array<{
    school: string;
    degree: Degree;
    major: string | null;
    startYear: number;
    endYear: number | null;
    current: boolean;
    description: string | null;
  }>;
  skills: string[];
  licenses: Array<{
    name: string;
    issuer: string;
    issueYear: number;
    description: string | null;
  }>;
  languages: Array<{
    language: string;
    level: LanguageLevel;
  }>;
  achievements: Array<{
    title: string;
    organization: string;
    achieveDate: string;
    description: string;
  }>;
  publications: Array<{
    title: string;
    publisher: string;
    publicationDate: string;
    publicationUrl: string;
    description: string;
  }>;
  honors: Array<{
    title: string;
    issuer: string;
    issueMonth: number;
    issueYear: number;
    description: string;
  }>;
}

export interface ResumeHistoryEntry {
  id: string;
  fileName: string;
  uploadedAt: string;
  resumeData: ResumeData;
}

export interface UploadedImage {
  url: string;
  path: string;
}
