/**
 * This scripts configures the project for a particular school before build process.
 */
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { ExpoConfig } from "expo/config";
import fs from "fs/promises";
import path from "path";
import { expoConfigSchema } from "../utils/expo-config-schema";
import type { AppRouter } from "../../backend/trpc";

const CONFIG_FILE_PATH = path.join(__dirname, "..", "app.json");

if (!process.env.HOSTNAME) {
  throw new Error("HOSTNAME is not defined");
}

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.HOSTNAME}/trpc`,
    }),
  ],
});

const promise = fetchAppConfig().then((config) =>
  process.env.SCHOOLID
    ? setupPreconfiguredApp(config, process.env.SCHOOLID)
    : setupCommonApp(config),
);

promise.then(writeConfig).then(() => {
  console.log("App configuration complete!");
});

async function fetchAppConfig(): Promise<ExpoConfig> {
  const configBuffer = await fs.readFile(CONFIG_FILE_PATH);

  // Validate the config
  return expoConfigSchema.parse(JSON.parse(configBuffer.toString()));
}

async function writeConfig(config: ExpoConfig) {
  await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
}

async function setupPreconfiguredApp(
  config: ExpoConfig,
  schoolId: string,
): Promise<ExpoConfig> {
  const school = await trpc.school.schoolBasicInfo.query({ schoolId });

  config.name = school.name;
  config.scheme = school.app_scheme ?? config.scheme;
  config.splash = {
    ...config.splash,
    image: school.app_splash ?? config.splash?.image,
  };
  config.ios = {
    ...config.ios,
    bundleIdentifier:
      school.app_ios_bundle_identifier ?? config.ios?.bundleIdentifier,
  };
  config.android = {
    ...config.android,
    package: school.app_android_package_name ?? config.android?.package,
    adaptiveIcon: {
      ...config.android?.adaptiveIcon,
      foregroundImage:
        school.app_android_adaptive_icon ??
        config.android?.adaptiveIcon?.foregroundImage,
      backgroundColor:
        school.app_android_adaptive_bgcolor ??
        config.android?.adaptiveIcon?.backgroundColor,
    },
  };

  // TODO: Write google-services.json
  // school.app_google_services_json

  return config;
}

async function setupCommonApp(config: ExpoConfig): Promise<ExpoConfig> {
  return config;
}
