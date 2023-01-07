import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { School } from "../../shared/types";
import { trpc } from "../utils/trpc";
import { SCHOOL } from "./async-storage-keys";

/** The school ID for which the app is configured */
export const schoolId = "clca5hw6i000008jr4ibyh2cc"; // TODO: Bring this from environment variables

/**
 * Cache school object to avoid fetching from AsyncStorage over and over
 */
let globalSchool: School | undefined = undefined;

/**
 * Fetch the current school object.
 */
export function useSchool(): School | undefined {
  const schoolQuery = trpc.school.schoolBasicInfo.useQuery({
    schoolId,
  });
  const [school, setSchool] = useState<School | undefined>(globalSchool);

  // Fetch locally
  useEffect(() => {
    (async () => {
      if (globalSchool) {
        // The object is cached, so no need to refetch it
        return;
      }

      const _school = await AsyncStorage.getItem(SCHOOL);
      if (!_school) return;

      const school = JSON.parse(_school);
      setSchool(school);

      // Cache the value
      globalSchool = school;
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!schoolQuery.isLoading) {
        if (schoolQuery.isError) {
          if (schoolQuery.error.data?.code === "NOT_FOUND") {
            // Invalid School
            setSchool(undefined);
            await AsyncStorage.removeItem(SCHOOL);
            globalSchool = undefined;
          } else {
            // Some other error
          }
        } else {
          setSchool(schoolQuery.data);
          await AsyncStorage.setItem(SCHOOL, JSON.stringify(schoolQuery.data));
          globalSchool = schoolQuery.data;
        }
      }
    })();
  }, [schoolQuery.isLoading]);

  return school;
}
