const DEFAULT_API_BASE_URL = ""; // Empty base lets Next.js rewrites proxy to Django backend

const envBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/+$/, "");
const isLocalBackendUrl =
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(envBaseUrl);

// In local/dev, force relative URLs so browser never talks HTTPS directly to Django dev server.
const shouldUseRelativeProxy = !envBaseUrl || (isLocalBackendUrl && process.env.NODE_ENV !== "production");

export const API_BASE_URL = shouldUseRelativeProxy ? DEFAULT_API_BASE_URL : envBaseUrl;

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
