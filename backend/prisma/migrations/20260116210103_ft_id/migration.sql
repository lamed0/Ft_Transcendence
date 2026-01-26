/*
  Warnings:

  - A unique constraint covering the columns `[ftId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ftId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "users_ftId_key" ON "users"("ftId");
