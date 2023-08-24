import { parseISO } from "date-fns";
import { useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { z } from "zod";
import {
  GenerateConfigAtom,
  GenerateDefaultRoleSelector,
} from "schooltalk-shared/client-config";
import { GenerateCurrentUserHook } from "schooltalk-shared/current-user";
import { StaticRole } from "schooltalk-shared/misc";
import { trpc } from "./trpc";
import { env } from "./env";

export const useCurrentUser = GenerateCurrentUserHook({
  trpc,
  getAuthToken: async () => localStorage.getItem("token"),
  setStoredUser: async (user) =>
    localStorage.setItem("user", JSON.stringify(user)),
  getStoredUser: async () => localStorage.getItem("user"),
  removeStoredUser: async () => localStorage.removeItem("user"),
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

export const ConfigAtom = GenerateConfigAtom({
  backendURL: env.VITE_BACKEND_URL,
  preloadedSchoolId: localStorage.getItem("schoolId") ?? undefined,
  getStoredSchoolId: () => localStorage.getItem("schoolId"),
  setStoredSchoolId: (schoolId) => localStorage.setItem("schoolId", schoolId),
  getSelectedRole() {
    const role = parseInt(localStorage.getItem("role") ?? "0", 10);
    if (role in StaticRole) return role;
    return StaticRole.none;
  },
  setSelectedRole: (role) => localStorage.setItem("role", role.toString()),
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

/**
 * This hook will automatically select a default role if none is selected
 */
export const useSelectDefaultRole = GenerateDefaultRoleSelector({
  ConfigAtom,
  useCurrentUser,
});
