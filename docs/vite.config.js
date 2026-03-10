import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    // Output to docs/ root so GitHub Pages can serve the built index.html directly.
    // emptyOutDir: false prevents Vite from deleting source files in this directory.
    // vite-plugin-singlefile produces only index.html, so no other files are overwritten.
    outDir: ".",
    emptyOutDir: false,
    cssCodeSplit: false,
  },
});
