import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    languageOptions: {
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
      globals: { fetch: "readonly", URL: "readonly", console: "readonly", process: "readonly" }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn"
    }
  },
  {
    files: ["**/*.tsx"],
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    languageOptions: {
      parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
      globals: { fetch: "readonly", URL: "readonly", console: "readonly", process: "readonly" }
    },
    plugins: { react, "react-hooks": reactHooks },
    settings: { react: { version: "18" } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "react/react-in-jsx-scope": "off"
    }
  }
);
