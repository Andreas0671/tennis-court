import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import storybook from "eslint-plugin-storybook";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "storybook-static", "coverage"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      { ...reactRefresh.configs.vite, rules: { "react-refresh/only-export-components": ["warn", { allowConstantExport: true }] } },
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  ...storybook.configs["flat/recommended"],
]);
