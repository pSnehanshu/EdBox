/*
  Warnings:

  - A unique constraint covering the columns `[email,school_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone,school_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_phone_key";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_school_id_key" ON "User"("email", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_school_id_key" ON "User"("phone", "school_id");
