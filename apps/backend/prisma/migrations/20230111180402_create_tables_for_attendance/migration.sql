/*
  Warnings:

  - The primary key for the `RoutinePeriod` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `RoutinePeriod` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "Month" AS ENUM ('jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent');

-- AlterTable
ALTER TABLE "RoutinePeriod" DROP CONSTRAINT "RoutinePeriod_pkey",
ADD COLUMN     "id" VARCHAR(32) NOT NULL,
ADD CONSTRAINT "RoutinePeriod_pkey" PRIMARY KEY ("id", "school_id");

-- CreateTable
CREATE TABLE "PeriodAttendance" (
    "id" VARCHAR(32) NOT NULL,
    "period_id" VARCHAR(32) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "year" SMALLINT NOT NULL,
    "month" "Month" NOT NULL,
    "day" SMALLINT NOT NULL,
    "teacher_id" VARCHAR(32),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeriodAttendance_pkey" PRIMARY KEY ("id","school_id")
);

-- CreateTable
CREATE TABLE "StudentAttendance" (
    "attendance_id" VARCHAR(32) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "student_id" VARCHAR(32) NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAttendance_pkey" PRIMARY KEY ("student_id","attendance_id","school_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PeriodAttendance_period_id_school_id_year_month_day_key" ON "PeriodAttendance"("period_id", "school_id", "year", "month", "day");

-- AddForeignKey
ALTER TABLE "PeriodAttendance" ADD CONSTRAINT "PeriodAttendance_period_id_school_id_fkey" FOREIGN KEY ("period_id", "school_id") REFERENCES "RoutinePeriod"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodAttendance" ADD CONSTRAINT "PeriodAttendance_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodAttendance" ADD CONSTRAINT "PeriodAttendance_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_attendance_id_school_id_fkey" FOREIGN KEY ("attendance_id", "school_id") REFERENCES "PeriodAttendance"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
