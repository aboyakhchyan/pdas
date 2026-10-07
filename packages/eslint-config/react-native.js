import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { base } from "./base.js";

export const reactNative = defineConfig([
  base,
  reactHooks.configs.flat.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
  {
    files: ["**/*.config.js"],
    languageOptions: { sourceType: "commonjs" },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  globalIgnores(["android/**", "ios/**", "vendor/**"]),
]);
