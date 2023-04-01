import { parseISO } from "date-fns";
import { z } from "zod";
import { Prisma, UploadedFile } from "@prisma/client";
import { mapLimit } from "async";
import prisma from "../../../prisma";
import {
  t,
  authMiddleware,
  teacherMiddleware,
  studentMiddleware,
} from "../../trpc";
import { consumePermission } from "../../../utils/file.service";
import { TRPCError } from "@trpc/server";

const FilePermissionsSchema = z.object({
  permission_id: z.string().cuid(),
  file_name: z.string().optional(),
});

const DateSchema = z
  .string()
  .datetime()
  .transform((d) => parseISO(d));

const homeworkRouter = t.router({
  fetchForSection: t.procedure
    .use(authMiddleware)
    .input(
      z.object({
        section_id: z.number().int(),
        class_id: z.number().int(),
        limit: z.number().int().min(1).max(20).default(10),
        page: z.number().int().min(1).default(1),
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

      const homeworks = await prisma.homework.findMany({
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
          Attachments: true,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });

      return homeworks;
    }),
  fetchForTeacher: t.procedure
    .use(teacherMiddleware)
    .input(
      z.object({
        limit: z.number().int().min(1).max(20).default(10),
        page: z.number().int().min(1).default(1),
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

      const homeworks = await prisma.homework.findMany({
        where,
        orderBy: {
          due_date: "asc",
        },
        include: {
          Subject: true,
          Attachments: true,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });

      return homeworks;
    }),
  create: t.procedure
    .use(teacherMiddleware)
    .input(
      z.object({
        text: z.string().optional(),
        section_id: z.number().int(),
        class_id: z.number().int(),
        subject_id: z.string().cuid(),
        due_date: DateSchema.optional(),
        file_permissions: FilePermissionsSchema.array().default([]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const files = await mapLimit<
        z.infer<typeof FilePermissionsSchema>,
        UploadedFile
      >(
        input.file_permissions,
        2,
        function ({ permission_id, file_name }, callback) {
          consumePermission(permission_id, ctx.user.id, file_name)
            .then((file) => callback(null, file))
            .catch((err) => callback(err));
        },
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

      return id;
    }),
  update: t.procedure
    .use(teacherMiddleware)
    .input(
      z.object({
        homework_id: z.string().cuid(),
        text: z.string().optional(),
        due_date: DateSchema.optional(),
        remove_attachments: z.string().cuid().array().optional(),
        new_file_permissions: FilePermissionsSchema.array().default([]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const files = await mapLimit<
        z.infer<typeof FilePermissionsSchema>,
        UploadedFile
      >(
        input.new_file_permissions,
        2,
        function ({ permission_id, file_name }, callback) {
          consumePermission(permission_id, ctx.user.id, file_name)
            .then((file) => callback(null, file))
            .catch((err) => callback(err));
        },
      );

      const { count } = await prisma.homework.updateMany({
        where: {
          id: input.homework_id,
          teacher_id: ctx.teacher.id,
          school_id: ctx.user.school_id,
        },
        data: {
          text: input.text,
          due_date: input.due_date,
        },
      });

      if (count < 1) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

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
            OR: input.remove_attachments.map((fileId) => ({
              file_id: fileId,
            })),
            homework_id: input.homework_id,
          },
        });
    }),
  delete: t.procedure
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
  submitAnswer: t.procedure
    .use(studentMiddleware)
    .input(
      z.object({
        homework_id: z.string().cuid(),
        text: z.string().optional(),
        file_permissions: FilePermissionsSchema.array().default([]),
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
      const files = await mapLimit<
        z.infer<typeof FilePermissionsSchema>,
        UploadedFile
      >(
        input.file_permissions,
        2,
        function ({ permission_id, file_name }, callback) {
          consumePermission(permission_id, ctx.user.id, file_name)
            .then((file) => callback(null, file))
            .catch((err) => callback(err));
        },
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
});

export default homeworkRouter;
