import { z } from "zod";
import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import {
  StaticRole,
  getUserRoleHierarchical,
  getUserStaticRoles,
} from "./misc";
import type { CurrentUserHookType } from "./current-user";
import { MaybePromise } from "./types";

/** The schema */
const ConfigSchema = z.object({
  backendHost: z.union([z.string().url(), z.string().startsWith("/")]),
  schoolId: z.union([z.string().cuid(), z.literal("")]),
  previewMessageLength: z.number().int().default(200),
  activeStaticRole: z.nativeEnum(StaticRole).default(StaticRole.none),
});

type Config = z.infer<typeof ConfigSchema>;

type ConfigOptions = {
  backendURL: string;
  preloadedSchoolId?: string;
  getStoredSchoolId?: () => MaybePromise<string | null>;
  setStoredSchoolId?: (schoolId: string) => void;
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

      try {
        // Fetch existing selected school id
        const selectedSchoolId = await getStoredSchoolId?.();

        if (!selectedSchoolId) return existingConfig;

        existingConfig.schoolId = selectedSchoolId;
      } catch (error) {
        console.error(error);
      }

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
        try {
          await setStoredSchoolId?.(updatedConfig.schoolId);
        } catch (error) {
          // We want to ignore this failure
          console.error(error);
        }
      }

      console.log("Config updated", updatedConfig);

      set(_configValueAtom, updatedConfig);
    },
  );

  return ConfigAtom;
}

type DefaultRoleSelector = {
  useCurrentUser: CurrentUserHookType;
  ConfigAtom: ReturnType<typeof GenerateConfigAtom>;
};

/**
 * This hook will automatically select a default role if none is selected
 */
export function GenerateDefaultRoleSelector({
  useCurrentUser,
  ConfigAtom: configAtom,
}: DefaultRoleSelector) {
  return () => {
    const [config, setConfig] = useAtom(configAtom);
    const { isLoggedIn, user } = useCurrentUser();

    useEffect(() => {
      if (isLoggedIn) {
        if (
          config.activeStaticRole === StaticRole.none ||
          !getUserStaticRoles(user).includes(config.activeStaticRole) // If current selected role doesn't belong to the user, change it
        ) {
          setConfig({ activeStaticRole: getUserRoleHierarchical(user) });
        }
      } else {
        setConfig({ activeStaticRole: StaticRole.none });
      }
    }, [config.activeStaticRole, user, isLoggedIn]);
  };
}
