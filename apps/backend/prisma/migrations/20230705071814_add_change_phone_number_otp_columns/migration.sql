-- AlterTable
ALTER TABLE "User" ADD COLUMN     "penisd" SMALLINT NOT NULL DEFAULT 91,
ADD COLUMN     "penph" VARCHAR(15);

-- AlterTable
ALTER TABLE "UserSensitiveInfo" ADD COLUMN     "cpoe" TIMESTAMP(3),
ADD COLUMN     "cpon" VARCHAR(10),
ADD COLUMN     "cpoo" VARCHAR(10);
