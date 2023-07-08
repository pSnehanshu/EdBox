-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar_id" VARCHAR(32);

-- CreateIndex
CREATE UNIQUE INDEX "User_avatar_id_key" ON "User"("avatar_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "UploadedFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
