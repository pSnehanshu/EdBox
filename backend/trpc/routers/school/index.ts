import { router, publicProcedure, authProcedure } from "../../trpc";
import { z } from "zod";
import prisma from "../../../prisma";
import { TRPCError } from "@trpc/server";
import messagingRouter from "./messaging";

const schoolRouter = router({
  schoolBasicInfo: publicProcedure
    .input(
      z.object({
        schoolId: z.string().cuid(),
      })
    )
    .query(async ({ input }) => {
      const school = await prisma.school.findUnique({
        where: {
          id: input.schoolId,
        },
        select: {
          id: true,
          logo: true,
          icon: true,
          name: true,
          is_active: true,
        },
      });

      if (!school || !school.is_active) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return school;
    }),
  messaging: messagingRouter,
});

export default schoolRouter;
