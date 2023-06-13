import { Gender } from "@prisma/client";
import _ from "lodash";
import { FilePermissionsInputSchema } from "schooltalk-shared/misc";
import { z } from "zod";
import prisma from "../../prisma";
import { router, protectedProcedure } from "../trpc";
import { consumePermission, deleteFile } from "../../utils/file.service";
import { TRPCError } from "@trpc/server";

const profileRouter = router({
  me: protectedProcedure.query(({ ctx }) =>
    _.omit(ctx.user, ["password", "otp", "otp_expiry", "School"]),
  ),
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().max(50).min(1).optional(),
        gender: z.nativeEnum(Gender).optional(),
        avatar_file_permission: FilePermissionsInputSchema.optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          name: input.name,
          gender: input.gender,
        },
      });

      if (input.avatar_file_permission) {
        // Consume the file
        const file = await consumePermission(
          input.avatar_file_permission.permission_id,
          ctx.user.id,
          input.avatar_file_permission.file_name,
        );

        // Ensure this is an image
        if (!file.mime?.startsWith("image/")) {
          // First delete the file
          deleteFile(file).catch((err) =>
            console.error(
              `Failed to delete file ID: ${file.id}, key: ${file.s3key}`,
              err,
            ),
          );

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Uploaded file is not an image",
          });
        }

        await prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            avatar_id: file.id,
          },
        });
      }

      return _.omit(user, ["password", "otp", "otp_expiry", "School"]);
    }),
  getUserProfile: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          name: true,
          gender: true,
          school_id: true,
          avatar_id: true,
          student_id: true,
          Student: true,
          teacher_id: true,
          Teacher: true,
          parent_id: true,
          Parent: true,
          staff_id: true,
          Staff: true,
        },
      });

      if (!user || user.school_id !== ctx.user.school_id)
        throw new TRPCError({ code: "NOT_FOUND" });

      return user;
    }),
});

export default profileRouter;
