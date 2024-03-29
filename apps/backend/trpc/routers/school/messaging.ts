import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Group } from "schooltalk-shared/types";
import prisma from "../../../prisma";
import { getUserGroups } from "../../../utils/groups";
import {
  AutoGroupType,
  convertObjectToOrderedQueryString,
  GroupDefinition,
  groupIdentifierSchema,
} from "schooltalk-shared/group-identifier";
import { router, protectedProcedure } from "../../trpc";

const messagingRouter = router({
  fetchGroups: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(20).default(10),
        page: z.number().int().min(1),
        // sort: z.enum([/* "name_asc", "name_desc", */ "recent_message"]),
      }),
    )
    .query(async ({ input, ctx }) =>
      getUserGroups(ctx.user, {
        limit: input.limit,
        page: input.page,
      }),
    ),
  createGroup: protectedProcedure
    .input(
      z.object({
        name: z.string().max(50).trim(),
      }),
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
  addMemberToGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.string().cuid(),
        userId: z.string().cuid(),
        isAdmin: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Fetch the invited user
      const addedUser = await prisma.user.findUnique({
        where: {
          id: input.userId,
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
        (m) => m.user_id === ctx.user.id,
      );
      const addedUserMembership = group.Members.find(
        (m) => m.user_id === addedUser.id,
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
          is_admin: input.isAdmin,
        },
      });

      return member;
    }),
  removeMemberFromGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.string().cuid(),
        userId: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Fetch target user
      const targetUser = await prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
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
        (m) => m.user_id === ctx.user.id,
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
        (m) => m.user_id === targetUser.id,
      );

      if (!targetMembership) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Given user is not a member of the group",
        });
      }

      if (targetMembership.is_admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Can not remove an admin member",
        });
      }

      // Remove membership
      await prisma.customGroupMembers.delete({
        where: {
          user_id_group_id: {
            user_id: targetUser.id,
            group_id: group.id,
          },
        },
      });
    }),
  makeMemberAdmin: protectedProcedure
    .input(
      z.object({
        groupId: z.string().cuid(),
        userId: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Fetch target user
      const targetUser = await prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
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
        (m) => m.user_id === ctx.user.id,
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
        (m) => m.user_id === targetUser.id,
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
  giveUpAdminRole: protectedProcedure
    .input(
      z.object({
        groupId: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Fetch group and memberships
      const group = await prisma.customGroup.findFirst({
        where: {
          id: input.groupId,
          school_id: ctx.user.school_id,
        },
        include: {
          Members: {
            where: {
              user_id: ctx.user.id,
            },
          },
        },
      });

      if (!group) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      }

      // Make sure current user is admin
      const currentUserMembership = group.Members.find(
        (m) => m.user_id === ctx.user.id,
      );

      if (!currentUserMembership || !currentUserMembership.is_admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You are either not a member of the group, or not an admin member",
        });
      }

      // Stop being admin
      await prisma.customGroupMembers.update({
        where: {
          user_id_group_id: {
            user_id: ctx.user.id,
            group_id: group.id,
          },
        },
        data: { is_admin: false },
      });
    }),
  updateGroupDetails: protectedProcedure
    .input(
      z.object({
        groupId: z.string().cuid(),
        name: z.string().max(50).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Fetch group and memberships
      const group = await prisma.customGroup.findFirst({
        where: {
          id: input.groupId,
          school_id: ctx.user.school_id,
        },
        include: {
          Members: {
            where: {
              user_id: ctx.user.id,
            },
          },
        },
      });

      if (!group) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      }

      // Make sure current user is admin
      const currentUserMembership = group.Members.find(
        (m) => m.user_id === ctx.user.id,
      );

      if (!currentUserMembership || !currentUserMembership.is_admin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You are either not a member of the group, or not an admin member",
        });
      }

      // Collect updates
      const updates: Prisma.CustomGroupUpdateInput = {};

      if (input.name && group.name !== input.name) {
        updates.name = input.name;
      }

      // Check if anything is being updated
      if (Object.keys(updates).length < 1) {
        // Don't update anything
        return group;
      }

      // Update
      const updatedGroup = await prisma.customGroup.update({
        where: { id: group.id },
        data: updates,
      });

      return updatedGroup;
    }),
  fetchGroupInfo: protectedProcedure
    .input(
      z.object({
        groupIdentifier: groupIdentifierSchema,
      }),
    )
    .query(async ({ input, ctx }): Promise<Group> => {
      const identifier = convertObjectToOrderedQueryString(
        input.groupIdentifier,
      );

      if (input.groupIdentifier.sc !== ctx.user.school_id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Can't find group from other schools",
        });
      }

      if (input.groupIdentifier.gd === GroupDefinition.custom) {
        const group = await prisma.customGroup.findUnique({
          where: {
            id: input.groupIdentifier.id,
          },
          select: {
            name: true,
            school_id: true,
          },
        });

        if (!group || group.school_id !== input.groupIdentifier.sc) {
          throw new TRPCError({
            code: "NOT_FOUND",
          });
        }

        return { name: group.name, identifier };
      }

      const groupType = input.groupIdentifier.ty;

      if (groupType === AutoGroupType.school) {
        const school = await prisma.school.findUnique({
          where: {
            id: input.groupIdentifier.sc,
          },
          select: {
            name: true,
            is_active: true,
          },
        });

        if (!school || !school.is_active) {
          throw new TRPCError({
            code: "NOT_FOUND",
          });
        }

        return { name: school.name, identifier };
      } else if (groupType === AutoGroupType.batch) {
        const Batch = await prisma.studentsBatch.findUnique({
          where: {
            numeric_id_school_id: {
              numeric_id: input.groupIdentifier.ba,
              school_id: input.groupIdentifier.sc,
            },
          },
          select: {
            Class: {
              select: {
                name: true,
                numeric_id: true,
              },
            },
          },
        });

        const Class = Batch?.Class;
        if (!Class) {
          throw new TRPCError({
            code: "NOT_FOUND",
          });
        }

        return {
          name: `Class ${Class.name ?? Class.numeric_id} (all sections)`,
          identifier,
        };
      } else if (groupType === AutoGroupType.section) {
        const Batch = await prisma.studentsBatch.findUnique({
          where: {
            numeric_id_school_id: {
              numeric_id: input.groupIdentifier.ba,
              school_id: input.groupIdentifier.sc,
            },
          },
          select: {
            Class: {
              select: {
                name: true,
                numeric_id: true,
                Sections: {
                  select: { name: true, numeric_id: true },
                  where: { numeric_id: input.groupIdentifier.se },
                },
              },
            },
          },
        });

        const Class = Batch?.Class;
        const Section = Class?.Sections?.at(0);

        if (!Section || !Class) {
          throw new TRPCError({
            code: "NOT_FOUND",
          });
        }

        return {
          name: `Class ${Class.name ?? Class.numeric_id} (${
            Section.name ?? Section.numeric_id
          })`,
          identifier,
        };
      } else {
        const [subject, Batch] = await Promise.all([
          prisma.subject.findUnique({
            where: {
              id: input.groupIdentifier.su,
            },
            select: {
              name: true,
              school_id: true,
            },
          }),
          prisma.studentsBatch.findUnique({
            where: {
              numeric_id_school_id: {
                numeric_id: input.groupIdentifier.ba,
                school_id: input.groupIdentifier.sc,
              },
            },
            select: {
              Class: {
                select: {
                  name: true,
                  numeric_id: true,
                },
              },
            },
          }),
        ]);

        const Class = Batch?.Class;

        if (
          !subject ||
          subject.school_id !== input.groupIdentifier.sc ||
          !Class
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
          });
        }

        return {
          name: `${subject.name} - Class ${Class.name ?? Class.numeric_id}`,
          identifier,
        };
      }
    }),
  fetchGroupMessages: protectedProcedure
    .input(
      z.object({
        groupIdentifier: groupIdentifierSchema,
        limit: z.number().min(1).max(500).default(100),
        cursor: z
          .string()
          .regex(/^\d+$/, "Must be a numeric string")
          .transform((v) => BigInt(v))
          .optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.groupIdentifier.sc !== ctx.user.school_id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Can't find group from other schools",
        });
      }

      const messages = (
        await prisma.message.findMany({
          where: {
            school_id: ctx.user.school_id,
            group_identifier: convertObjectToOrderedQueryString(
              input.groupIdentifier,
            ),
          },
          include: {
            ParentMessage: true,
            Sender: {
              include: {
                Student: true,
                Teacher: true,
                Parent: true,
                Staff: true,
              },
            },
            Attachments: {
              include: {
                File: true,
              },
            },
          },
          orderBy: {
            sort_key: "desc",
          },
          take: input.limit + 1, // get an extra item at the end which we'll use as next cursor
          cursor: input.cursor
            ? {
                sort_key: input.cursor,
              }
            : undefined,
        })
      ).map((m) => ({
        ...m,
        sort_key: m.sort_key.toString(), // Convert bigint to string
      }));

      // Determining the cursor
      let nextCursor: string | undefined = undefined;
      if (messages.length > input.limit) {
        const nextItem = messages.pop();
        if (nextItem) nextCursor = nextItem.sort_key;
      }

      return { messages, cursor: nextCursor };
    }),
});

export default messagingRouter;
