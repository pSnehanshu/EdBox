-- CreateTable
CREATE TABLE "LoginSession" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(32) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoginSession" ADD CONSTRAINT "LoginSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
