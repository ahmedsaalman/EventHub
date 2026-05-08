import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DJANGO_BACKEND_URL =
  (process.env.NEXT_PUBLIC_API_PROXY_TARGET || "http://127.0.0.1:8000").replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  outputFileTracingRoot: __dirname,
  async rewrites() {
    return [
      {
        source: "/ticketpage",
        destination: "/Ticketpage",
      },
      {
        source: "/e",
        destination: "/Ticketpage",
      },
      {
        source: "/api/:path*",
        destination: `${DJANGO_BACKEND_URL}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
