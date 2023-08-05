import { parseISO, isPast } from "date-fns";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { z } from "zod";
import type { User } from "schooltalk-shared/types";
import { trpcVanillaClient } from "./trpc";

export const SelectedSchoolIdAtom = atomWithStorage<string | null>(
  "schoolId",
  null,
);

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
