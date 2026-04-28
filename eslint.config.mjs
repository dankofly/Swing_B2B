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
    // Generated build artifacts (Netlify adapter, deno vendor copies).
    // These are produced by `next build` and have nothing to do with our source.
    ".netlify/**",
    // Generated TypeScript types from Supabase / scripts output etc.
    "**/*.generated.ts",
    // Tooling/scripts not part of the runtime app
    "scripts/**",
    // Vendored binaries shipped to the browser as static assets
    "public/**",
  ]),
  // Allow the conventional "_unused" prefix for intentionally discarded
  // destructure / arg names (e.g. `const { id: _id, ...rest } = row`).
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);

export default eslintConfig;
