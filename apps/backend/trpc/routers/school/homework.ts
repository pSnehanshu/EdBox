import { TRPCError } from "@trpc/server";
import { isPast, parseISO } from "date-fns";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { FilePermissionsInputSchema } from "schooltalk-shared/misc";
import prisma from "../../../prisma";
import { consumeMultiplePermissions } from "../../../utils/file.service";
import {
  router,
  procedure,
  protectedProcedure,
  teacherMiddleware,
  studentMiddleware,
} from "../../trpc";

const DateSchema = z
  .string()
  .datetime()
  .transform((d) => parseISO(d));

const homeworkRouter = router({
  fetchForSection: protectedProcedure
    .input(
      z.object({
        section_id: z.number().int(),
        class_id: z.number().int(),
        limit: z.number().int().min(1).max(20).default(10),
        cursor: z.number().int().min(1).default(1),
        after_due_date: DateSchema.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const where: Prisma.HomeworkWhereInput = {
        section_id: input.section_id,
        class_id: input.class_id,
        school_id: ctx.user.school_id,
      };

      if (input.after_due_date) {
        where.OR = [
          { due_date: null },
          {
            due_date: {
              gte: input.after_due_date,
            },
          },
        ];
      }

      const [homeworks, total] = await Promise.all([
        prisma.homework.findMany({
          where,
          orderBy: {
            due_date: "asc",
          },
          include: {
            Subject: true,
            Teacher: {
              include: {
                User: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            Attachments: {
              include: {
                File: true,
              },
            },
            Class: true,
            Section: true,
          },
          take: input.limit + 1,
          skip: (input.cursor - 1) * input.limit,
        }),
        prisma.homework.count({ where }),
      ]);

      let nextCursor: number | undefined = undefined;
      if (homeworks.length > input.limit) {
        nextCursor = input.cursor + 1;
        homeworks.pop();
      }

      return { data: homeworks, total, nextCursor };
    }),
  fetchForTeacher: procedure
    .use(teacherMiddleware)
    .input(
      z.object({
        limit: z.number().int().min(1).max(20).default(10),
        cursor: z.number().int().min(1).default(1),
        after_due_date: DateSchema.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const where: Prisma.HomeworkWhereInput = {
        teacher_id: ctx.teacher.id,
        school_id: ctx.user.school_id,
      };

      if (input.after_due_date) {
        where.OR = [
          { due_date: null },
          {
            due_date: {
              gte: input.after_due_date,
            },
          },
        ];
      }

      const [homeworks, total] = await Promise.all([
        prisma.homework.findMany({
          where,
          orderBy: {
            due_date: "asc",
          },
          include: {
            Subject: true,
            Teacher: {
              include: {
                User: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            Attachments: {
              include: {
                File: true,
              },
            },
            Class: true,
            Section: true,
          },
          take: input.limit + 1,
          skip: (input.cursor - 1) * input.limit,
        }),
        prisma.homework.count({ where }),
      ]);

      let nextCursor: number | undefined = undefined;
      if (homeworks.length > input.limit) {
        nextCursor = input.cursor + 1;
        homeworks.pop();
      }

      return { data: homeworks, total, nextCursor };
    }),
  fetchHomework: protectedProcedure
    .input(
      z.object({
        homework_id: z.string().cuid(),
      }),
    )
    .query(({ input, ctx }) => {
      return prisma.homework.findFirstOrThrow({
        where: {
          id: input.homework_id,
          school_id: ctx.user.school_id,
        },
        include: {
          Section: true,
          Class: true,
          Subject: true,
          Attachments: {
            include: {
              File: true,
            },
          },
          Teacher: {
            include: {
              User: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    }),
  create: procedure
    .use(teacherMiddleware)
    .input(
      z.object({
        text: z.string().optional(),
        section_id: z.number().int(),
        class_id: z.number().int(),
        subject_id: z.string().cuid(),
        due_date: DateSchema.optional(),
        file_permissions: FilePermissionsInputSchema.array().default([]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const files = await consumeMultiplePermissions(
        input.file_permissions,
        ctx.user.id,
      );

      const { id } = await prisma.homework.create({
        data: {
          section_id: input.section_id,
          class_id: input.class_id,
          school_id: ctx.user.school_id,
          subject_id: input.subject_id,
          due_date: input.due_date,
          teacher_id: ctx.teacher.id,
          text: input.text,
          Attachments: {
            createMany: {
              data: files.map((file) => ({
                file_id: file.id,
              })),
              skipDuplicates: true,
            },
          },
        },
        select: {
          id: true,
        },
      });

      return { id };
    }),
  update: procedure
    .use(teacherMiddleware)
    .input(
      z.object({
        homework_id: z.string().cuid(),
        text: z.string().optional(),
        section_id: z.number().int().optional(),
        class_id: z.number().int().optional(),
        subject_id: z.string().cuid().optional(),
        due_date: DateSchema.optional(),
        remove_attachments: z.string().cuid().array().optional(),
        new_file_permissions: FilePermissionsInputSchema.array().default([]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const homework = await prisma.homework.findUnique({
        where: {
          id: input.homework_id,
        },
      });

      if (
        !homework ||
        homework.teacher_id !== ctx.teacher.id ||
        homework.school_id !== ctx.user.school_id
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      await prisma.homework.update({
        where: { id: input.homework_id },
        data: {
          text: input.text,
          due_date: input.due_date,
          class_id: input.class_id,
          section_id: input.section_id,
          subject_id: input.subject_id,
        },
      });

      const files = await consumeMultiplePermissions(
        input.new_file_permissions,
        ctx.user.id,
      );

      // New attachements
      await prisma.homeworkAttachment.createMany({
        data: files.map((file) => ({
          file_id: file.id,
          homework_id: input.homework_id,
        })),
        skipDuplicates: true,
      });

      // Remove attachements
      if (input.remove_attachments)
        await prisma.homeworkAttachment.deleteMany({
          where: {
            file_id: {
              in: input.remove_attachments,
            },
            homework_id: input.homework_id,
          },
        });
    }),
  delete: procedure
    .use(teacherMiddleware)
    .input(
      z.object({
        homework_id: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await prisma.homework.deleteMany({
        where: {
          id: input.homework_id,
          teacher_id: ctx.teacher.id,
          school_id: ctx.user.school_id,
        },
      });
    }),
  fetchSubmissions: procedure
    .use(teacherMiddleware)
    .input(
      z.object({
        homework_id: z.string().cuid(),
        limit: z.number().int().min(1).max(20).default(10),
        page: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const homework = await prisma.homework.findFirstOrThrow({
        where: {
          id: input.homework_id,
          school_id: ctx.user.school_id,
          teacher_id: ctx.teacher.id,
        },
        select: { id: true },
      });

      const where: Prisma.HomeworkSubmissionWhereInput = {
        homework_id: homework.id,
      };

      const [submissions, total] = await Promise.all([
        prisma.homeworkSubmission.findMany({
          where,
          orderBy: {
            created_at: "desc",
          },
          include: {
            Student: {
              include: {
                User: true,
              },
            },
            Attachments: {
              include: {
                File: true,
              },
            },
          },
          take: input.limit,
          skip: (input.page - 1) * input.limit,
        }),
        prisma.homeworkSubmission.count({ where }),
      ]);

      return { data: submissions, total };
    }),
  createSubmission: procedure
    .use(studentMiddleware)
    .input(
      z.object({
        homework_id: z.string().cuid(),
        text: z.string().optional(),
        file_permissions: FilePermissionsInputSchema.array().default([]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const student = await prisma.student.findUniqueOrThrow({
        where: {
          id: ctx.student.id,
        },
        select: {
          section: true,
          CurrentBatch: {
            select: {
              class_id: true,
            },
          },
        },
      });

      if (
        typeof student.CurrentBatch?.class_id !== "number" ||
        typeof student.section !== "number"
      )
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Student is not part of any class or section",
        });

      const homework = await prisma.homework.findFirstOrThrow({
        where: {
          id: input.homework_id,
          school_id: ctx.user.school_id,
          class_id: student.CurrentBatch.class_id,
          section_id: student.section,
        },
        include: {
          Submissions: {
            where: {
              student_id: ctx.student.id,
            },
          },
        },
      });

      // Check if student has already submitted
      if (homework.Submissions.length > 0)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Student has already submitted to this homework",
        });

      // All ok!

      // Consume the files
      const files = await consumeMultiplePermissions(
        input.file_permissions,
        ctx.user.id,
      );

      // Create the submission
      const { id } = await prisma.homeworkSubmission.create({
        data: {
          homework_id: input.homework_id,
          student_id: ctx.student.id,
          text: input.text,
          Attachments: {
            createMany: {
              data: files.map((file) => ({
                file_id: file.id,
              })),
              skipDuplicates: true,
            },
          },
        },
        select: {
          id: true,
        },
      });

      return id;
    }),
  updateSubmission: procedure
    .use(studentMiddleware)
    .input(
      z.object({
        submission_id: z.string().cuid(),
        text: z.string().optional(),
        remove_attachments: z.string().cuid().array().optional(),
        new_file_permissions: FilePermissionsInputSchema.array().default([]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const submission = await prisma.homeworkSubmission.findFirstOrThrow({
        where: {
          id: input.submission_id,
          student_id: ctx.student.id,
        },
        include: {
          Homework: true,
        },
      });

      // Don't allow update if due date has passed
      if (submission.Homework.due_date && isPast(submission.Homework.due_date))
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Can't update after due date has passed",
        });

      // Update
      await prisma.homeworkSubmission.update({
        where: {
          id: input.submission_id,
        },
        data: {
          text: input.text,
        },
      });

      // Handle attachments
      const files = await consumeMultiplePermissions(
        input.new_file_permissions,
        ctx.user.id,
      );

      // New attachements
      await prisma.homeworkSubmissionAttachment.createMany({
        data: files.map((file) => ({
          file_id: file.id,
          submission_id: input.submission_id,
        })),
        skipDuplicates: true,
      });

      // Remove attachements
      if (input.remove_attachments)
        await prisma.homeworkSubmissionAttachment.deleteMany({
          where: {
            file_id: {
              in: input.remove_attachments,
            },
            submission_id: input.submission_id,
          },
        });
    }),
});

export default homeworkRouter;
