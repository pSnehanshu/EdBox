/*
  Warnings:

  - You are about to drop the `CustomGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomGroupMembers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessageAttachment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GroupActivityType" AS ENUM ('message_new', 'message_edit', 'message_delete', 'member_add', 'member_remove', 'name_change', 'description_change', 'icon_change');

-- DropForeignKey
ALTER TABLE "CustomGroup" DROP CONSTRAINT "CustomGroup_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "CustomGroup" DROP CONSTRAINT "CustomGroup_school_id_fkey";

-- DropForeignKey
ALTER TABLE "CustomGroupMembers" DROP CONSTRAINT "CustomGroupMembers_group_id_fkey";

-- DropForeignKey
ALTER TABLE "CustomGroupMembers" DROP CONSTRAINT "CustomGroupMembers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_parent_message_id_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "MessageAttachment" DROP CONSTRAINT "MessageAttachment_file_id_fkey";

-- DropForeignKey
ALTER TABLE "MessageAttachment" DROP CONSTRAINT "MessageAttachment_message_id_school_id_fkey";

-- DropForeignKey
ALTER TABLE "MessageAttachment" DROP CONSTRAINT "MessageAttachment_school_id_fkey";

-- DropTable
DROP TABLE "CustomGroup";

-- DropTable
DROP TABLE "CustomGroupMembers";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "MessageAttachment";

-- CreateTable
CREATE TABLE "Group" (
    "id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "created_by_id" VARCHAR(32),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembers" (
    "user_id" VARCHAR(32) NOT NULL,
    "group_id" VARCHAR(32) NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_mute" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMembers_pkey" PRIMARY KEY ("user_id","group_id")
);

-- CreateTable
CREATE TABLE "GroupActivity" (
    "sn" BIGSERIAL NOT NULL,
    "type" "GroupActivityType" NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" VARCHAR(32),
    "sys" BOOLEAN NOT NULL DEFAULT false,
    "group_id" VARCHAR(32) NOT NULL,

    CONSTRAINT "GroupActivity_pkey" PRIMARY KEY ("sn")
);

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembers" ADD CONSTRAINT "GroupMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembers" ADD CONSTRAINT "GroupMembers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupActivity" ADD CONSTRAINT "GroupActivity_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupActivity" ADD CONSTRAINT "GroupActivity_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
