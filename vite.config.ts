import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/fichas-de-ameaca-t20/",
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    cors: true,
    headers: {
      "Cache-Control": "no-store",
    },
  },
  test: {
    environment: "jsdom",
  },
});
