// eslint.config.js — linter rules for the app (web/) and its tests (tests/).
// Plan step: 1.0.f (CI). Source: ESLint flat config, @eslint/js "recommended".
// web/ runs in the browser; tests/ run in Node with node:test.

import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["web/**/*.js"],
    languageOptions: { sourceType: "module", globals: globals.browser },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: { sourceType: "module", globals: globals.node },
  },
];
