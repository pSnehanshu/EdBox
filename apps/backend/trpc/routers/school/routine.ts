import { DayOfWeek } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import _ from "lodash";
import { dateOfAttendance } from "schooltalk-shared/misc";
import { z } from "zod";
import prisma from "../../../prisma";
import {
  authMiddleware,
  principalMiddleware,
  studentMiddleware,
  router,
  procedure,
  teacherMiddleware,
} from "../../trpc";
import classStdRouter from "./class-std";

const routineRouter = router({
  fetchForSchool: procedure.use(principalMiddleware).query(async ({ ctx }) => {
    const school = await prisma.school.findUnique({
      where: {
        id: ctx.user.school_id,
      },
      select: {
        is_active: true,
        Periods: {
          include: {
            Teacher: true,
            Class: true,
            Section: true,
            Subject: true,
          },
        },
      },
    });

    if (!school || !school.is_active) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    return school.Periods;
  }),
  fetchForTeacher: procedure
    .use(teacherMiddleware)
    .input(
      z.object({
        dateOfAttendance,
        daysOfWeek: z.nativeEnum(DayOfWeek).array().default([]),
      }),
    )
    .query(async ({ input, ctx }) => {
      const periods = await prisma.routinePeriod.findMany({
        where: {
          teacher_id: ctx.teacher.id,
          school_id: ctx.user.school_id,
          day_of_week:
            input.daysOfWeek.length > 0 ? { in: input.daysOfWeek } : undefined,
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
              year: input.dateOfAttendance.year,
              month: input.dateOfAttendance.month,
              day: input.dateOfAttendance.day,
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
  fetchForStudent: procedure
    .use(studentMiddleware)
    .input(
      z.object({
        dateOfAttendance,
        daysOfWeek: z.nativeEnum(DayOfWeek).array().default([]),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (typeof ctx.student.section !== "number") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not part of any section",
        });
      }

      // Fetch routine via student -> batch -> class
      const student = await prisma.student.findFirst({
        where: {
          id: ctx.student.id,
        },
        select: {
          CurrentBatch: {
            select: {
              Class: {
                select: {
                  Periods: {
                    where: {
                      section_id: ctx.student.section,
                      school_id: ctx.user.school_id,
                      day_of_week:
                        input.daysOfWeek.length > 0
                          ? { in: input.daysOfWeek }
                          : undefined,
                    },
                    include: {
                      Subject: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
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
                      AttendancesTaken: {
                        where: {
                          year: input.dateOfAttendance.year,
                          month: input.dateOfAttendance.month,
                          day: input.dateOfAttendance.day,
                        },
                        select: {
                          id: true,
                          StudentAttendances: {
                            where: {
                              student_id: ctx.student.id,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Student not found. Either batch, class, or user is inactive",
        });
      }

      const periods = student.CurrentBatch?.Class?.Periods ?? [];

      return _.groupBy(periods, "day_of_week") as Record<
        DayOfWeek,
        typeof periods | undefined
      >;
    }),
  fetchPeriodStudents: procedure
    .use(authMiddleware)
    .input(
      z.object({
        periodId: z.string().cuid(),
        limit: z.number().int().min(1).max(100).default(20),
        /** Roll number */
        cursor: z.number().int().nullish(),
      }),
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
          class_id: true,
          section_id: true,
        },
      });

      if (!period) {
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
