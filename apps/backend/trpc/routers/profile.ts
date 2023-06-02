import { Gender } from "@prisma/client";
import _ from "lodash";
import { z } from "zod";
import prisma from "../../prisma";
import { router, protectedProcedure } from "../trpc";

const profileRouter = router({
  me: protectedProcedure.query(({ ctx }) =>
    _.omit(ctx.user, ["password", "otp", "otp_expiry", "School"]),
  ),
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().max(50).min(1).optional(),
        gender: z.nativeEnum(Gender).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          name: input.name,
          gender: input.gender,
        },
      });

      return _.omit(user, ["password", "otp", "otp_expiry", "School"]);
    }),
});

export default profileRouter;
