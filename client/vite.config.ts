import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Resolved from import.meta.url (works on every supported Node) rather than
// import.meta.dirname, which only exists on Node 20.11+.
const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative asset paths so the build works regardless of where it's served.
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
      // The API contract types live with the server (their source of truth);
      // the client imports them directly so there's a single definition.
      "@shared": path.resolve(rootDir, "../server/src/types.ts"),
    },
  },
  server: {
    proxy: {
      // All API calls go to the Express server; validation never runs in the browser.
      "/api": "http://localhost:3001",
    },
  },
});
