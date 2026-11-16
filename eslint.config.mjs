import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local scratch / browser scrape profiles (not app source; do not delete).
    "tmp/**",
    ".tmp/**",
    // Local design/agent skills (gitignored; AGENTS.md §6) — not app source.
    ".agents/**",
    ".claude/**",
    ".cursor/skills/**",
    ".cursor/agents/**",
    ".codex/**",
    "skills-lock.json",
  ]),
]);

export default eslintConfig;
