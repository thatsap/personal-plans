import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kai.personallab",
  appName: "ap lab",
  webDir: "dist",
  android: {
    allowMixedContent: true,
  },
  plugins: {
    Camera: {
      presentationStyle: "fullscreen",
    },
  },
};

export default config;
