import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  root: "site",
  base: "./",
  plugins: [viteSingleFile()],
  build: {
    outDir: "../docs",
    emptyOutDir: true,
    target: "es2022",
    cssCodeSplit: false,
    assetsInlineLimit: 1000000000,
  },
});
