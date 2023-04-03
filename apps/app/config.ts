/**
 * This file is the global config file. Import this to access the values.
 * This will throw error if it is unable to gather all the required configs.
 */
import { atom, useAtom } from "jotai";
import { z } from "zod";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SELECTED_SCHOOL_ID } from "./utils/async-storage-keys";

/** The schema */
const ConfigSchema = z.object({
  backendHost: z.string().url(),
  schoolId: z.union([z.string().cuid(), z.literal("")]),
  previewMessageLength: z.number().int().default(200),
});

type Config = z.infer<typeof ConfigSchema>;

/** The preloaded values */
const preloadedConfig = ConfigSchema.parse({
  backendHost: Constants.expoConfig?.extra?.backendHost,
  schoolId: Constants.expoConfig?.extra?.schoolId ?? "",
});

console.log("Pre-loaded config", preloadedConfig);

/** Atom to store just the values */
const _configValueAtom = atom<Config>(preloadedConfig);

/** Atom to modify the value */
const ConfigAtom = atom(
  async (get) => {
    const existingConfig = get(_configValueAtom);
    if (existingConfig.schoolId) return existingConfig;

    // Fetch existing selected school id
    const selectedSchoolId = await AsyncStorage.getItem(
      SELECTED_SCHOOL_ID,
    ).catch((err) => {
      // We want to ignore this failure
      console.error(err);
      return null;
    });

    if (!selectedSchoolId) return existingConfig;

    existingConfig.schoolId = selectedSchoolId;
    return existingConfig;
  },
  async (get, set, update: Partial<Config>) => {
    const existingConfig = await get(ConfigAtom);
    const updatedConfig = {
      ...existingConfig,
      ...update,
    };

    // Check if school id changed
    if (existingConfig.schoolId !== updatedConfig.schoolId) {
      await AsyncStorage.setItem(
        SELECTED_SCHOOL_ID,
        updatedConfig.schoolId,
      ).catch((err) => {
        // We want to ignore this failure
        console.error(err);
      });
    }

    console.log("Config updated", updatedConfig);

    set(_configValueAtom, updatedConfig);
  },
);

/** This hook wraps the ConfigAtom */
export function useConfig() {
  return useAtom(ConfigAtom);
}
