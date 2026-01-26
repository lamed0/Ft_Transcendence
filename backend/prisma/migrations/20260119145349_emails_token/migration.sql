-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "email_token" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_token_tokenHash_key" ON "email_token"("tokenHash");

-- CreateIndex
CREATE INDEX "email_token_userId_idx" ON "email_token"("userId");

-- CreateIndex
CREATE INDEX "email_token_expiresAt_idx" ON "email_token"("expiresAt");

-- AddForeignKey
ALTER TABLE "email_token" ADD CONSTRAINT "email_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
