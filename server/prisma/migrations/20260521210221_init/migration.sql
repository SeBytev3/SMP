-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lockout_until" TIMESTAMP(3),
ADD COLUMN     "login_attempts" INTEGER NOT NULL DEFAULT 0;
