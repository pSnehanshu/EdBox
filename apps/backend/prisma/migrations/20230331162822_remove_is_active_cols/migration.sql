/*
  Warnings:

  - You are about to drop the column `is_active` on the `ClassStd` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `CustomGroup` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `DynamicRole` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `ExamTest` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `RoutinePeriod` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `StudentsBatch` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClassStd" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "CustomGroup" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "DynamicRole" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "ExamTest" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "RoutinePeriod" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "StudentsBatch" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "is_active";
