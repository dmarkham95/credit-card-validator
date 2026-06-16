import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // The API contract types live with the server (their source of truth);
      // the client imports them directly so there's a single definition.
      "@shared": path.resolve(import.meta.dirname, "../server/src/types.ts"),
    },
  },
  server: {
    proxy: {
      // All API calls go to the Express server; validation never runs in the browser.
      "/api": "http://localhost:3001",
    },
  },
});
