import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.aurumvexilum.waxvault",
  appName: "Aurum Vexillum Vault",
  webDir: "dist",
  server: { androidScheme: "https" },
};

export default config;
