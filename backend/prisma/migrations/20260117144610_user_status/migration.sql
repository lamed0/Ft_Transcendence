/*
  Warnings:

  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "userStatus" AS ENUM ('ONLINE', 'OFFLINE', 'IN_GAME');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "userStatus" NOT NULL DEFAULT 'OFFLINE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();
