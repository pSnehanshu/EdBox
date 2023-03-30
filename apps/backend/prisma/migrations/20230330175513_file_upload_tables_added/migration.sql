-- CreateEnum
CREATE TYPE "PreviewType" AS ENUM ('blurhash', 'b64img');

-- CreateTable
CREATE TABLE "FileUploadPermission" (
    "id" VARCHAR(32) NOT NULL,
    "s3key" TEXT NOT NULL,
    "user_id" VARCHAR(32) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileUploadPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" VARCHAR(32) NOT NULL,
    "file_name" TEXT NOT NULL,
    "s3key" TEXT NOT NULL,
    "size_bytes" INTEGER,
    "file_type" VARCHAR(30),
    "school_id" VARCHAR(32) NOT NULL,
    "uploader_user_id" VARCHAR(32),
    "preview_type" "PreviewType",
    "preview_value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FileUploadPermission" ADD CONSTRAINT "FileUploadPermission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileUploadPermission" ADD CONSTRAINT "FileUploadPermission_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_uploader_user_id_fkey" FOREIGN KEY ("uploader_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
