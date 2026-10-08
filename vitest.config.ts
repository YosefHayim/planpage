import { defineConfig } from "vitest/config";

// esbuild handles the Preact JSX transform for our .tsx snapshot tests.
// biome-ignore lint/style/noDefaultExport: vitest requires a default-exported config
export default defineConfig({
  esbuild: { jsx: "automatic", jsxImportSource: "preact" },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["src/**/*.browser.test.{ts,tsx}"],
  },
});
