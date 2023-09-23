/**
 * This file is the global config file. Import this to access the values.
 * This will throw error if it is unable to gather all the required configs.
 */
import { useAtom, useAtomValue } from "jotai";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SELECTED_SCHOOL_ID } from "./async-storage-keys";
import {
  GenerateConfigAtom,
  GenerateDefaultRoleSelector,
} from "schooltalk-shared/client-config";
import { useCurrentUser } from "./auth";

const preloadedSchoolId = Constants.expoConfig?.extra?.schoolId as
  | string
  | undefined;

/** Was the app pre-configured for a school using environment variables? */
export const hasPreloadedSchool = !!preloadedSchoolId;

/** Atom to modify the value */
const ConfigAtom = GenerateConfigAtom({
  backendURL: Constants.expoConfig?.extra?.backendHost,
  preloadedSchoolId,
  getStoredSchoolId: () => AsyncStorage.getItem(SELECTED_SCHOOL_ID),
  setStoredSchoolId: (schoolId) =>
    AsyncStorage.setItem(SELECTED_SCHOOL_ID, schoolId),
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
