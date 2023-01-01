-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');

-- CreateTable
CREATE TABLE "RoutinePeriod" (
    "section_id" SMALLINT NOT NULL,
    "class_id" SMALLINT NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "subject_id" VARCHAR(32) NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_hour" SMALLINT NOT NULL,
    "start_min" SMALLINT NOT NULL,
    "end_hour" SMALLINT NOT NULL,
    "end_min" SMALLINT NOT NULL,
    "teacher_id" VARCHAR(32),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutinePeriod_pkey" PRIMARY KEY ("section_id","class_id","school_id","subject_id")
);

-- AddForeignKey
ALTER TABLE "RoutinePeriod" ADD CONSTRAINT "RoutinePeriod_section_id_class_id_school_id_fkey" FOREIGN KEY ("section_id", "class_id", "school_id") REFERENCES "ClassSection"("numeric_id", "class_id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutinePeriod" ADD CONSTRAINT "RoutinePeriod_class_id_school_id_fkey" FOREIGN KEY ("class_id", "school_id") REFERENCES "ClassStd"("numeric_id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutinePeriod" ADD CONSTRAINT "RoutinePeriod_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutinePeriod" ADD CONSTRAINT "RoutinePeriod_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutinePeriod" ADD CONSTRAINT "RoutinePeriod_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
