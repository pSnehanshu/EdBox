import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "SchoolTalk",
  slug: "SchoolTalk",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/967f9a25-6a24-476d-8d3c-1dc7db20ec80",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.indorhino.software.schooltalk.sample",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.indorhino.software.schooltalk.sample",
  },
  web: {
    favicon: "./assets/images/favicon.png",
  },
  extra: {
    eas: {
      projectId: "967f9a25-6a24-476d-8d3c-1dc7db20ec80",
    },
    backendHost: process.env.HOSTNAME,
    schoolId: process.env.SCHOOLID,
  },
  runtimeVersion: {
    policy: "nativeVersion",
  },
});
