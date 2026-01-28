-- CreateEnum
CREATE TYPE "Friendships_status" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateTable
CREATE TABLE "friends" (
    "id" SERIAL NOT NULL,
    "userLowId" INTEGER NOT NULL,
    "userHighId" INTEGER NOT NULL,
    "requestedBy" INTEGER NOT NULL,
    "status" "Friendships_status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "friends_userLowId_idx" ON "friends"("userLowId");

-- CreateIndex
CREATE INDEX "friends_userHighId_idx" ON "friends"("userHighId");

-- CreateIndex
CREATE INDEX "friends_status_idx" ON "friends"("status");

-- CreateIndex
CREATE INDEX "friends_requestedBy_idx" ON "friends"("requestedBy");

-- CreateIndex
CREATE UNIQUE INDEX "friends_userLowId_userHighId_key" ON "friends"("userLowId", "userHighId");
