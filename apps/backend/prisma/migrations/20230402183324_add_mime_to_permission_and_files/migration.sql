/*
  Warnings:

  - You are about to drop the column `file_type` on the `UploadedFile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FileUploadPermission" ADD COLUMN     "mime" VARCHAR(30);

-- AlterTable
ALTER TABLE "UploadedFile" DROP COLUMN "file_type",
ADD COLUMN     "mime" VARCHAR(30);
