/**
 * This file is the global config file. Import this to access the values.
 * This will throw error if it is unable to gather all the required configs.
 */
import { atom, useAtom } from "jotai";
import { z } from "zod";
import Constants from "expo-constants";

/** The schema */
const ConfigSchema = z.object({
  backendHost: z.string().url(),
  schoolId: z.string().cuid(),
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
  (get) => get(_configValueAtom),
  (get, set, update: Partial<Config>) => {
    const existingConfig = get(_configValueAtom);
    const updatedConfig = {
      ...existingConfig,
      ...update,
    };

    console.log("Config updated", updatedConfig);

    set(_configValueAtom, updatedConfig);
  },
);

/** This hook wraps the ConfigAtom */
export function useConfig() {
  return useAtom(ConfigAtom);
}
