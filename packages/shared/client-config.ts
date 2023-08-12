import { z } from "zod";
import { atom } from "jotai";
import { StaticRole } from "./misc";

/** The schema */
const ConfigSchema = z.object({
  backendHost: z.string().url(),
  schoolId: z.union([z.string().cuid(), z.literal("")]),
  previewMessageLength: z.number().int().default(200),
  activeStaticRole: z.nativeEnum(StaticRole).default(StaticRole.none),
});

type Config = z.infer<typeof ConfigSchema>;

type ConfigOptions = {
  backendURL: string;
  preloadedSchoolId?: string;
  getStoredSchoolId: () => Promise<string | null>;
  setStoredSchoolId: (schoolId: string) => Promise<void>;
};

export function GenerateConfigAtom({
  backendURL,
  preloadedSchoolId,
  getStoredSchoolId,
  setStoredSchoolId,
}: ConfigOptions) {
  /** The preloaded values */
  const preloadedConfig = ConfigSchema.parse({
    backendHost: backendURL,
    schoolId: preloadedSchoolId ?? "",
  });

  console.log(`Pre-loaded config: ${JSON.stringify(preloadedConfig, null, 2)}`);

  /** Atom to store just the values */
  const _configValueAtom = atom<Config>(preloadedConfig);

  /** Atom to modify the value */
  const ConfigAtom = atom(
    async (get) => {
      const existingConfig = get(_configValueAtom);
      if (existingConfig.schoolId) return existingConfig;

      // Fetch existing selected school id
      const selectedSchoolId = await getStoredSchoolId().catch((err) => {
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
        await setStoredSchoolId(updatedConfig.schoolId).catch((err) => {
          // We want to ignore this failure
          console.error(err);
        });
      }

      console.log("Config updated", updatedConfig);

      set(_configValueAtom, updatedConfig);
    },
  );

  return ConfigAtom;
}
