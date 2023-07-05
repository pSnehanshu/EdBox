import { Gender, Salutation, BloodGroup } from "@prisma/client";
import _ from "lodash";
import { FilePermissionsInputSchema } from "schooltalk-shared/misc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "../../prisma";
import { router, protectedProcedure } from "../trpc";
import { consumePermission, deleteFile } from "../../utils/file.service";
import { generateOTP } from "../../utils/auth-utils";
import { addMinutes, isFuture, isPast } from "date-fns";
import { sendSMS } from "../../utils/sms.service";
import config from "../../config";

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
  changePhoneRequestOTP: protectedProcedure
    .input(
      z.object({
        isd: z.number().int().default(91),
        phoneNumber: z
          .string()
          .regex(/^\d+$/, "Phone number must be a 10 digit number"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check phone number isn't used
      const existing = await prisma.user.count({
        where: {
          phone: input.phoneNumber,
          phone_isd_code: input.isd,
        },
      });

      if (existing > 0)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Phone number already in use",
        });

      // Fetch current user
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          SensitiveInfo: true,
          phone: true,
          phone_isd_code: true,
        },
      });

      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Generate OTP and send
      let oldOTP: string;
      let newOTP: string;
      const expiry = addMinutes(new Date(), 15);
      if (
        user.SensitiveInfo?.change_ph_otp_expiry &&
        isFuture(user.SensitiveInfo.change_ph_otp_expiry)
      ) {
        oldOTP = user.SensitiveInfo.change_ph_otp_old ?? generateOTP();
        newOTP = user.SensitiveInfo.change_ph_otp_new ?? generateOTP();
      } else {
        oldOTP = generateOTP();
        newOTP = generateOTP();
      }

      // Store in DB
      await prisma.$transaction([
        prisma.userSensitiveInfo.upsert({
          where: { user_id: user.id },
          update: {
            change_ph_otp_old: oldOTP,
            change_ph_otp_new: newOTP,
            change_ph_otp_expiry: expiry,
          },
          create: {
            change_ph_otp_old: oldOTP,
            change_ph_otp_new: newOTP,
            change_ph_otp_expiry: expiry,
            user_id: user.id,
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: {
            pending_phone: input.phoneNumber,
            pending_phone_isd_code: input.isd,
          },
        }),
      ]);

      // Send SMS to old number
      if (user.phone)
        await sendSMS(
          { isd: user.phone_isd_code, number: user.phone },
          "change_phone_otp_old",
          {
            otp: oldOTP,
            newphone: `+${input.isd}${input.phoneNumber}`,
          },
        );

      // Send SMS to new number
      await sendSMS(
        { isd: input.isd, number: input.phoneNumber },
        "change_phone_otp_new",
        { otp: newOTP },
      );

      return { expiry };
    }),
  changePhoneSumbitOTP: protectedProcedure
    .input(
      z.object({
        new_otp: z.string().regex(/^\d+$/).length(config.OTP_LENGTH),
        // This is optional because sometimes there may not be an old phone number at all
        old_otp: z.string().regex(/^\d+$/).length(config.OTP_LENGTH).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        phone: old_phone,
        pending_phone,
        pending_phone_isd_code,
        SensitiveInfo,
      } = await prisma.user.findUniqueOrThrow({
        where: { id: ctx.user.id },
        select: {
          phone: true,
          pending_phone: true,
          pending_phone_isd_code: true,
          SensitiveInfo: true,
        },
      });

      if (!pending_phone)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No pending phone number change request found",
        });

      // Check if expired
      if (
        !SensitiveInfo?.change_ph_otp_expiry ||
        isPast(SensitiveInfo.change_ph_otp_expiry)
      )
        throw new TRPCError({ code: "FORBIDDEN", message: "OTP expired" });

      if (old_phone && SensitiveInfo.change_ph_otp_old !== input.old_otp)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Old phone number OTP mismatch",
        });

      if (SensitiveInfo.change_ph_otp_new !== input.new_otp)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "New phone number OTP mismatch",
        });

      // All OK
      await prisma.$transaction([
        prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            phone: pending_phone,
            phone_isd_code: pending_phone_isd_code,
            pending_phone: null,
          },
        }),
        prisma.userSensitiveInfo.update({
          where: { user_id: ctx.user.id },
          data: {
            change_ph_otp_new: null,
            change_ph_otp_old: null,
            change_ph_otp_expiry: null,
          },
        }),
      ]);
    }),
});

export default profileRouter;
