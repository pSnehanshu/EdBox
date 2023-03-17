/*
  Warnings:

  - A unique constraint covering the columns `[phone_isd_code,phone,school_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_phone_school_id_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone_isd_code" SMALLINT NOT NULL DEFAULT 91;

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_isd_code_phone_school_id_key" ON "User"("phone_isd_code", "phone", "school_id");
