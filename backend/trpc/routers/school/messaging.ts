import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
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
  createGroup: authProcedure
    .input(
      z.object({
        name: z.string().max(50).trim(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const group = await prisma.customGroup.create({
        data: {
          name: input.name,
          created_by_id: ctx.user.id,
          school_id: ctx.user.school_id,
          Members: {
            create: {
              is_admin: true,
              user_id: ctx.user.id,
            },
          },
        },
      });

      return group;
    }),
  addMemberToGroup: authProcedure
    .input(
      z.object({
        groupId: z.string().cuid(),
        user_id: z.string().cuid(),
        is_admin: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Fetch the invited user
      const addedUser = await prisma.user.findUnique({
        where: {
          id: input.user_id,
        },
      });

      if (!addedUser || addedUser.school_id !== ctx.user.school_id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Fetch group
      const group = await prisma.customGroup.findFirst({
        where: {
          id: input.groupId,
          school_id: ctx.user.school_id,
        },
        include: {
          Members: {
            where: {
              OR: [{ user_id: ctx.user.id }, { user_id: addedUser.id }],
            },
          },
        },
      });

      if (!group) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      }

      const currentUserMembership = group.Members.find(
        (m) => m.user_id === ctx.user.id
      );
      const addedUserMembership = group.Members.find(
        (m) => m.user_id === addedUser.id
      );

      if (!currentUserMembership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not a member of group",
        });
      }

      if (!currentUserMembership.is_admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can add users to groups",
        });
      }

      if (addedUserMembership) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already a member",
        });
      }

      // All ok, add member
      const member = await prisma.customGroupMembers.create({
        data: {
          group_id: group.id,
          user_id: addedUser.id,
          is_admin: input.is_admin,
        },
      });

      return member;
    }),
  makeMemberAdmin: authProcedure
    .input(
      z.object({
        groupId: z.string().cuid(),
        userId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Fetch target user
      const targetUser = await prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          is_active: true,
          school_id: true,
        },
      });

      if (!targetUser || targetUser.school_id !== ctx.user.school_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Given user not found",
        });
      }

      // Fetch group and memberships
      const group = await prisma.customGroup.findFirst({
        where: {
          id: input.groupId,
          school_id: ctx.user.school_id,
        },
        include: {
          Members: {
            where: {
              OR: [{ user_id: ctx.user.id }, { user_id: targetUser.id }],
            },
          },
        },
      });

      if (!group) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      }

      // Make sure current user is admin
      const currentUserMembership = group.Members.find(
        (m) => m.user_id === ctx.user.id
      );

      if (!currentUserMembership || !currentUserMembership.is_admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You are either not a member of the group, or not an admin member",
        });
      }

      // Make sure target user is already a member
      const targetMembership = group.Members.find(
        (m) => m.user_id === targetUser.id
      );

      if (!targetMembership) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Given user is not a member of the group",
        });
      }

      // If already a member, we do nothing
      if (!targetMembership.is_admin) {
        // Make admin
        await prisma.customGroupMembers.update({
          where: {
            user_id_group_id: {
              user_id: targetUser.id,
              group_id: input.groupId,
            },
          },
          data: {
            is_admin: true,
          },
        });
      }
    }),
});

export default messagingRouter;
