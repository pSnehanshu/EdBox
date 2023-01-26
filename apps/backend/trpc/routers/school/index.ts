import { router, publicProcedure, authProcedure } from "../../trpc";
import { z } from "zod";
import prisma from "../../../prisma";
import { TRPCError } from "@trpc/server";
import messagingRouter from "./messaging";
import routineRouter from "./routine";
import attendanceRouter from "./attendance";
import classStdRouter from "./class-std";
import subjectRouter from "./subject";
import peopleRouter from "./people";

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
          website: true,
        },
      });

      if (!school || !school.is_active) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return school;
    }),
  messaging: messagingRouter,
  routine: routineRouter,
  attendance: attendanceRouter,
  class: classStdRouter,
  subject: subjectRouter,
  people: peopleRouter,
});

export default schoolRouter;
