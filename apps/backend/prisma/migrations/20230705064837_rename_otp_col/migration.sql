/*
  Warnings:

  - You are about to drop the column `otp` on the `UserSensitiveInfo` table. All the data in the column will be lost.
  - You are about to drop the column `otp_expiry` on the `UserSensitiveInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserSensitiveInfo" DROP COLUMN "otp",
DROP COLUMN "otp_expiry",
ADD COLUMN     "login_otp" VARCHAR(10),
ADD COLUMN     "login_otp_expiry" TIMESTAMP(3);
