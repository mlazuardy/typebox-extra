import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  dts: true,
  outDir: "dist",
  clean: !options.watch,
  format: ["cjs", "esm"],
  treeshake: true,
  cjsInterop: true,
  splitting: false,
  sourcemap: options.watch === true,
}));
