-- AlterTable
ALTER TABLE "ParentStudent_mapping" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "CustomGroupMembers" (
    "user_id" VARCHAR(32) NOT NULL,
    "group_id" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomGroupMembers_pkey" PRIMARY KEY ("user_id","group_id")
);

-- AddForeignKey
ALTER TABLE "CustomGroupMembers" ADD CONSTRAINT "CustomGroupMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomGroupMembers" ADD CONSTRAINT "CustomGroupMembers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "CustomGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
