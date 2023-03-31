import { z } from "zod";
import type { Prisma } from "@prisma/client";
import prisma from "../../../prisma";
import { authMiddleware, t } from "../../trpc";

const classStdRouter = t.router({
  fetchSectionStudents: t.procedure
    .use(authMiddleware)
    .input(
      z.object({
        sectionId: z.number().int(),
        classId: z.number().int(),
        limit: z.number().int().min(1).max(100).default(20),
        /** Roll number */
        cursor: z.number().int().nullish(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Fetch batch via section
      const section = await prisma.classSection.findUnique({
        where: {
          numeric_id_class_id_school_id: {
            numeric_id: input.sectionId,
            class_id: input.classId,
            school_id: ctx.user.school_id,
          },
        },
        select: {
          Class: {
            select: {
              Batch: {
                select: {
                  numeric_id: true,
                },
              },
            },
          },
        },
      });

      const isValid = section && section.Class.Batch;

      if (!isValid) {
        return { students: [], cursor: undefined, total: 0 };
      }

      // Now fetch students via batch
      const batchId = section.Class.Batch?.numeric_id!;

      const where: Prisma.StudentWhereInput = {
        school_id: ctx.user.school_id,
        current_batch_num: batchId,
        section: input.sectionId,
      };

      const [students, total] = await Promise.all([
        prisma.student.findMany({
          where,
          include: {
            User: true,
          },
          take: input.limit + 1,
          cursor:
            typeof input.cursor === "number"
              ? {
                  roll_num_section_current_batch_num: {
                    current_batch_num: batchId,
                    roll_num: input.cursor,
                    section: input.sectionId,
                  },
                }
              : undefined,
          orderBy: {
            roll_num: "asc",
          },
        }),
        prisma.student.count({
          where,
        }),
      ]);

      // Check has more
      let cursor: number | undefined = undefined;
      if (students.length > input.limit) {
        const next = students.pop();
        cursor = next?.roll_num;
      }

      return { students, total, cursor };
    }),
  fetchClassesAndSections: t.procedure
    .input(
      z.object({
        schoolId: z.string().cuid(),
      }),
    )
    .query(async ({ input }) => {
      const classes = await prisma.classStd.findMany({
        where: {
          school_id: input.schoolId,
        },
        include: {
          Sections: {
            orderBy: {
              numeric_id: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      });

      return classes;
    }),
});

export default classStdRouter;
