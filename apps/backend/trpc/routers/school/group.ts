import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { GroupActivityType } from "@prisma/client";
import { AllGroupActivitiesObservable } from "../../../groups/GroupActivity";
import { protectedProcedure, router } from "../../trpc";

const groupRouter = router({
  sendMessage: protectedProcedure
    .input(
      z.object({
        body: z.string().trim(),
        group_id: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Check if user is allowed to send message on the group

      // Send the message
      AllGroupActivitiesObservable.next({
        author_id: ctx.user.id,
        type: GroupActivityType.message_new,
        created_at: new Date(),
        group_id: input.group_id,
        id: uuidv4(),
        is_system_generated: false,
        payload: {
          t: GroupActivityType.message_new,
          body: input.body,
        },
        parent_id: null,
      });
    }),
});

export default groupRouter;
