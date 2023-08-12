/**
 * This file is the global config file. Import this to access the values.
 * This will throw error if it is unable to gather all the required configs.
 */
import { useAtom, useAtomValue } from "jotai";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SELECTED_SCHOOL_ID } from "./async-storage-keys";
import {
  StaticRole,
  getUserRoleHierarchical,
  getUserStaticRoles,
} from "schooltalk-shared/misc";
import { GenerateConfigAtom } from "schooltalk-shared/client-config";
import { useEffect } from "react";
import { useCurrentUser } from "./auth";

const preloadedSchoolId = Constants.expoConfig?.extra?.schoolId as
  | string
  | undefined;

/** Was the app pre-configured for a school using environment variables? */
export const hasPreloadedSchool = !!preloadedSchoolId;

/** Atom to modify the value */
const ConfigAtom = GenerateConfigAtom({
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
export function useSelectDefaultRole() {
  const config = useConfig();
  const setConfig = useConfigUpdate();
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
}
