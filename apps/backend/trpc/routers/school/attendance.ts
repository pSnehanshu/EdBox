import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";
import { everyLimit } from "schooltalk-shared/async";
import { dateOfAttendance, NumberMonthMapping } from "schooltalk-shared/misc";
import { router, protectedProcedure, teacherProcedure } from "../../trpc";
import prisma from "../../../prisma";
import { TRPCError } from "@trpc/server";
import { getDate, getMonth, getYear } from "date-fns";

const attendanceRouter = router({
  create: teacherProcedure
    .input(
      z.object({
        periodId: z.string().cuid(),
        date: z
          .string()
          .datetime()
          .transform((v) => new Date(v)),
        studentsAttendance: z.record(
          z.string().cuid(), // Student Id
          z.object({
            status: z.nativeEnum(AttendanceStatus),
            remarks: z.string().max(200).trim().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Check if period is valid
      const period = await prisma.routinePeriod.findUnique({
        where: {
          id_school_id: {
            id: input.periodId,
            school_id: ctx.user.school_id,
          },
        },
        select: {
          section_id: true,
          class_id: true,
          Class: {
            select: {
              Batch: true,
            },
          },
        },
      });

      if (!period || !period.Class || !period.Class.Batch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Period not found",
        });
      }

      // Make sure full attendance is submitted
      const studentsCount = await prisma.student.count({
        where: {
          school_id: ctx.user.school_id,
          current_batch_num: period.Class.Batch.numeric_id,
          section: period.section_id,
        },
      });
      const submittedStudentIds = Object.keys(input.studentsAttendance);
      if (submittedStudentIds.length < studentsCount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Attendance for all students must be submitted",
        });
      }

      // Verify all students are part of this school, and part of the particular section
      const allStudentsOk = await everyLimit(
        submittedStudentIds,
        10,
        async (studentId) => {
          const student = await prisma.student.findUnique({
            where: {
              id: studentId,
            },
            select: {
              school_id: true,
              section: true,
              CurrentBatch: {
                select: {
                  class_id: true,
                },
              },
            },
          });

          const result = !!(
            student && // Student exists
            // Student is part of this school
            student.school_id === ctx.user.school_id &&
            // Student is part of the period's class
            student.CurrentBatch?.class_id === period.class_id &&
            // Student is part of the period's section
            student.section === period.section_id
          );

          if (!result) {
            console.error("Invalid student details submitted", {
              studentId,
              periodId: input.periodId,
              schoolId: ctx.user.school_id,
            });
          }

          return result;
        },
      );

      if (!allStudentsOk) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Some invalid student details were submitted",
        });
      }

      // Create the attendance
      const { id } = await prisma.periodAttendance.create({
        data: {
          period_id: input.periodId,
          school_id: ctx.user.school_id,
          teacher_id: ctx.teacher.id,
          year: getYear(input.date),
          month: NumberMonthMapping[getMonth(input.date)],
          day: getDate(input.date),
          StudentAttendances: {
            createMany: {
              data: Object.entries(input.studentsAttendance).map(
                ([studentId, data]) => ({
                  student_id: studentId,
                  status: data.status,
                  remarks: data.remarks,
                }),
              ),
            },
          },
        },
        select: {
          id: true,
        },
      });

      return id;
    }),
  fetchForPeriod: protectedProcedure
    .input(
      z.object({
        periodId: z.string().cuid(),
        date: dateOfAttendance,
      }),
    )
    .query(async ({ input, ctx }) => {
      // Check if period is valid
      const period = await prisma.routinePeriod.findUnique({
        where: {
          id_school_id: {
            id: input.periodId,
            school_id: ctx.user.school_id,
          },
        },
        select: {
          section_id: true,
          class_id: true,
          AttendancesTaken: {
            where: {
              year: input.date.year,
              month: input.date.month,
              day: input.date.day,
            },
            select: {
              created_at: true,
              StudentAttendances: {
                select: {
                  status: true,
                  remarks: true,
                  Student: {
                    select: {
                      id: true,
                      User: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
              Teacher: {
                select: {
                  id: true,
                  User: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!period) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Period not found",
        });
      }

      return period.AttendancesTaken[0] ?? null;
    }),
});

export default attendanceRouter;
