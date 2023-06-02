import { PushTokenType, User } from "@prisma/client";
import { router, procedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import prisma from "../../prisma";
import { TRPCError } from "@trpc/server";
import { addMinutes, addMonths, isFuture, isPast } from "date-fns";
import _ from "lodash";
import CONFIG from "../../config";
import { sendSMS } from "../../utils/sms.service";

function generateUserOTP(user: Pick<User, "otp" | "otp_expiry">) {
  // Generate OTP
  let otp = (
    Math.floor(Math.random() * 9 * 10 ** (CONFIG.OTP_LENGTH - 1)) +
    10 ** (CONFIG.OTP_LENGTH - 1)
  ).toString();

  if (user.otp && user.otp_expiry && isFuture(user.otp_expiry)) {
    // An OTP exists, reuse it
    otp = user.otp;
  }

  const expiry = addMinutes(new Date(), 10);

  return { otp, expiry };
}

const authRouter = router({
  requestEmailLoginOTP: procedure
    .input(
      z.object({
        email: z.string().email(),
        schoolId: z.string().cuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email_school_id: {
            email: input.email,
            school_id: input.schoolId,
          },
        },
        select: {
          id: true,
          otp: true,
          otp_expiry: true,
        },
      });

      // Generate OTP
      const { otp, expiry } = generateUserOTP(user);

      await prisma.user.update({
        where: { id: user.id },
        data: { otp, otp_expiry: expiry },
      });

      // TODO: Send the email with the OTP
      console.log(input.email, { otp, expiry });

      return { userId: user.id };
    }),
  requestPhoneNumberOTP: procedure
    .input(
      z.object({
        isd: z.number().int().default(91),
        phoneNumber: z
          .string()
          .regex(/^\d+$/, "Phone number must be a 10 digit number"),
        schoolId: z.string().cuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          phone_isd_code_phone_school_id: {
            phone: input.phoneNumber,
            phone_isd_code: input.isd,
            school_id: input.schoolId,
          },
        },
        select: {
          id: true,
          otp: true,
          otp_expiry: true,
          School: {
            select: {
              name: true,
            },
          },
        },
      });

      // User exists, and is active

      // Generate OTP
      const { otp, expiry } = generateUserOTP(user);

      await prisma.user.update({
        where: { id: user.id },
        data: { otp, otp_expiry: expiry },
      });

      // Send the SMS with the OTP
      // TODO: Add a limit or budget will be exhausted
      await sendSMS(
        { isd: input.isd, number: input.phoneNumber },
        "login_otp_self",
        { otp, school: user.School.name },
      );

      return { userId: user.id };
    }),
  submitLoginOTP: procedure
    .input(
      z.object({
        otp: z.string().regex(/^\d+$/).length(CONFIG.OTP_LENGTH),
        userId: z.string().cuid(),
        schoolId: z.string().cuid(),
        pushToken: z
          .object({
            token: z.string(),
            type: z.nativeEnum(PushTokenType),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Fetch the user object
      const user = await prisma.user.findUnique({
        where: {
          id: input.userId,
        },
        select: {
          id: true,
          otp: true,
          otp_expiry: true,
          school_id: true,
        },
      });

      if (!user || user.school_id !== input.schoolId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (user.otp !== input.otp) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (!user.otp_expiry || isPast(user.otp_expiry)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // OTP correct, create session and remove otp
      const session = await prisma.$transaction(async (tx) => {
        // Create the session
        const s = await tx.loginSession.create({
          data: {
            expiry_date: addMonths(new Date(), 2),
            user_id: user.id,
          },
        });

        // Remove OTP
        await tx.user.update({
          where: { id: user.id },
          data: {
            otp: null,
            otp_expiry: null,
          },
        });

        if (input.pushToken) {
          // Delete existing records of the same token
          await tx.pushToken.deleteMany({
            where: {
              token: input.pushToken.token,
            },
          });

          // Create new record
          await tx.pushToken.create({
            data: {
              token: input.pushToken.token,
              type: input.pushToken.type,
              user_id: user.id,
            },
          });
        }

        return s;
      });

      return {
        token: session.id,
        expiry_date: session.expiry_date,
      };
    }),
  whoami: protectedProcedure.query(({ ctx }) =>
    _.omit(ctx.user, ["password", "otp", "otp_expiry", "School"]),
  ),
  logout: protectedProcedure
    .input(
      z.object({
        pushToken: z
          .object({
            token: z.string(),
            type: z.nativeEnum(PushTokenType),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await prisma.$transaction(async (tx) => {
          // Remove the session
          await tx.loginSession.delete({
            where: {
              id: ctx.session.id,
            },
          });

          // Remove push token
          if (input.pushToken) {
            await tx.pushToken.deleteMany({
              where: {
                token: input.pushToken.token,
                user_id: ctx.user.id,
                type: input.pushToken.type,
              },
            });
          }
        });

        return null;
      } catch (error) {
        console.error("Logout failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
  rollNumberLoginRequestOTP: procedure
    .input(
      z.object({
        class_id: z.number().int(),
        section_id: z.number().int(),
        school_id: z.string().cuid(),
        rollnum: z.number().int(),
      }),
    )
    .mutation(async ({ input }) => {
      // First fetch student and parents
      const student = await prisma.student.findFirst({
        where: {
          school_id: input.school_id,
          roll_num: input.rollnum,
          section: input.section_id,
          CurrentBatch: {
            class_id: input.class_id,
            Class: {
              Sections: {
                some: {
                  numeric_id: input.section_id,
                },
              },
            },
          },
          User: {},
        },
        include: {
          Parents: {
            include: {
              Parent: {
                include: {
                  User: true,
                },
              },
            },
          },
          User: true,
          School: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!student || !student.User) throw new TRPCError({ code: "NOT_FOUND" });

      // Send OTP to parents
      const parentsPhoneNumbers = student.Parents.map((p) => ({
        number: p.Parent.User?.phone,
        isd: p.Parent.User?.phone_isd_code,
      }));

      // Generate OTP
      const { otp, expiry } = generateUserOTP(student.User);

      await prisma.user.update({
        where: { id: student.User.id },
        data: { otp, otp_expiry: expiry },
      });

      // Send the SMS with the OTP
      await Promise.allSettled(
        parentsPhoneNumbers.map((phone) =>
          phone.number && typeof student.User?.name === "string"
            ? // TODO: Add a limit or budget will be exhausted
              sendSMS(
                {
                  number: phone.number,
                  isd: phone.isd,
                },
                "login_otp_student",
                {
                  otp,
                  student: student.User?.name,
                  school: student.School.name,
                },
              )
            : null,
        ),
      );

      return { userId: student.User.id };
    }),
});

export default authRouter;
