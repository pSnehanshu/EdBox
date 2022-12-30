import { User } from "@prisma/client";
import { z } from "zod";
import prisma from "../../../prisma";
import {
  getCustomGroupIdentifier,
  getSchoolGroupIdentifier,
  GroupBasicInfo,
} from "../../../utils/group-identifier";
import { router, authProcedure } from "../../trpc";

/**
 * Get list of all automatic groups a user is part of
 * @param user
 */
async function getAutoGroups(
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

const messagingRouter = router({
  fetchGroups: authProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(20).default(10),
        page: z.number().int().min(1),
        sort: z.enum([/* "name_asc", "name_desc", */ "recent_message"]),
      })
    )
    .query(async ({ input, ctx }) => {
      // Fetch all custom groups
      const customGroupMembers = await prisma.customGroupMembers.findMany({
        where: {
          user_id: ctx.user.id,
          Group: {
            is_active: true,
          },
        },
        include: {
          Group: true,
        },
      });

      // Sort
      if (input.sort === "recent_message") {
        // TODO
      }

      const customGroups: GroupBasicInfo[] = customGroupMembers.map((cgm) => ({
        gd: "c",
        id: getCustomGroupIdentifier(ctx.user.school_id, cgm.group_id),
        name: cgm.Group.name,
      }));

      // Now fetch all automatic groups
      const autoGroups = await getAutoGroups(ctx.user);

      const startIndex = (input.page - 1) * input.limit;

      // Combine, slice and return
      return [...autoGroups, ...customGroups].slice(
        startIndex,
        startIndex + input.limit
      );
    }),
});

export default messagingRouter;
