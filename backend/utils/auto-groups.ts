import { User } from "@prisma/client";
import { getSchoolGroupIdentifier, GroupBasicInfo } from "./group-identifier";

/**
 * Get list of all automatic groups a user is part of
 * @param user
 */
export async function getAutoGroups(
  user: Pick<
    User,
    "school_id" | "teacher_id" | "student_id" | "parent_id" | "staff_id"
  >
): Promise<GroupBasicInfo[]> {
  const schoolId = user.school_id;

  // School group
  const schoolGroup: GroupBasicInfo = {
    id: getSchoolGroupIdentifier(schoolId),
    name: "School group",
    gd: "a",
  };

  const isTeacher = !!user.teacher_id;
  const isStudent = !!user.student_id;
  const isParent = !!user.parent_id;
  const isStaff = !!user.staff_id;

  const classGroups: GroupBasicInfo[] = [];
  const sectionGroups: GroupBasicInfo[] = [];
  const subjectGroups: GroupBasicInfo[] = [];

  if (isTeacher) {
    // Fetch classes where they teach
  }
  if (isStudent) {
    // Fetch the class where they study
  }
  if (isParent) {
    // Fetch the class where their children study
  }
  if (isStaff) {
    // Fetch staff specific groups
  }

  return [schoolGroup, ...classGroups, ...sectionGroups, ...subjectGroups];
}
