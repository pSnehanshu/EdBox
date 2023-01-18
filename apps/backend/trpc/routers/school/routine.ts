import { DayOfWeek } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { getDate, getMonth, getYear } from "date-fns";
import _ from "lodash";
import { NumberMonthMapping } from "schooltalk-shared/misc";
import { z } from "zod";
import prisma from "../../../prisma";
import { authProcedure, router, teacherProcedure } from "../../trpc";
import classStdRouter from "./class-std";

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
  fetchPeriodStudents: authProcedure
    .input(
      z.object({
        periodId: z.string().cuid(),
        limit: z.number().int().min(1).max(100).default(20),
        /** Roll number */
        cursor: z.number().int().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const period = await prisma.routinePeriod.findUnique({
        where: {
          id_school_id: {
            id: input.periodId,
            school_id: ctx.user.school_id,
          },
        },
        select: {
          is_active: true,
          class_id: true,
          section_id: true,
        },
      });

      if (!period || !period.is_active) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      // Call another procedure
      return classStdRouter.createCaller(ctx).fetchSectionStudents({
        limit: input.limit,
        cursor: input.cursor,
        classId: period.class_id,
        sectionId: period.section_id,
      });
    }),
});

export default routineRouter;
