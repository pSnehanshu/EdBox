/*
  Warnings:

  - You are about to drop the column `app_android_adaptive_bgcolor` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `app_android_adaptive_icon` on the `School` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "School" DROP COLUMN "app_android_adaptive_bgcolor",
DROP COLUMN "app_android_adaptive_icon",
ALTER COLUMN "app_android_package_name" DROP NOT NULL,
ALTER COLUMN "app_android_package_name" DROP DEFAULT,
ALTER COLUMN "app_ios_bundle_identifier" DROP NOT NULL,
ALTER COLUMN "app_ios_bundle_identifier" DROP DEFAULT;
