// Shared configuration for all services
// This file centralizes all URL and port configurations

// Environment detection
const isCodespaces = process.env["CODESPACE_NAME"];
const githubToken = process.env["NEXT_PUBLIC_GITHUB_TOKEN"];

// Port configuration - single source of truth
export const PORTS = {
  FRONTEND: 3000,
  BACKEND: 4000,
  DATABASE: 5432,
};

// Host configuration with Codespaces support
export const HOSTS = {
  FRONTEND: isCodespaces
    ? `${isCodespaces}-${PORTS.FRONTEND}.app.github.dev`
    : `localhost:${PORTS.FRONTEND}`,
  BACKEND: isCodespaces
    ? `${isCodespaces}-${PORTS.BACKEND}.app.github.dev`
    : `localhost:${PORTS.BACKEND}`,
  DATABASE: "localhost",
};

// Protocol configuration (HTTPS for Codespaces, HTTP for local)
const PROTOCOL = isCodespaces ? "https" : "http";

// URL configuration - centralized URLs for all services
export const URLS = {
  FRONTEND: process.env.FRONTEND_URL || `${PROTOCOL}://${HOSTS.FRONTEND}`,
  BACKEND: process.env.BACKEND_URL || `${PROTOCOL}://${HOSTS.BACKEND}`,
  BACKEND_GRAPHQL:
    process.env.BACKEND_GRAPHQL_URL || `${PROTOCOL}://${HOSTS.BACKEND}/graphql`,
  DATABASE:
    process.env.DATABASE_URL ||
    `postgresql://postgres:postgres@${HOSTS.DATABASE}:${PORTS.DATABASE}/`,
};

// Environment helpers
export const ENV = {
  IS_CODESPACES: Boolean(isCodespaces),
  CODESPACE_NAME: isCodespaces || "",
  GITHUB_TOKEN: githubToken || "",
  NODE_ENV: process.env.NODE_ENV || "development",
};

// Export commonly used values for convenience
export const BACKEND_URL = URLS.BACKEND_GRAPHQL;
export const FRONTEND_URL = URLS.FRONTEND;
export const DATABASE_URL = URLS.DATABASE;

// Export for backward compatibility
export { PORTS as BACKEND_PORT };
