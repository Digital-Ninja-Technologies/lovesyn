/**
 * Utility functions for OAuth redirect URL handling
 * Ensures compatibility with multiple domains (Lovable, Netlify, custom domains)
 */

/**
 * Get the base redirect URL for OAuth callbacks
 * Uses window.location.origin which automatically detects the current domain
 */
export const getOAuthRedirectUrl = (): string => {
  return window.location.origin;
};

/**
 * Get the full auth callback URL
 * This is the URL users are redirected to after OAuth sign-in
 */
export const getAuthCallbackUrl = (): string => {
  return `${getOAuthRedirectUrl()}/`;
};

/**
 * Get the reset password callback URL
 */
export const getResetPasswordUrl = (): string => {
  return `${getOAuthRedirectUrl()}/reset-password`;
};

/**
 * Get the email verification callback URL
 */
export const getEmailVerificationUrl = (): string => {
  return `${getOAuthRedirectUrl()}/`;
};

/**
 * List of URLs that should be whitelisted in Supabase
 * For documentation and setup reference
 */
export const OAUTH_WHITELIST_URLS = {
  development: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
  ],
  production: [
    // Add your production URLs here
    // Example: "https://lovesyn.dev"
    // Example: "https://your-app.netlify.app"
  ],
} as const;

/**
 * Get all redirect URLs for Supabase whitelist setup
 * This is for reference when configuring Supabase
 */
export const getAllRedirectUrls = (): string[] => {
  const isDev = import.meta.env.DEV;
  const urls = isDev ? OAUTH_WHITELIST_URLS.development : OAUTH_WHITELIST_URLS.production;
  
  return Array.from(new Set([
    ...urls,
    window.location.origin,
  ]));
};
