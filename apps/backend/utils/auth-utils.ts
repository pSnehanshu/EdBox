import type { UserSensitiveInfo } from "@prisma/client";
import { addMinutes, isFuture } from "date-fns";
import config from "../config";

export function generateOTP(len = config.OTP_LENGTH) {
  return (
    Math.floor(Math.random() * 9 * 10 ** (len - 1)) +
    10 ** (len - 1)
  ).toString();
}

export function generateLoginOTP(
  userSensitive: Pick<UserSensitiveInfo, "login_otp" | "login_otp_expiry">,
) {
  // Generate OTP
  let otp = generateOTP();

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
