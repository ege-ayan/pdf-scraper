import { EmploymentType, LocationType, Degree, LanguageLevel } from "@/types";

export const CREDITS_PER_SCRAPE = 100;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const STRIPE_PRICES = {
  BASIC: process.env.STRIPE_PRICE_BASIC!,
  PRO: process.env.STRIPE_PRICE_PRO!,
} as const;

export const PLAN_CREDITS = {
  BASIC: 10000,
  PRO: 20000,
} as const;

export const BASE_URL = process.env.NEXTAUTH_URL!;
export const SETTINGS_URL = `${BASE_URL}/dashboard/settings`;
export const CHECKOUT_SUCCESS_URL = `${SETTINGS_URL}?success=true`;
export const CHECKOUT_CANCEL_URL = `${SETTINGS_URL}?canceled=true`;

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
