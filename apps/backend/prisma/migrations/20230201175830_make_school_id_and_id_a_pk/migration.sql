/*
  Warnings:

  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_parent_message_id_fkey";

-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id", "school_id");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parent_message_id_school_id_fkey" FOREIGN KEY ("parent_message_id", "school_id") REFERENCES "Message"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;
