-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Others');

-- CreateEnum
CREATE TYPE "SenderRole" AS ENUM ('student', 'teacher', 'parent', 'staff');

-- CreateTable
CREATE TABLE "School" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "logo" VARCHAR(256),
    "icon" VARCHAR(256),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(15),
    "email" VARCHAR(256),
    "password" VARCHAR(80),
    "otp" VARCHAR(10),
    "otp_expiry" TIMESTAMP(3),
    "gender" "Gender",
    "school_id" VARCHAR(32) NOT NULL,
    "student_id" VARCHAR(32),
    "teacher_id" VARCHAR(32),
    "parent_id" VARCHAR(32),
    "staff_id" VARCHAR(32),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassStd" (
    "numeric_id" SMALLINT NOT NULL,
    "name" VARCHAR(50),
    "school_id" VARCHAR(32) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassStd_pkey" PRIMARY KEY ("numeric_id","school_id")
);

-- CreateTable
CREATE TABLE "ClassSection" (
    "numeric_id" SMALLINT NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "class_id" SMALLINT NOT NULL,
    "name" VARCHAR(10),

    CONSTRAINT "ClassSection_pkey" PRIMARY KEY ("numeric_id","class_id","school_id")
);

-- CreateTable
CREATE TABLE "StudentsBatch" (
    "numeric_id" SMALLINT NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "class_id" SMALLINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentsBatch_pkey" PRIMARY KEY ("numeric_id","school_id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" VARCHAR(32) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "roll_num" SMALLINT,
    "joining_batch_num" SMALLINT NOT NULL,
    "current_batch_num" SMALLINT,
    "section" SMALLINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" VARCHAR(32) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parent" (
    "id" VARCHAR(32) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolStaff" (
    "id" VARCHAR(32) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentStudent_mapping" (
    "parent_id" VARCHAR(32) NOT NULL,
    "student_id" VARCHAR(32) NOT NULL,

    CONSTRAINT "ParentStudent_mapping_pkey" PRIMARY KEY ("parent_id","student_id")
);

-- CreateTable
CREATE TABLE "CustomGroup" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" VARCHAR(32) NOT NULL,
    "parent_message_id" VARCHAR(32),
    "school_id" VARCHAR(32) NOT NULL,
    "text" TEXT NOT NULL,
    "sender_id" VARCHAR(32) NOT NULL,
    "sender_role" "SenderRole" NOT NULL,
    "group_identifier" TEXT NOT NULL,
    "attachments" JSONB,
    "edit_history" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_group_identifier_school_id_idx" ON "Message"("group_identifier", "school_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassStd" ADD CONSTRAINT "ClassStd_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSection" ADD CONSTRAINT "ClassSection_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSection" ADD CONSTRAINT "ClassSection_class_id_school_id_fkey" FOREIGN KEY ("class_id", "school_id") REFERENCES "ClassStd"("numeric_id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentsBatch" ADD CONSTRAINT "StudentsBatch_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentsBatch" ADD CONSTRAINT "StudentsBatch_class_id_school_id_fkey" FOREIGN KEY ("class_id", "school_id") REFERENCES "ClassStd"("numeric_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_joining_batch_num_school_id_fkey" FOREIGN KEY ("joining_batch_num", "school_id") REFERENCES "StudentsBatch"("numeric_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_current_batch_num_school_id_fkey" FOREIGN KEY ("current_batch_num", "school_id") REFERENCES "StudentsBatch"("numeric_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolStaff" ADD CONSTRAINT "SchoolStaff_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudent_mapping" ADD CONSTRAINT "ParentStudent_mapping_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudent_mapping" ADD CONSTRAINT "ParentStudent_mapping_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomGroup" ADD CONSTRAINT "CustomGroup_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
