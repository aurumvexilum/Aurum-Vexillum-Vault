import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Aurum-Vexillum-Vault/",
  server: { port: 3000, host: "0.0.0.0" },
  preview: { port: 4173, host: "0.0.0.0" },
});
