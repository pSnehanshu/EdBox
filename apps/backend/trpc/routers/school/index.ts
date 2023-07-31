import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import prisma from "../../../prisma";
import { TRPCError } from "@trpc/server";
import messagingRouter from "./messaging";
import routineRouter from "./routine";
import attendanceRouter from "./attendance";
import classStdRouter from "./class-std";
import subjectRouter from "./subject";
import peopleRouter from "./people";
import examRouter from "./exam";
import attachmentsRouter from "./attachments";
import homeworkRouter from "./homework";
import groupRouter from "./group";

const schoolRouter = router({
  schoolBasicInfo: publicProcedure
    .input(
      z.object({
        schoolId: z.string().cuid(),
      }),
    )
    .query(async ({ input }) => {
      const school = await prisma.school.findUnique({
        where: {
          id: input.schoolId,
        },
        select: {
          id: true,
          name: true,
          is_active: true,
          website: true,
          app_android_package_name: true,
          app_google_services_json: true,
          app_ios_bundle_identifier: true,
          app_scheme: true,
          app_splash: true,
        },
      });

      if (!school || !school.is_active) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return school;
    }),
  schoolList: publicProcedure
    .input(
      z.object({
        search: z.string().trim().optional(),
        limit: z.number().int().min(1).max(30).default(10),
        page: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ input }) => {
      const schools = await prisma.school.findMany({
        where: {
          name: input.search
            ? {
                contains: input.search,
                mode: "insensitive",
              }
            : undefined,
          is_active: true,
        },
        select: {
          id: true,
          name: true,
          website: true,
        },
        take: input.limit + 1,
        skip: (input.page - 1) * input.limit,
        orderBy: {
          name: "asc",
        },
      });

      let hasMore = false;
      if (schools.length > input.limit) {
        hasMore = true;
        schools.pop();
      }

      return { schools, hasMore };
    }),
  messaging: messagingRouter,
  group: groupRouter,
  routine: routineRouter,
  attendance: attendanceRouter,
  class: classStdRouter,
  subject: subjectRouter,
  people: peopleRouter,
  exam: examRouter,
  attachment: attachmentsRouter,
  homework: homeworkRouter,
});

export default schoolRouter;
