/*
  Warnings:

  - You are about to drop the column `otp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otp_expiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "otp",
DROP COLUMN "otp_expiry",
DROP COLUMN "password";

-- CreateTable
CREATE TABLE "UserSensitiveInfo" (
    "user_id" TEXT NOT NULL,
    "password" VARCHAR(80),
    "otp" VARCHAR(10),
    "otp_expiry" TIMESTAMP(3),

    CONSTRAINT "UserSensitiveInfo_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "UserSensitiveInfo" ADD CONSTRAINT "UserSensitiveInfo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
