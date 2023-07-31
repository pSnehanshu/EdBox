import { atom } from "jotai";

export const SelectedSchoolIdAtom = atom<string | null>(
  localStorage.getItem("schoolId") ?? null,
);
