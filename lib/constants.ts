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
