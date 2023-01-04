/*
  Warnings:

  - A unique constraint covering the columns `[sort_key]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "sort_key" BIGSERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Message_sort_key_key" ON "Message"("sort_key");
