import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      ".firebase/**",
      "functions/**",
      "**/node_modules/**",
      "**/*.min.js",
      "public/assets/js/jquery*.js",
      "public/assets/js/main-*.js",
      "public/assets/js/copywrite.js"
    ]
  },
  {
    files: ["public/assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-alert": "off",
      "no-console": "off",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  },
  {
    files: ["public/assets/js/admin.js"],
    languageOptions: {
      sourceType: "script"
    }
  },
  {
    files: ["public/assets/js/config.js"],
    languageOptions: {
      sourceType: "script"
    }
  }
];
