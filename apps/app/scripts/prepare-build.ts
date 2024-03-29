/**
 * This scripts configures the project for a particular school before build process.
 */
import axios from "axios";
import type { ExpoConfig } from "expo/config";
import fs from "fs/promises";
import path from "path";
import { expoJsonSchema } from "../utils/expo-config-schema";
import type { inferRouterOutputs, inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "../../backend/trpc";

type INPUT = inferRouterInputs<AppRouter>["school"]["schoolBasicInfo"];
type OUTPUT = {
  result: {
    data: inferRouterOutputs<AppRouter>["school"]["schoolBasicInfo"];
  };
};

const CONFIG_FILE_PATH = path.join(__dirname, "..", "app.json");
const GOOGLE_SERVICES_JSON_PATH = path.join(
  __dirname,
  "..",
  "google-services.json",
);

if (!process.env.HOSTNAME) {
  throw new Error("HOSTNAME is not defined");
}

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
  return expoJsonSchema.parse(JSON.parse(configBuffer.toString())).expo;
}

async function writeConfig(config: ExpoConfig) {
  const finalConfig = JSON.stringify({ expo: config }, null, 2);
  console.log("Modified config:", finalConfig);
  await fs.writeFile(CONFIG_FILE_PATH, finalConfig);
}

async function setupPreconfiguredApp(
  config: ExpoConfig,
  schoolId: string,
): Promise<ExpoConfig> {
  const input: INPUT = { schoolId };

  const {
    data: {
      result: { data: school },
    },
  } = await axios.get<OUTPUT>(
    `${process.env.HOSTNAME}/trpc/school.schoolBasicInfo`,
    {
      params: {
        input: JSON.stringify(input),
      },
    },
  );

  config.name = school.name;
  config.scheme = school.app_scheme ?? config.scheme;
  config.icon = `${process.env.HOSTNAME}/school-info/${school.id}/icon`;
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
  };

  // Write google-services.json
  if (school.app_google_services_json) {
    await writeGoogleServicesJsonFile(school.app_google_services_json);
  }

  return config;
}

async function setupCommonApp(config: ExpoConfig): Promise<ExpoConfig> {
  return config;
}

async function writeGoogleServicesJsonFile(google_services_json: string) {
  await fs.writeFile(GOOGLE_SERVICES_JSON_PATH, google_services_json);
  console.log(`google-services.json updated!`, google_services_json);
}
