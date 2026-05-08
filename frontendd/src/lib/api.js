const DEFAULT_API_BASE_URL = ""; // Empty base lets Next.js rewrites proxy to Django backend

const configuredBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
const envBaseUrl = configuredBaseUrl.trim().replace(/\/+$/, "");
const isLocalBackendUrl =
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(envBaseUrl);
const isBrowser = typeof window !== "undefined";
const isVercelHost = isBrowser && window.location.hostname.endsWith("vercel.app");
const isRenderBackend = /onrender\.com$/i.test(envBaseUrl);

// In local/dev, force relative URLs so browser never talks HTTPS directly to Django dev server.
// In Vercel, prefer relative URLs to use Next.js rewrites and avoid CORS issues.
const shouldUseRelativeProxy =
  !envBaseUrl ||
  (isLocalBackendUrl && process.env.NODE_ENV !== "production") ||
  (isVercelHost && isRenderBackend);

export const API_BASE_URL = shouldUseRelativeProxy ? DEFAULT_API_BASE_URL : envBaseUrl;

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
