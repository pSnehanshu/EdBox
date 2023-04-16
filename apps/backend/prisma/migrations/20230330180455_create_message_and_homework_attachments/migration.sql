-- CreateTable
CREATE TABLE "MessageAttachment" (
    "message_id" VARCHAR(32) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "file_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("message_id","file_id")
);

-- CreateTable
CREATE TABLE "HomeworkAttachment" (
    "homework_id" VARCHAR(32) NOT NULL,
    "file_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeworkAttachment_pkey" PRIMARY KEY ("homework_id","file_id")
);

-- CreateTable
CREATE TABLE "HomeworkSubmissionAttachment" (
    "submission_id" VARCHAR(32) NOT NULL,
    "file_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeworkSubmissionAttachment_pkey" PRIMARY KEY ("submission_id","file_id")
);

-- CreateTable
CREATE TABLE "HomeworkSubmissionRemarkAttachment" (
    "remark_id" VARCHAR(32) NOT NULL,
    "file_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeworkSubmissionRemarkAttachment_pkey" PRIMARY KEY ("remark_id","file_id")
);

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_message_id_school_id_fkey" FOREIGN KEY ("message_id", "school_id") REFERENCES "Message"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "UploadedFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAttachment" ADD CONSTRAINT "HomeworkAttachment_homework_id_fkey" FOREIGN KEY ("homework_id") REFERENCES "Homework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAttachment" ADD CONSTRAINT "HomeworkAttachment_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "UploadedFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmissionAttachment" ADD CONSTRAINT "HomeworkSubmissionAttachment_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "HomeworkSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmissionAttachment" ADD CONSTRAINT "HomeworkSubmissionAttachment_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "UploadedFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmissionRemarkAttachment" ADD CONSTRAINT "HomeworkSubmissionRemarkAttachment_remark_id_fkey" FOREIGN KEY ("remark_id") REFERENCES "HomeworkSubmissionRemark"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmissionRemarkAttachment" ADD CONSTRAINT "HomeworkSubmissionRemarkAttachment_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "UploadedFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
