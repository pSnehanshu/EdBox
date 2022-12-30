import { router, publicProcedure, authProcedure } from "../trpc";
import { z } from "zod";
import prisma from "../../prisma";
import { TRPCError } from "@trpc/server";
import { addMinutes, addMonths, isPast } from "date-fns";
import _ from "lodash";

const authRouter = router({
  requestEmailLoginOTP: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
        select: {
          id: true,
          is_active: true,
        },
      });

      if (!user || !user.is_active) {
        return;
      }

      // User exists, and is active

      // Generate 6 digit OTP
      const otp = Math.round(Math.random() * 1e6).toString();
      const otpExpiry = addMinutes(new Date(), 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { otp, otp_expiry: otpExpiry },
      });

      // TODO: Send the email with the OTP
      console.log(input.email, { otp, otpExpiry });

      return;
    }),
  submitEmailLoginOTP: publicProcedure
    .input(
      z.object({
        otp: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      // Fetch the user object
      const user = await prisma.user.findFirst({
        where: {
          email: input.email,
        },
        select: {
          id: true,
          is_active: true,
          otp: true,
          otp_expiry: true,
        },
      });

      if (!user || !user.is_active) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (user.otp !== input.otp) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (!user.otp_expiry || isPast(user.otp_expiry)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // OTP correct, create session
      const session = await prisma.loginSession.create({
        data: {
          expiry_date: addMonths(new Date(), 2),
          user_id: user.id,
        },
      });

      return {
        token: session.id,
        expiry_date: session.expiry_date,
      };
    }),
  whoami: authProcedure.query(({ ctx }) =>
    _.omit(ctx.user, ["password", "otp", "otp_expiry"])
  ),
});

export default authRouter;
