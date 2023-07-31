import { atom, useAtomValue, useAtom } from "jotai";

const schoolId = localStorage.getItem("schoolId");

export const ConfigSchool = atom<string | null>(schoolId ?? null);

export function useConfig() {
  return useAtomValue(ConfigSchool);
}

export function useConfigUpdate() {
  const [, setConfig] = useAtom(ConfigSchool);
  return setConfig;
}
