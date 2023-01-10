-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('principal', 'vice_principal', 'others');

-- AlterTable
ALTER TABLE "SchoolStaff" ADD COLUMN     "role" "StaffRole" NOT NULL DEFAULT 'others';
