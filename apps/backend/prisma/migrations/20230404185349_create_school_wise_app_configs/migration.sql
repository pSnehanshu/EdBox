-- AlterTable
ALTER TABLE "School" ADD COLUMN     "app_android_adaptive_bgcolor" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN     "app_android_adaptive_icon" TEXT,
ADD COLUMN     "app_android_package_name" TEXT NOT NULL DEFAULT 'com.indorhino.edbox.common',
ADD COLUMN     "app_google_services_json" TEXT,
ADD COLUMN     "app_ios_bundle_identifier" TEXT NOT NULL DEFAULT 'com.indorhino.edbox.common',
ADD COLUMN     "app_scheme" TEXT NOT NULL DEFAULT 'edbox',
ADD COLUMN     "app_splash" TEXT;
