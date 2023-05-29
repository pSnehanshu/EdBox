/*
  Warnings:

  - Added the required column `total_marks` to the `ExamTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `obtained_marks` to the `ExamTestResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExamTest" ADD COLUMN     "total_marks" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ExamTestResult" ADD COLUMN     "obtained_marks" INTEGER NOT NULL;
