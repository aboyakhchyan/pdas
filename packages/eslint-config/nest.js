import { defineConfig } from "eslint/config";
import globals from "globals";
import { base } from "./base.js";

export const nest = defineConfig([
  base,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
  },
]);
