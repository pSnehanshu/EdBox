import { TRPCError } from "@trpc/server";
import { parseISO } from "date-fns";
import _ from "lodash";
import { StaticRole } from "schooltalk-shared/misc";
import type { ArrayElement } from "schooltalk-shared/types";
import { z } from "zod";
import prisma from "../../../prisma";
import { authMiddleware, roleMiddleware, t } from "../../trpc";

const dateStringSchema = z
  .string()
  .datetime()
  .default(() => new Date().toISOString())
  .transform((d) => parseISO(d));

const examTestSchema = z.object({
  name: z.string().max(100).trim().optional(),
  class_id: z.number().int(),
  section_id: z.number().int().optional(),
  date: z
    .string()
    .datetime()
    .transform((d) => parseISO(d)),
  duration_minutes: z.number().int().min(0).default(0),
  subjectIds: z.string().cuid().array(),
});

const examRouter = t.router({
  getTestInfo: t.procedure
    .use(authMiddleware)
    .input(
      z.object({
        testId: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const test = await prisma.examTest.findUnique({
        where: { id: input.testId },
        include: {
          Exam: true,
          Subjects: {
            where: {
              Subject: {
                is_active: true,
              },
            },
            include: {
              Subject: true,
            },
          },
        },
      });

      if (!test || !test.is_active || test.school_id !== ctx.user.school_id)
        throw new TRPCError({
          code: "NOT_FOUND",
        });

      return test;
    }),
  createTest: t.procedure
    .use(
      roleMiddleware([
        StaticRole.principal,
        StaticRole.vice_principal,
        StaticRole.teacher,
        StaticRole.staff,
      ])
    )
    .input(examTestSchema.extend({ exam_id: z.string().cuid().optional() }))
    .mutation(async ({ input, ctx }) => {
      const test = await prisma.examTest.create({
        data: {
          exam_id: input.exam_id,
          subject_name: input.name,
          class_id: input.class_id,
          section_id: input.section_id,
          date_of_exam: input.date,
          duration_minutes: input.duration_minutes,
          school_id: ctx.user.school_id,
          creator_user_id: ctx.user.id,
          Subjects: {
            // TODO: Make sure these subjects belong to this school
            create: input.subjectIds.map((id) => ({ subject_id: id })),
          },
        },
      });

      return test;
    }),
  updateTest: t.procedure
    .use(
      roleMiddleware([
        StaticRole.principal,
        StaticRole.vice_principal,
        StaticRole.teacher,
        StaticRole.staff,
      ])
    )
    .input(
      z.object({
        id: z.string().cuid(),
        data: examTestSchema
          .pick({
            date: true,
            name: true,
            duration_minutes: true,
            subjectIds: true,
          })
          .partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await prisma.$transaction(async (tx) => {
        await tx.examTest.updateMany({
          where: {
            id: input.id,
            school_id: ctx.user.school_id,
          },
          data: {
            subject_name: input.data.name,
            date_of_exam: input.data.date,
            duration_minutes: input.data.duration_minutes,
          },
        });

        if (!input.data.subjectIds) return;

        // First fetch all subjects
        const test = await tx.examTest.findFirst({
          where: {
            id: input.id,
            school_id: ctx.user.school_id,
          },
          include: {
            Subjects: true,
          },
        });

        if (!test) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Test not found",
          });
        }

        // Remove subjects that are not included in input
        const subjectsToRemove = test.Subjects.filter(
          (s) => !input.data.subjectIds?.includes(s.subject_id)
        );

        await Promise.all(
          subjectsToRemove.map((s) =>
            tx.testSubjectMapping.delete({
              where: {
                test_id_subject_id: {
                  subject_id: s.subject_id,
                  test_id: test.id,
                },
              },
            })
          )
        );

        // Attach the subjects not attached already
        const subjectsToAdd = input.data.subjectIds.filter(
          (id) => test.Subjects.findIndex((s) => s.subject_id === id) >= 0
        );

        await tx.testSubjectMapping.createMany({
          data: subjectsToAdd.map((subject_id) => ({
            subject_id,
            test_id: test.id,
          })),
        });
      });
    }),
  deleteTest: t.procedure
    .use(
      roleMiddleware([
        StaticRole.principal,
        StaticRole.vice_principal,
        StaticRole.teacher,
        StaticRole.staff,
      ])
    )
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await prisma.examTest.deleteMany({
        where: {
          id: input.id,
          school_id: ctx.user.school_id,
        },
      });
    }),
  createExam: t.procedure
    .use(
      roleMiddleware([
        StaticRole.principal,
        StaticRole.vice_principal,
        StaticRole.teacher,
        StaticRole.staff,
      ])
    )
    .input(
      z.object({
        name: z.string().max(100),
        tests: examTestSchema.array().default([]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const exam = await prisma.exam.create({
        data: {
          name: input.name,
          school_id: ctx.user.school_id,
          Tests: {
            create: input.tests.map((test) => ({
              subject_name: test.name,
              class_id: test.class_id,
              section_id: test.section_id,
              date_of_exam: test.date,
              duration_minutes: test.duration_minutes,
              school_id: ctx.user.school_id,
              creator_user_id: ctx.user.id,
              Subjects: {
                create: test.subjectIds.map((id) => ({
                  // TODO: Make sure these subjects belong to this school
                  subject_id: id,
                })),
              },
            })),
          },
        },
        include: {
          Tests: true,
        },
      });

      return exam;
    }),
  updateExam: t.procedure
    .use(
      roleMiddleware([
        StaticRole.principal,
        StaticRole.vice_principal,
        StaticRole.teacher,
        StaticRole.staff,
      ])
    )
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await prisma.exam.updateMany({
        where: {
          id: input.id,
          school_id: ctx.user.school_id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  fetchExamsAndTestsForStudent: t.procedure
    .use(roleMiddleware([StaticRole.student]))
    .input(
      z.object({
        after_date: dateStringSchema,
        limit: z.number().int().min(1).max(100).default(10),
        page: z.number().int().min(1).default(1),
      })
    )
    .query(async ({ input, ctx }) => {
      const student = await prisma.student.findUnique({
        where: {
          id: ctx.user.student_id!,
        },
        include: {
          CurrentBatch: true,
        },
      });

      if (
        !student ||
        !student.CurrentBatch?.is_active ||
        !student.CurrentBatch.class_id
      )
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });

      const tests = await prisma.examTest.findMany({
        where: {
          school_id: ctx.user.school_id,
          class_id: student.CurrentBatch.class_id,
          date_of_exam: { gte: input.after_date },
          is_active: true,
          OR: [{ section_id: student.section }, { section_id: null }],
          AND: [
            {
              OR: [
                { exam_id: null },
                {
                  Exam: {
                    is_active: true,
                  },
                },
              ],
            },
          ],
        },
        include: {
          Exam: {
            include: {
              Tests: {
                where: {
                  is_active: true,
                  class_id: student.CurrentBatch.class_id,
                  OR: [{ section_id: student.section }, { section_id: null }],
                },
                orderBy: {
                  date_of_exam: "asc",
                },
                include: {
                  Subjects: {
                    where: {
                      Subject: {
                        is_active: true,
                      },
                    },
                    include: {
                      Subject: true,
                    },
                  },
                },
              },
            },
          },
          Subjects: {
            where: {
              Subject: {
                is_active: true,
              },
            },
            include: {
              Subject: true,
            },
          },
        },
        orderBy: {
          date_of_exam: "asc",
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });

      // Extract the exams
      const exams = _.uniqBy(
        tests.filter((t) => t.Exam).map((t) => t.Exam!),
        "id"
      );

      // Filter out the independent tests (tests not under any exam)
      const independentTests = tests.filter((t) => !t.Exam) as Array<
        ArrayElement<typeof tests> & { Exam: null | undefined }
      >;

      type ExamItem =
        | {
            type: "exam";
            item: ArrayElement<typeof exams>;
          }
        | {
            type: "test";
            item: typeof independentTests[0];
          };

      const items: ExamItem[] = [];

      exams.forEach((e) => {
        items.push({
          type: "exam",
          item: e,
        });
      });
      independentTests.forEach((t) => {
        items.push({
          type: "test",
          item: t,
        });
      });

      // Sort the items
      return _.sortBy(items, ({ type, item }) => {
        if (type === "test") {
          return item.date_of_exam;
        } else {
          return item.Tests[0]?.date_of_exam;
        }
      });
    }),
});

export default examRouter;
