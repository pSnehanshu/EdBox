import type { UserSensitiveInfo } from "@prisma/client";
import { addMinutes, isFuture } from "date-fns";
import config from "../config";

export function generateLoginOTP(
  userSensitive: Pick<UserSensitiveInfo, "login_otp" | "login_otp_expiry">,
) {
  // Generate OTP
  let otp = (
    Math.floor(Math.random() * 9 * 10 ** (config.OTP_LENGTH - 1)) +
    10 ** (config.OTP_LENGTH - 1)
  ).toString();

  if (
    userSensitive.login_otp &&
    userSensitive.login_otp_expiry &&
    isFuture(userSensitive.login_otp_expiry)
  ) {
    // An OTP exists, reuse it
    otp = userSensitive.login_otp;
  }

  const expiry = addMinutes(new Date(), 10);

  return { otp, expiry };
}
