import type { Prisma } from "@prisma/client";
import _ from "lodash";
import { StaticRole } from "schooltalk-shared/misc";
import { z } from "zod";
import prisma from "../../../prisma";
import { principalProcedure, router } from "../../trpc";

const peopleRouter = router({
  fetchPeople: principalProcedure
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
        role: z.nativeEnum(StaticRole),
      })
    )
    .query(async ({ input, ctx }) => {
      // Determine role based WHERE based on input.role
      const where: Prisma.UserWhereInput = {};
      switch (input.role) {
        case StaticRole.teacher:
          where.teacher_id = {
            not: null,
          };
          break;
        case StaticRole.student:
          where.student_id = {
            not: null,
          };
          break;
        case StaticRole.parent:
          where.parent_id = {
            not: null,
          };
          break;
        case StaticRole.staff:
          where.staff_id = {
            not: null,
          };
          where.Staff = {
            role: {
              notIn: ["principal", "vice_principal"],
            },
          };
          break;
        case StaticRole.vice_principal:
        case StaticRole.principal:
          where.staff_id = {
            not: null,
          };
          where.Staff = {
            role: {
              in: ["principal", "vice_principal"],
            },
          };
          break;
        default:
          where.student_id = null;
          where.teacher_id = null;
          where.parent_id = null;
          where.staff_id = null;
      }

      const users = await prisma.user.findMany({
        where: {
          ...where,
          school_id: ctx.user.school_id,
          is_active: true,
        },
        include: {
          Teacher: true,
          Student: true,
          Parent: true,
          Staff: true,
        },
      });

      return users.map((u) => _.omit(u, ["password", "otp", "otp_expiry"]));
    }),
});

export default peopleRouter;
