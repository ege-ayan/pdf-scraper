export enum EmploymentType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  INTERNSHIP = "INTERNSHIP",
  CONTRACT = "CONTRACT",
}

export enum LocationType {
  ONSITE = "ONSITE",
  REMOTE = "REMOTE",
  HYBRID = "HYBRID",
}

export enum Degree {
  HIGH_SCHOOL = "HIGH_SCHOOL",
  ASSOCIATE = "ASSOCIATE",
  BACHELOR = "BACHELOR",
  MASTER = "MASTER",
  DOCTORATE = "DOCTORATE",
}

export enum LanguageLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
  NATIVE = "NATIVE",
}

export enum ProcessingStep {
  IDLE = "idle",
  CONVERTING = "converting",
  UPLOADING = "uploading",
  READY = "ready",
  SCRAPING = "scraping",
  COMPLETE = "complete",
}

export enum PlanType {
  FREE = "FREE",
  BASIC = "BASIC",
  PRO = "PRO",
}

export enum ErrorType {
  INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS",
}

export enum StripeWebhookEventType {
  INVOICE_PAID = "invoice.paid",
  CUSTOMER_SUBSCRIPTION_UPDATED = "customer.subscription.updated",
  CUSTOMER_SUBSCRIPTION_DELETED = "customer.subscription.deleted",
}
