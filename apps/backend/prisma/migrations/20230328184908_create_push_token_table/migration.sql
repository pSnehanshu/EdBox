-- CreateEnum
CREATE TYPE "PushTokenType" AS ENUM ('expo', 'fcm', 'apn');

-- CreateTable
CREATE TABLE "PushToken" (
    "token" TEXT NOT NULL,
    "user_id" VARCHAR(32) NOT NULL,
    "type" "PushTokenType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("token","user_id")
);

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
