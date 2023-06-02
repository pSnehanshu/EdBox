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

      return _.omit(user, ["password", "otp", "otp_expiry", "School"]);
    }),
  changeAvatar: protectedProcedure
    .input(
      z.object({
        file_permission: FilePermissionsInputSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Consume the file
      const file = await consumePermission(
        input.file_permission.permission_id,
        ctx.user.id,
        input.file_permission.file_name,
      );

      // Ensure this is an image
      if (!file.mime?.startsWith("image/")) {
        // First delete the file
        deleteFile(file.id).catch((err) =>
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

      return file;
    }),
});

export default profileRouter;
