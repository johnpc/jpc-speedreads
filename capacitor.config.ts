import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.johncorser.speedreads",
  appName: "jpc.speedreads",
  webDir: "dist",
  bundledWebRuntime: false,
  ios: {
    contentInset: "always",
    backgroundColor: "#2ecc71",
  },
};

export default config;
