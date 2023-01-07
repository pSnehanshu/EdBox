import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { School } from "../../shared/types";
import { trpc } from "../utils/trpc";
import { SCHOOL } from "./async-storage-keys";

/**
 * Fetch the current school object.
 */
export function useSchool(): School | undefined {
  const schoolQuery = trpc.school.schoolBasicInfo.useQuery({
    // TODO: Bring this from environment variables
    schoolId: "clca5hw6i000008jr4ibyh2cc",
  });
  const [school, setSchool] = useState<School>();

  // Fetch locally
  useEffect(() => {
    (async () => {
      const _school = await AsyncStorage.getItem(SCHOOL);
      if (!_school) return;

      const school = JSON.parse(_school);
      setSchool(school);
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
          } else {
            // Some other error
          }
        } else {
          setSchool(schoolQuery.data);
          await AsyncStorage.setItem(SCHOOL, JSON.stringify(schoolQuery.data));
        }
      }
    })();
  }, [schoolQuery.isLoading]);

  return school;
}
