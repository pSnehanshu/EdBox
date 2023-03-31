import { parseISO } from "date-fns";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import prisma from "../../../prisma";
import { t, authMiddleware, teacherMiddleware } from "../../trpc";

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
    .input(z.object({}))
    .mutation(async ({ input, ctx }) => {
      //
    }),
  update: t.procedure
    .use(teacherMiddleware)
    .input(z.object({}))
    .mutation(async ({ input, ctx }) => {
      //
    }),
  delete: t.procedure
    .use(teacherMiddleware)
    .input(z.object({}))
    .mutation(async ({ input, ctx }) => {
      //
    }),
});

export default homeworkRouter;
