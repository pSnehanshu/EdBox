/*
  Warnings:

  - The primary key for the `GroupActivity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sn` on the `GroupActivity` table. All the data in the column will be lost.
  - The required column `id` was added to the `GroupActivity` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "GroupActivity" DROP CONSTRAINT "GroupActivity_parent_fkey";

-- AlterTable
ALTER TABLE "GroupActivity" DROP CONSTRAINT "GroupActivity_pkey",
DROP COLUMN "sn",
ADD COLUMN     "id" VARCHAR(32) NOT NULL,
ALTER COLUMN "parent" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "GroupActivity_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "GroupActivity" ADD CONSTRAINT "GroupActivity_parent_fkey" FOREIGN KEY ("parent") REFERENCES "GroupActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
