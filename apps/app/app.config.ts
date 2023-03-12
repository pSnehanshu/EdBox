import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const expoConfig: ExpoConfig = {
    ...config,
    name: "SchoolTalk",
    slug: "SchoolTalk",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: `edbox+${process.env.SCHOOLID}`,
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      url: new URL(
        "/updates/manifest",
        process.env.HOSTNAME ?? "http://localhost",
      ).href,
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      buildNumber: "1.0.0",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.indorhino.software.schooltalk.sample",
      versionCode: 1,
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    extra: {
      eas: {
        projectId: "967f9a25-6a24-476d-8d3c-1dc7db20ec80",
      },
    },
    runtimeVersion: {
      policy: "nativeVersion",
    },
  };

  return expoConfig;
};
