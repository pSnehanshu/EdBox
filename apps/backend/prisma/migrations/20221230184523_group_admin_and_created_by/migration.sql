-- AlterTable
ALTER TABLE "CustomGroup" ADD COLUMN     "created_by_id" VARCHAR(32);

-- AlterTable
ALTER TABLE "CustomGroupMembers" ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "CustomGroup" ADD CONSTRAINT "CustomGroup_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
