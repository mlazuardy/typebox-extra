import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.ts", "tests/**/*.{test,spec}.ts"],
    setupFiles: "./src/tests/setup.ts",
  },
});
