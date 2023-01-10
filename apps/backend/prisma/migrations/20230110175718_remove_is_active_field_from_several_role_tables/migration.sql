/*
  Warnings:

  - You are about to drop the column `is_active` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `SchoolStaff` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `Teacher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Parent" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "SchoolStaff" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "is_active";
