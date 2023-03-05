import { User } from "@prisma/client";
import { t, authMiddleware } from "../trpc";
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
    Math.floor(Math.random() * 9 * 10 ** (CONFIG.otpLength - 1)) +
    10 ** (CONFIG.otpLength - 1)
  ).toString();

  if (user.otp && user.otp_expiry && isFuture(user.otp_expiry)) {
    // An OTP exists, reuse it
    otp = user.otp;
  }

  const expiry = addMinutes(new Date(), 10);

  return { otp, expiry };
}

const authRouter = t.router({
  requestEmailLoginOTP: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        schoolId: z.string().cuid(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          email_school_id: {
            email: input.email,
            school_id: input.schoolId,
          },
        },
        select: {
          id: true,
          is_active: true,
          otp: true,
          otp_expiry: true,
        },
      });

      if (!user || !user.is_active) {
        return;
      }

      // User exists, and is active

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
  requestPhoneNumberOTP: t.procedure
    .input(
      z.object({
        isd: z.number().int().default(91),
        phoneNumber: z
          .string()
          .regex(/^\d+$/, "Phone number must be a 10 digit number"),
        schoolId: z.string().cuid(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          phone_school_id: {
            phone: `${input.isd}${input.phoneNumber}`,
            school_id: input.schoolId,
          },
        },
        select: {
          id: true,
          is_active: true,
          otp: true,
          otp_expiry: true,
          School: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!user || !user.is_active) {
        return;
      }

      // User exists, and is active

      // Generate OTP
      const { otp, expiry } = generateUserOTP(user);

      await prisma.user.update({
        where: { id: user.id },
        data: { otp, otp_expiry: expiry },
      });

      // Send the SMS with the OTP
      await sendSMS(
        { isd: input.isd, number: input.phoneNumber },
        "login_otp_self",
        { otp, school: user.School.name }
      );

      return { userId: user.id };
    }),
  submitLoginOTP: t.procedure
    .input(
      z.object({
        otp: z.string().regex(/^\d+$/).length(CONFIG.otpLength),
        userId: z.string().cuid(),
        schoolId: z.string().cuid(),
      })
    )
    .mutation(async ({ input }) => {
      // Fetch the user object
      const user = await prisma.user.findUnique({
        where: {
          id: input.userId,
        },
        select: {
          id: true,
          is_active: true,
          otp: true,
          otp_expiry: true,
          school_id: true,
        },
      });

      if (!user || !user.is_active || user.school_id !== input.schoolId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (user.otp !== input.otp) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (!user.otp_expiry || isPast(user.otp_expiry)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // OTP correct, create session and remove otp
      const [session] = await prisma.$transaction([
        prisma.loginSession.create({
          data: {
            expiry_date: addMonths(new Date(), 2),
            user_id: user.id,
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: {
            otp: null,
            otp_expiry: null,
          },
        }),
      ]);

      return {
        token: session.id,
        expiry_date: session.expiry_date,
      };
    }),
  whoami: t.procedure
    .use(authMiddleware)
    .query(({ ctx }) =>
      _.omit(ctx.user, ["password", "otp", "otp_expiry", "School"])
    ),
  logout: t.procedure.use(authMiddleware).mutation(async ({ ctx }) => {
    try {
      await prisma.loginSession.delete({
        where: {
          id: ctx.session.id,
        },
      });

      return null;
    } catch (error) {
      console.error("Logout failed", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: (error as any)?.message ?? "Something went wrong",
      });
    }
  }),
});

export default authRouter;
