import { createContext, useContext } from "react";
import { trpc } from "../utils/trpc";

export function useFetchSchool() {
  return trpc.school.schoolBasicInfo.useQuery({
    schoolId: "clca5hw6i000008jr4ibyh2cc",
  });
}

export const SchoolContext =
  createContext<ReturnType<typeof useFetchSchool>["data"]>(undefined);
SchoolContext.displayName = "SchoolContext";

/**
 * Get the current school object
 */
export function useSchool() {
  const school = useContext(SchoolContext);
  return school!;
}
