import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const SelectedSchoolIdAtom = atomWithStorage<string | null>(
  "schoolId",
  null,
);
