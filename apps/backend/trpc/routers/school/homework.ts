import { parseISO } from "date-fns";
import { z } from "zod";
import { Prisma, UploadedFile } from "@prisma/client";
import { mapLimit } from "async";
import prisma from "../../../prisma";
import { t, authMiddleware, teacherMiddleware } from "../../trpc";
import { consumePermission } from "../../../utils/file.service";

const FilePermissionsSchema = z.object({
  permission_id: z.string().cuid(),
  file_name: z.string().optional(),
});

const homeworkRouter = t.router({
  fetchForSection: t.procedure
    .use(authMiddleware)
    .input(
      z.object({
        section_id: z.number().int(),
        class_id: z.number().int(),
        limit: z.number().int().min(1).max(20).default(10),
        page: z.number().int().min(1).default(1),
        after_due_date: z
          .string()
          .datetime()
          .transform((d) => parseISO(d))
          .optional(),
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
        due_date: z
          .string()
          .datetime()
          .transform((d) => parseISO(d))
          .optional(),
        filePermissions: FilePermissionsSchema.array().default([]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const files = await mapLimit<
        z.infer<typeof FilePermissionsSchema>,
        UploadedFile
      >(
        input.filePermissions,
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
          teacher_id: ctx.user.teacher_id,
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
    .input(z.object({}))
    .mutation(async ({ input, ctx }) => {
      //
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
          teacher_id: ctx.user.teacher_id,
          school_id: ctx.user.school_id,
        },
      });
    }),
});

export default homeworkRouter;
