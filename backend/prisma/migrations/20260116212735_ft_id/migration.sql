/*
  Warnings:

  - The `ftId` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "ftId",
ADD COLUMN     "ftId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "users_ftId_key" ON "users"("ftId");
