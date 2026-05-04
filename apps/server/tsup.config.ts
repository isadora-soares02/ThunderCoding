import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        server: "src/server.ts"
    },
    format: ["esm"],
    target: "node20",
    outDir: "dist",
    clean: true,
    splitting: false,
    sourcemap: false
});