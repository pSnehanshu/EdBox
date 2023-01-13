/*
  Warnings:

  - A unique constraint covering the columns `[roll_num,section,current_batch_num]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Made the column `roll_num` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "roll_num" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_roll_num_section_current_batch_num_key" ON "Student"("roll_num", "section", "current_batch_num");
