import { DayOfWeek } from "@prisma/client";
import { getDate, getMonth, getYear } from "date-fns";
import _ from "lodash";
import { NumberMonthMapping } from "schooltalk-shared/mics";
import { z } from "zod";
import prisma from "../../../prisma";
import { router, teacherProcedure } from "../../trpc";

const routineRouter = router({
  fetchForTeacher: teacherProcedure
    .input(
      z.object({
        dateOfAttendance: z
          .string()
          .datetime()
          .default(new Date().toISOString())
          .transform((v) => new Date(v)),
      })
    )
    .query(async ({ input, ctx }) => {
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
          AttendancesTaken: {
            where: {
              year: getYear(input.dateOfAttendance),
              month: NumberMonthMapping[getMonth(input.dateOfAttendance)],
              day: getDate(input.dateOfAttendance),
            },
            select: {
              id: true,
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
