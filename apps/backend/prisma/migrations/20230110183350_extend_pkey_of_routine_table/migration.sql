/*
  Warnings:

  - The primary key for the `RoutinePeriod` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "RoutinePeriod" DROP CONSTRAINT "RoutinePeriod_pkey",
ADD CONSTRAINT "RoutinePeriod_pkey" PRIMARY KEY ("section_id", "class_id", "school_id", "subject_id", "day_of_week", "start_hour", "start_min");
