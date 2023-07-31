/*
  Warnings:

  - The primary key for the `GroupActivity` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "GroupActivity" DROP CONSTRAINT "GroupActivity_parent_fkey";

-- AlterTable
ALTER TABLE "GroupActivity" DROP CONSTRAINT "GroupActivity_pkey",
ALTER COLUMN "parent" SET DATA TYPE VARCHAR(36),
ALTER COLUMN "id" SET DATA TYPE VARCHAR(36),
ADD CONSTRAINT "GroupActivity_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "GroupActivity" ADD CONSTRAINT "GroupActivity_parent_fkey" FOREIGN KEY ("parent") REFERENCES "GroupActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
