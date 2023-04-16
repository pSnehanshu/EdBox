-- DropForeignKey
ALTER TABLE "HomeworkAttachment" DROP CONSTRAINT "HomeworkAttachment_file_id_fkey";

-- DropForeignKey
ALTER TABLE "HomeworkSubmissionAttachment" DROP CONSTRAINT "HomeworkSubmissionAttachment_file_id_fkey";

-- DropForeignKey
ALTER TABLE "HomeworkSubmissionRemarkAttachment" DROP CONSTRAINT "HomeworkSubmissionRemarkAttachment_file_id_fkey";

-- DropForeignKey
ALTER TABLE "MessageAttachment" DROP CONSTRAINT "MessageAttachment_file_id_fkey";

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "UploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkAttachment" ADD CONSTRAINT "HomeworkAttachment_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "UploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmissionAttachment" ADD CONSTRAINT "HomeworkSubmissionAttachment_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "UploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmissionRemarkAttachment" ADD CONSTRAINT "HomeworkSubmissionRemarkAttachment_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "UploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
