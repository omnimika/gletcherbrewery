import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preserve the project's existing AGENTS.md during local development.
  agentRules: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
