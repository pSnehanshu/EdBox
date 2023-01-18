import type { Month } from "@prisma/client";
import type { UnserializedUser, User } from "./types";

export const NumberMonthMapping: Record<number, Month> = {
  0: "jan",
  1: "feb",
  2: "mar",
  3: "apr",
  4: "may",
  5: "jun",
  6: "jul",
  7: "aug",
  8: "sep",
  9: "oct",
  10: "nov",
  11: "dec",
};

/**
 * Given a user, get the role
 * @param user The user in question
 * @returns The role
 */
export function getUserRole(user: UnserializedUser | User) {
  // Principal and vice principal have highest priority
  if (
    user.Staff &&
    (user.Staff.role === "principal" || user.Staff.role === "vice_principal")
  ) {
    return user.Staff.role;
  }

  // Teacher has 2nd highest priority
  if (user.Teacher) {
    return "teacher";
  }

  // Student has 3rd highest priority
  if (user.Student) {
    return "student";
  }

  // Non-principal staff has 4th highest priority
  if (user.Staff) {
    return "staff";
  }

  // Parents has the 5th highest priority
  if (user.Parent) {
    return "parent";
  }

  // This user has no role
  return "none";
}
