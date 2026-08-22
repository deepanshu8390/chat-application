import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    noDiscovery: true,
    exclude: [
      "axios",
      "react",
      "react-dom",
      "react-router-dom",
      "react-hot-toast",
      "react-hook-form",
      "socket.io-client",
    ],
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
