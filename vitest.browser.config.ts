import { defineConfig } from "vitest/config";

// biome-ignore lint/style/noDefaultExport: vitest requires a default-exported config
export default defineConfig({
  esbuild: { jsx: "automatic", jsxImportSource: "preact" },
  test: {
    environment: "node",
    include: ["src/**/*.browser.test.{ts,tsx}"],
    testTimeout: 15000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
