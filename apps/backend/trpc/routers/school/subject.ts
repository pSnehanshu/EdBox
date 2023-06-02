import { z } from "zod";
import prisma from "../../../prisma";
import { router, procedure, protectedProcedure } from "../../trpc";

const subjectRouter = router({
  fetchSubjects: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        order: z
          .object({
            by: z.enum(["created_at", "name"]),
            dir: z.enum(["asc", "desc"]).default("asc"),
          })
          .default({
            by: "name",
          }),
      }),
    )
    .query(async ({ input, ctx }) => {
      const subjects = await prisma.subject.findMany({
        where: {
          school_id: ctx.user.school_id,
        },
        include: {
          Periods: {
            select: {
              Class: true,
            },
          },
        },
        orderBy: {
          [input.order.by]: input.order.dir,
        },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });

      return subjects;
    }),
});

export default subjectRouter;
