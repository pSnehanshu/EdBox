import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { School } from "schooltalk-shared/types";
import { trpc } from "../utils/trpc";
import { SCHOOL } from "./async-storage-keys";
import { useConfig } from "./config";

/**
 * Cache school object to avoid fetching from AsyncStorage over and over
 */
let globalSchool: School | undefined = undefined;

/**
 * Fetch the current school object.
 */
export function useSchool(): School | undefined {
  const [config] = useConfig();
  const schoolQuery = trpc.school.schoolBasicInfo.useQuery({
    schoolId: config.schoolId,
  });
  const [school, setSchool] = useState<School | undefined>(globalSchool);

  // Fetch locally
  useEffect(() => {
    (async () => {
      if (globalSchool && globalSchool?.id === config.schoolId) {
        // The object is cached, so no need to refetch it
        return;
      }
      globalSchool = undefined;

      const _school = await AsyncStorage.getItem(SCHOOL);
      if (!_school) return;

      const school = JSON.parse(_school);

      // The school obj stored is of a different school, remove it instead
      if (school?.id !== config.schoolId) {
        await AsyncStorage.removeItem(SCHOOL);
        return;
      }

      setSchool(school);

      // Cache the value
      globalSchool = school;
    })();
  }, [config.schoolId]);

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
  }, [schoolQuery.isFetching]);

  return school;
}
