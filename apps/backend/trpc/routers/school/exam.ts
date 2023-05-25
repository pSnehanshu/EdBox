import { TRPCError } from "@trpc/server";
import { parseISO } from "date-fns";
import _ from "lodash";
import { StaticRole, examTestSchema } from "schooltalk-shared/misc";
import { z } from "zod";
import prisma from "../../../prisma";
import { authMiddleware, roleMiddleware, t } from "../../trpc";

const dateStringSchema = z
  .string()
  .datetime()
  .default(() => new Date().toISOString())
  .transform((d) => parseISO(d));

type ExamTest = NonNullable<
  Awaited<
    ReturnType<
      typeof prisma.examTest.findFirst<{
        include: {
          Exam: {
            include: {
              Tests: {
                include: {
                  Subjects: {
                    include: {
                      Subject: true;
                    };
                  };
                };
              };
            };
          };
          Subjects: {
            include: {
              Subject: true;
            };
          };
        };
      }>
    >
  >
>;

type IndependentTest = Omit<ExamTest, "Exam">;

type ExamItem =
  | {
      type: "exam";
      item: NonNullable<ExamTest["Exam"]>;
    }
  | {
      type: "test";
      item: IndependentTest;
    };

const examRouter = t.router({
  getTestInfo: t.procedure
    .use(authMiddleware)
    .input(
      z.object({
        testId: z.string().cuid(),
        periodsFilter: z
          .object({
            class_id: z.number().int(),
            section_id: z.number().int().optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const test = await prisma.examTest.findUnique({
        where: { id: input.testId },
        include: {
          Exam: true,
          Subjects: {
            include: {
              Subject: {
                include: {
                  Periods: {
                    where: {
                      school_id: ctx.user.school_id,
                      class_id: input.periodsFilter?.class_id,
                      section_id: input.periodsFilter?.section_id,
                    },
                    include: {
                      Teacher: {
                        include: {
                          User: true,
                        },
                      },
                      Class: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!test || test.school_id !== ctx.user.school_id)
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
      ]),
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
          total_marks: input.total_marks,
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
      ]),
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
            total_marks: true,
          })
          .partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // First fetch all subjects
      const test = await prisma.examTest.findFirst({
        where: {
          id: input.id,
          school_id: ctx.user.school_id,
        },
        include: {
          Subjects: true,
        },
      });

      if (!test || test.school_id !== ctx.user.school_id)
        throw new TRPCError({ code: "NOT_FOUND" });

      // Perform update inside a transaction
      await prisma.$transaction(async (tx) => {
        // Update general details
        await tx.examTest.update({
          where: { id: test.id },
          data: {
            subject_name: input.data.name,
            date_of_exam: input.data.date,
            duration_minutes: input.data.duration_minutes,
            total_marks: input.data.total_marks,
          },
        });

        // If no updates to subjects, skip
        if (!input.data.subjectIds || input.data.subjectIds.length < 1) return;

        // Remove subjects that are not included in input
        const subjectsToRemove = test.Subjects.filter(
          (s) => !input.data.subjectIds?.includes(s.subject_id),
        );

        await tx.testSubjectMapping.deleteMany({
          where: {
            test_id: test.id,
            subject_id: {
              in: subjectsToRemove.map((s) => s.subject_id),
            },
          },
        });

        // Attach the subjects not attached already
        const subjectsToAdd = input.data.subjectIds.filter(
          (id) => test.Subjects.findIndex((s) => s.subject_id === id) < 0,
        );

        await tx.testSubjectMapping.createMany({
          data: subjectsToAdd.map((subject_id) => ({
            subject_id,
            test_id: test.id,
          })),
          skipDuplicates: true,
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
      ]),
    )
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await prisma.examTest.deleteMany({
        where: {
          id: input.id,
          school_id: ctx.user.school_id,
        },
      });
    }),
  getExamInfo: t.procedure
    .use(authMiddleware)
    .input(
      z.object({
        examId: z.string().cuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const exam = await prisma.exam.findFirst({
        where: {
          id: input.examId,
          school_id: ctx.user.school_id,
        },
        include: {
          Tests: {
            orderBy: {
              date_of_exam: "asc",
            },
            include: {
              Subjects: {
                include: {
                  Subject: true,
                },
              },
            },
          },
        },
      });

      if (!exam)
        throw new TRPCError({
          code: "NOT_FOUND",
        });

      return exam;
    }),
  createExam: t.procedure
    .use(
      roleMiddleware([
        StaticRole.principal,
        StaticRole.vice_principal,
        StaticRole.teacher,
        StaticRole.staff,
      ]),
    )
    .input(
      z.object({
        name: z.string().max(100),
        tests: examTestSchema.array().default([]),
      }),
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
              total_marks: test.total_marks,
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
      ]),
    )
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().max(100).optional(),
      }),
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
      }),
    )
    .query(async ({ input, ctx }): Promise<ExamItem[]> => {
      const student = await prisma.student.findUnique({
        where: {
          id: ctx.user.student_id!,
        },
        include: {
          CurrentBatch: true,
        },
      });

      if (!student || !student.CurrentBatch?.class_id)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });

      const tests: ExamTest[] = await prisma.examTest.findMany({
        where: {
          school_id: ctx.user.school_id,
          class_id: student.CurrentBatch?.class_id,
          date_of_exam: { gte: input.after_date },
          OR: [{ section_id: student.section }, { section_id: null }],
          AND: [
            {
              OR: [{ exam_id: null }],
            },
          ],
        },
        include: {
          Exam: {
            include: {
              Tests: {
                where: {
                  class_id: student.CurrentBatch.class_id,
                  OR: [{ section_id: student.section }, { section_id: null }],
                },
                orderBy: {
                  date_of_exam: "asc",
                },
                include: {
                  Subjects: {
                    include: {
                      Subject: true,
                    },
                  },
                },
              },
            },
          },
          Subjects: {
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
        "id",
      );

      // Filter out the independent tests (tests not under any exam)
      const independentTests = tests.filter((t) => !t.Exam);

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
  fetchExamsAndTestsForTeacher: t.procedure
    .use(roleMiddleware([StaticRole.teacher]))
    .input(
      z.object({
        after_date: dateStringSchema,
        limit: z.number().int().min(1).max(100).default(10),
        page: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ input, ctx }): Promise<ExamItem[]> => {
      const tests: ExamTest[] = await prisma.examTest.findMany({
        where: {
          school_id: ctx.user.school_id,
          Subjects: {
            some: {
              Subject: {
                Periods: {
                  some: {
                    teacher_id: ctx.user.Teacher?.id,
                  },
                },
              },
            },
          },
        },
        include: {
          Exam: {
            include: {
              Tests: {
                where: {
                  Subjects: {
                    some: {
                      Subject: {
                        Periods: {
                          some: {
                            teacher_id: ctx.user.Teacher?.id,
                          },
                        },
                      },
                    },
                  },
                },
                orderBy: {
                  date_of_exam: "asc",
                },
                include: {
                  Subjects: {
                    include: {
                      Subject: true,
                    },
                  },
                },
              },
            },
          },
          Subjects: {
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
        "id",
      );

      // Filter out the independent tests (tests not under any exam)
      const independentTests = tests.filter((t) => !t.Exam);

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
