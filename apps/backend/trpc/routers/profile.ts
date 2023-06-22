import { Gender, Salutation, BloodGroup } from "@prisma/client";
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
        date_of_birth: z.string().datetime().optional(),
        salutation: z.nativeEnum(Salutation).optional(),
        blood_group: z.nativeEnum(BloodGroup).optional(),
        address: z
          .object({
            line1: z.string().trim(),
            line2: z.string().trim().optional(),
            town_or_village: z.string().trim(),
            city: z.string().trim().optional(),
            state: z.string().trim().optional(),
            pin: z.number().int().min(100000).max(999999).optional(),
            country: z.string().trim(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          name: input.name,
          gender: input.gender,
          date_of_birth: input.date_of_birth,
          salutation: input.salutation,
          blood_group: input.blood_group,
          addr_l1: input.address?.line1,
          addr_l2: input.address?.line2,
          addr_town_vill: input.address?.town_or_village,
          addr_city: input.address?.city,
          addr_state: input.address?.state,
          addr_pin: input.address?.pin,
          addr_country: input.address?.country,
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
        include: {
          Student: true,
          Teacher: true,
          Parent: true,
          Staff: true,
        },
      });

      if (!user || user.school_id !== ctx.user.school_id)
        throw new TRPCError({ code: "NOT_FOUND" });

      return _.omit(user, ["password", "otp", "otp_expiry", "School"]);
    }),
});

export default profileRouter;
