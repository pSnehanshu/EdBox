-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GroupActivityType" ADD VALUE 'read';
ALTER TYPE "GroupActivityType" ADD VALUE 'delivered';

-- AlterTable
ALTER TABLE "GroupActivity" ADD COLUMN     "parent" BIGINT;

-- AddForeignKey
ALTER TABLE "GroupActivity" ADD CONSTRAINT "GroupActivity_parent_fkey" FOREIGN KEY ("parent") REFERENCES "GroupActivity"("sn") ON DELETE CASCADE ON UPDATE CASCADE;
