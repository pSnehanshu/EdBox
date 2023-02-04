-- CreateTable
CREATE TABLE "Exam" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamTest" (
    "id" VARCHAR(32) NOT NULL,
    "exam_id" VARCHAR(32),
    "school_id" VARCHAR(32) NOT NULL,
    "subject_name" VARCHAR(100),
    "class_id" SMALLINT NOT NULL,
    "section_id" SMALLINT,
    "date_of_exam" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "creator_user_id" VARCHAR(32),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSubjectMapping" (
    "test_id" VARCHAR(32) NOT NULL,
    "subject_id" VARCHAR(32) NOT NULL,

    CONSTRAINT "TestSubjectMapping_pkey" PRIMARY KEY ("test_id","subject_id")
);

-- CreateTable
CREATE TABLE "ExamTestResult" (
    "id" VARCHAR(32) NOT NULL,
    "test_id" VARCHAR(32) NOT NULL,
    "student_id" VARCHAR(32) NOT NULL,
    "overwrites_result_id" VARCHAR(32),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamTestResult_overwrites_result_id_key" ON "ExamTestResult"("overwrites_result_id");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTest" ADD CONSTRAINT "ExamTest_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTest" ADD CONSTRAINT "ExamTest_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTest" ADD CONSTRAINT "ExamTest_class_id_school_id_fkey" FOREIGN KEY ("class_id", "school_id") REFERENCES "ClassStd"("numeric_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTest" ADD CONSTRAINT "ExamTest_section_id_class_id_school_id_fkey" FOREIGN KEY ("section_id", "class_id", "school_id") REFERENCES "ClassSection"("numeric_id", "class_id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTest" ADD CONSTRAINT "ExamTest_creator_user_id_fkey" FOREIGN KEY ("creator_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSubjectMapping" ADD CONSTRAINT "TestSubjectMapping_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "ExamTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSubjectMapping" ADD CONSTRAINT "TestSubjectMapping_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTestResult" ADD CONSTRAINT "ExamTestResult_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "ExamTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTestResult" ADD CONSTRAINT "ExamTestResult_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTestResult" ADD CONSTRAINT "ExamTestResult_overwrites_result_id_fkey" FOREIGN KEY ("overwrites_result_id") REFERENCES "ExamTestResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
