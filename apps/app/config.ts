/**
 * This file is the global config file. Import this to access the values.
 * This will throw error if it is unable to gather all the required configs.
 */

import { z } from "zod";
import Constants from "expo-constants";

const ConfigSchema = z.object({
  backendHost: z.string().url(),
  schoolId: z.string().cuid(),
  previewMessageLength: z.number().int().default(200),
});

const config = ConfigSchema.parse({
  backendHost: Constants.expoConfig?.extra?.backendHost,
  schoolId: Constants.expoConfig?.extra?.schoolId,
});

console.log("Final config:", config);

export default config;
