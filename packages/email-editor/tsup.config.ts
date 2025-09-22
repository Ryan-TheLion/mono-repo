import { defineConfig } from "tsup";

type Mode = "development" | "production";

export default defineConfig((options) => {
  const MODE = ["development", "production"] satisfies Mode[];

  const mode: Mode = MODE.includes(options.env?.NODE_ENV as Mode)
    ? (options.env!.NODE_ENV as Mode)
    : "development";

  return {
    entry: ["src/index.ts"],
    watch: options.watch,
    minify: mode === "production",
    clean: true,
    dts: true,
    treeshake: true,
    format: ["cjs", "esm"],
    external: ["react", "react-dom"],
  };
});
