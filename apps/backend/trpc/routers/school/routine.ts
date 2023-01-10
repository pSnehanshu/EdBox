import { DayOfWeek } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import _ from "lodash";
import prisma from "../../../prisma";
import { authProcedure, router, t } from "../../trpc";

const routineRouter = router({
  fetchForTeacher: authProcedure
    .use(
      t.middleware(({ ctx, next }) => {
        // Check if teacher
        if (!ctx.session?.User.Teacher) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not a teacher",
          });
        }

        return next({
          ctx: {
            ...ctx,
            teacher: ctx.session.User.Teacher,
          },
        });
      })
    )
    .query(async ({ ctx }) => {
      const periods = await prisma.routinePeriod.findMany({
        where: {
          teacher_id: ctx.teacher.id,
          school_id: ctx.user.school_id,
          is_active: true,
          Class: {
            is_active: true,
          },
          Subject: {
            is_active: true,
          },
        },
        include: {
          Class: {
            select: {
              numeric_id: true,
              name: true,
            },
          },
          Section: {
            select: {
              numeric_id: true,
              name: true,
            },
          },
          Subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return _.groupBy(periods, "day_of_week") as Record<
        DayOfWeek,
        typeof periods | undefined
      >;
    }),
});

export default routineRouter;
