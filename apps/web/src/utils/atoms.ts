import { parseISO, isPast } from "date-fns";
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { z } from "zod";
import type { User } from "schooltalk-shared/types";
import { GenerateConfigAtom } from "schooltalk-shared/client-config";
import { trpcVanillaClient } from "./trpc";
import { env } from "./env";

// export const SelectedSchoolIdAtom = atomWithStorage<string | null>(
//   "schoolId",
//   null,
// );

export const SessionTokenAtom = atomWithStorage("token", "");

let userInMemory: User | null = null;

export const IsLoggedInAtom = atom<Promise<boolean>>(async (get) => {
  const expiry = get(SessionExpiryAtom);
  if (isPast(expiry)) return false;

  if (userInMemory) return true; // TODO: Implement expiry logic

  // Check from API
  try {
    userInMemory = await trpcVanillaClient.profile.me.query();
    return true;
  } catch (error) {
    console.error(error);
  }

  return false;
});

const expiryAtomSchema = z
  .string()
  .datetime()
  .transform((d) => parseISO(d));

export const SessionExpiryAtom = atomWithStorage<Date>(
  "token-expiry",
  new Date(0), // Unix epoch
  {
    getItem(key, initialValue) {
      const storedValue = localStorage.getItem(key);
      const validation = expiryAtomSchema.safeParse(storedValue);
      if (!validation.success) return initialValue;
      return validation.data;
    },
    setItem(key, value) {
      localStorage.setItem(key, value.toISOString());
    },
    removeItem(key) {
      localStorage.removeItem(key);
    },
  },
);

// export const CurrentRoleAtom = atomWithStorage<StaticRole>(
//   "role",
//   StaticRole.none,
// );
export const CurrentUserIdAtom = atomWithStorage<string | null>("userId", null);

export const ConfigAtom = GenerateConfigAtom({
  backendURL: env.VITE_BACKEND_URL,
  preloadedSchoolId: localStorage.getItem("schoolId") ?? undefined,
  getStoredSchoolId: async () => localStorage.getItem("schoolId"),
  setStoredSchoolId: async (schoolId) =>
    localStorage.setItem("schoolId", schoolId),
});

/** Get the current config */
export function useConfig() {
  return useAtomValue(ConfigAtom);
}

/** Returns a setter for config */
export function useConfigUpdate() {
  const [, setConfig] = useAtom(ConfigAtom);

  return setConfig;
}