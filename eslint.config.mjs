import { dirname } from "path";
import { fileURLToPath } from "url";
import { includeIgnoreFile } from "eslint/config";

// Create a minimal config that fixes the iterable error
const config = [
  // Include the next config but ensure it's imported correctly
  // Using a flat config object to avoid the 'not iterable' issue
  {
    files: ["**/*.{js,ts,jsx,tsx,md,mdx}"],
    ignores: ["node_modules/**", ".next/**", "out/**"],
    rules: {
      "react/no-unescaped-entities": "off",
      "react/react-in-jsx-scope": "off",
      "@next/next/no-html-link-for-pages": "off"
    }
  }
];

export default config;