import { TRPCError } from "@trpc/server";
import { parseISO } from "date-fns";
import _ from "lodash";
import { StaticRole } from "schooltalk-shared/misc";
import { z } from "zod";
import prisma from "../../../prisma";
import { authProcedure, roleMiddleware, router, t } from "../../trpc";

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

const examRouter = router({
  createTest: authProcedure
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
  updateTest: authProcedure
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
  deleteTest: authProcedure
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
  fetchTestsForSection: authProcedure
    .input(
      z.object({
        section_id: z.number().int(),
        class_id: z.number().int(),
        after_date: z
          .string()
          .datetime()
          .default(() => new Date().toISOString())
          .transform((d) => parseISO(d)),
        limit: z.number().int().min(1).max(100).default(20),
        page: z.number().int().min(1).default(1),
      })
    )
    .query(async ({ input, ctx }) => {
      const tests = await prisma.examTest.findMany({
        where: {
          AND: [
            { class_id: input.class_id },
            { school_id: ctx.user.school_id },
            { is_active: true },
          ],
          OR: [{ section_id: input.section_id }, { section_id: null }],
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
        include: {
          Subjects: true,
        },
      });

      return tests;
    }),
  createExam: authProcedure
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
  updateExam: authProcedure
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
  fetchExamsForSection: authProcedure
    .input(
      z.object({
        section_id: z.number().int(),
        class_id: z.number().int(),
        after_date: z
          .string()
          .datetime()
          .default(() => new Date().toISOString())
          .transform((d) => parseISO(d)),
        // limit: z.number().int().min(1).max(100).default(5),
        // page: z.number().int().min(1).default(1),
      })
    )
    .query(async ({ input, ctx }) => {
      const exams = await prisma.exam.findMany({
        where: {
          school_id: ctx.user.school_id,
          is_active: true,
          Tests: {
            // Fetch those exams, where there is at least
            // one Test that satisfies the following
            some: {
              AND: [
                // Class must match
                { class_id: input.class_id },
                // There is at least one test that will occur in the future
                {
                  date_of_exam: {
                    gte: input.after_date,
                  },
                },
                // Test is active
                { is_active: true },
              ],
              // Test should be for this section or for the whole class (section:null)
              OR: [{ section_id: input.section_id }, { section_id: null }],
            },
          },
        },
        include: {
          Tests: {
            where: {
              AND: [
                { class_id: input.class_id },
                {
                  OR: [{ section_id: input.section_id }, { section_id: null }],
                },
              ],
            },
            include: {
              Subjects: true,
            },
          },
        },
      });

      // Sort
      const sortedExams = _.sortBy(exams, (e) => {
        const [earliestTest] = _.sortBy(e.Tests, (t) => t.date_of_exam);
        if (earliestTest) {
          return earliestTest.date_of_exam;
        }
      });

      return sortedExams;
    }),
});

export default examRouter;
