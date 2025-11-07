import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://www.akeditz.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Add build configuration
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  // Define environment variables
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
});
