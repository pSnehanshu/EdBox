import { parseISO } from "date-fns";
import { atomWithStorage } from "jotai/utils";
import { z } from "zod";

export const SelectedSchoolIdAtom = atomWithStorage<string | null>(
  "schoolId",
  null,
);

export const SessionTokenAtom = atomWithStorage("token", "");

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
