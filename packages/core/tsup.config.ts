import { defineConfig } from "tsup";

export default defineConfig((options) => [
  {
    entry: ["src/index.ts"],
    dts: true,
    outDir: "dist",
    clean: true,
    format: ["cjs", "esm"],
    treeshake: true,
    cjsInterop: true,
    splitting: false,
  },
  {
    entry: {
      "locales/en": "src/locales/en.json",
      "locales/id": "src/locales/id.json",
    },
    outDir: "dist",
    format: ["esm"],
    clean: true, // Prevent removing previously built files
    loader: {
      ".json": "copy", // Ensures JSON files are copied as is
    },
  },
]);
