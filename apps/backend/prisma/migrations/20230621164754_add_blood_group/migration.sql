/*
  Warnings:

  - The `blood_group` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('Ap', 'Bp', 'ABp', 'Op', 'An', 'Bn', 'ABn', 'On', 'Other');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "blood_group",
ADD COLUMN     "blood_group" "BloodGroup";
