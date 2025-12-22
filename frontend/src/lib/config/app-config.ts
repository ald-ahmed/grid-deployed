// Frontend-specific configuration
// Import shared configuration
import { URLS, ENV, BACKEND_URL, FRONTEND_URL } from "@/shared/config";

// Re-export shared configuration for frontend use
export { URLS, ENV, BACKEND_URL, FRONTEND_URL };

// Frontend-specific exports (if any additional frontend-specific config is needed)
export const FRONTEND_CONFIG = {
  // Add any frontend-specific configuration here
} as const;
