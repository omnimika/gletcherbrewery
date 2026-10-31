import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preserve the project's existing AGENTS.md during local development.
  agentRules: false,
  images: {
    // Local catalog PNGs + SVG placeholders under /public
    formats: ["image/avif", "image/webp"],
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

export default nextConfig;
