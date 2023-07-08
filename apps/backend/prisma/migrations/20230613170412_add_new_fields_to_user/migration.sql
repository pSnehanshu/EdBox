-- CreateEnum
CREATE TYPE "Salutation" AS ENUM ('None', 'Mr', 'Mrs', 'Miss', 'Dr', 'Prof');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addr_city" VARCHAR(20),
ADD COLUMN     "addr_country" VARCHAR(60) NOT NULL DEFAULT 'India',
ADD COLUMN     "addr_l1" VARCHAR(100),
ADD COLUMN     "addr_l2" VARCHAR(100),
ADD COLUMN     "addr_pin" INTEGER,
ADD COLUMN     "addr_state" VARCHAR(20),
ADD COLUMN     "addr_town_vill" VARCHAR(20),
ADD COLUMN     "blood_group" VARCHAR(20),
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "salutation" "Salutation" NOT NULL DEFAULT 'None';
