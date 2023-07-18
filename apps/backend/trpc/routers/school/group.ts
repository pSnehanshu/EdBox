import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { GroupActivityType } from "@prisma/client";
import { GroupActivities$ } from "../../../groups/GroupActivity";
import { protectedProcedure, router } from "../../trpc";
import prisma from "../../../prisma";
import { parseISO } from "date-fns";
import { TRPCError } from "@trpc/server";
import { ActivityPayloadSchema } from "schooltalk-shared/group-schemas";
import { IGroupActivity } from "schooltalk-shared/types";

const groupRouter = router({
  sendMessage: protectedProcedure
    .input(
      z.object({
        body: z.string().trim(),
        group_id: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Ensure user is memeber of the group
      const membership = await prisma.groupMember.findUnique({
        where: {
          user_id_group_id: {
            group_id: input.group_id,
            user_id: ctx.user.id,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Either the group does not exists or the user is not member of the group",
        });
      }

      // TODO: Check sending messages right

      // Send the message
      GroupActivities$.next({
        author_id: ctx.user.id,
        type: GroupActivityType.message_new,
        created_at: new Date().toISOString(),
        group_id: input.group_id,
        id: uuidv4(),
        is_system_generated: false,
        payload: {
          t: GroupActivityType.message_new,
          body: input.body,
        },
      });
    }),
  fetchActivities: protectedProcedure
    .input(
      z.object({
        group_id: z.string().cuid(),
        type: z.nativeEnum(GroupActivityType).optional(),
        cursor: z
          .string()
          .datetime()
          .transform((d) => parseISO(d))
          .optional(),
        limit: z.number().int().min(1).max(20).default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Ensure user is memeber of the group
      const membership = await prisma.groupMember.findUnique({
        where: {
          user_id_group_id: {
            group_id: input.group_id,
            user_id: ctx.user.id,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Either the group does not exists or the user is not member of the group",
        });
      }

      // Fetch the activities
      const activities = await prisma.groupActivity.findMany({
        where: { group_id: input.group_id, type: input.type },
        take: input.limit + 1,
        skip: input.cursor ? 1 : 0,
        cursor: input.cursor ? { created_at: input.cursor } : undefined,
        orderBy: { created_at: "desc" },
      });

      // Determine the next cursor
      let nextCursor: Date | null = null;
      if (activities.length > input.limit) {
        const nextItem = activities.pop();
        nextCursor = nextItem ? nextItem.created_at : null;
      }

      // Parse and filter the payloads
      const parsedActivites: IGroupActivity[] = [];
      const brokenActivityIds: string[] = [];

      activities.forEach((activity) => {
        const result = ActivityPayloadSchema.safeParse(activity.payload);

        if (!result.success) {
          return brokenActivityIds.push(activity.id);
        }

        const { data: payload } = result;

        // Ensure payload type matches activity type
        if (payload.t !== activity.type) {
          return brokenActivityIds.push(activity.id);
        }

        // Keep the valid activity
        parsedActivites.push({
          ...activity,
          payload,
          created_at: activity.created_at.toISOString(),
          author_id: activity.author_id ?? undefined,
          parent_id: activity.parent_id ?? undefined,
        });
      });

      // Broken payloads detected, just delete them
      if (brokenActivityIds.length > 0) {
        await prisma.groupActivity.deleteMany({
          where: { id: { in: brokenActivityIds } },
        });
      }

      // Return data
      return { data: parsedActivites, nextCursor };
    }),
});

export default groupRouter;
