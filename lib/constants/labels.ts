import { EmploymentType, LocationType, Degree, LanguageLevel } from "../types/enums";

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  [EmploymentType.FULL_TIME]: "Full Time",
  [EmploymentType.PART_TIME]: "Part Time",
  [EmploymentType.INTERNSHIP]: "Internship",
  [EmploymentType.CONTRACT]: "Contract",
};

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  [LocationType.ONSITE]: "On-site",
  [LocationType.REMOTE]: "Remote",
  [LocationType.HYBRID]: "Hybrid",
};

export const DEGREE_LABELS: Record<Degree, string> = {
  [Degree.HIGH_SCHOOL]: "High School",
  [Degree.ASSOCIATE]: "Associate Degree",
  [Degree.BACHELOR]: "Bachelor's Degree",
  [Degree.MASTER]: "Master's Degree",
  [Degree.DOCTORATE]: "Doctorate",
};

export const LANGUAGE_LEVEL_LABELS: Record<LanguageLevel, string> = {
  [LanguageLevel.BEGINNER]: "Beginner",
  [LanguageLevel.INTERMEDIATE]: "Intermediate",
  [LanguageLevel.ADVANCED]: "Advanced",
  [LanguageLevel.NATIVE]: "Native",
};
