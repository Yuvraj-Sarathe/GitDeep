import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  ...next,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
    },
    ignores: [
      "*.md",
      "docs/**",
      ".github/**",
      "CHANGELOG.md",
      "LICENSE",
      "CODE_OF_CONDUCT.md",
      "CONTRIBUTING.md",
      "public/**",
      "version/**",
      "*.config.*",
      "*.lock",
      "package.json",
      "tsconfig.json",
      "next.config.ts",
      "postcss.config.mjs",
      "eslint.config.mjs",
      "vitest.setup.ts",
      "vitest.config.ts",
    ],
  },
]);
