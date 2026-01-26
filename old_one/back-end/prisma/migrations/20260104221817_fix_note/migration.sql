/*
  Warnings:

  - You are about to drop the column `creatAt` on the `Note` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "creatAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
