export * from "./enums";
export * from "./resume";

// Stripe Business Logic Types
export interface CreatePortalSessionResult {
  success: boolean;
  data?: {
    url: string;
  };
  error?: {
    message: string;
    status: number;
  };
}
