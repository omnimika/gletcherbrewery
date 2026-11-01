import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Preserve the project's existing AGENTS.md during local development.
  agentRules: false,
  // Allow LAN preview (e.g. http://10.10.10.189:3000) without blocking assets.
  allowedDevOrigins: ["10.10.10.189"],
  images: {
    // Local catalog PNGs + SVG placeholders under /public
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.tildacdn.com",
      },
    ],
  },
  turbopack: {
    rules: {
      // Only global entry goes through Tailwind; CSS modules stay as modules.
      "**/src/app/globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
