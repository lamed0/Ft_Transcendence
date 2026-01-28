-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('ONEVONE_QUEUE', 'ONEVONE_INVITE');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'LIVE', 'FINISHED', 'CANCELED');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('PLAYER', 'SPECTATOR');

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "mode" "GameMode" NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
    "hostUserId" INTEGER,
    "offlineP1" TEXT,
    "offlineP2" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "scoreA" INTEGER NOT NULL DEFAULT 0,
    "scoreB" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'PLAYER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameInvite" (
    "id" TEXT NOT NULL,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "sessionId" TEXT,

    CONSTRAINT "GameInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchmakingTicket" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SEARCHING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "matchedAt" TIMESTAMP(3),

    CONSTRAINT "MatchmakingTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameSession_status_idx" ON "GameSession"("status");

-- CreateIndex
CREATE INDEX "GameSession_mode_idx" ON "GameSession"("mode");

-- CreateIndex
CREATE INDEX "GameSession_hostUserId_idx" ON "GameSession"("hostUserId");

-- CreateIndex
CREATE INDEX "GameParticipant_userId_idx" ON "GameParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GameParticipant_sessionId_userId_key" ON "GameParticipant"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "GameInvite_fromUserId_idx" ON "GameInvite"("fromUserId");

-- CreateIndex
CREATE INDEX "GameInvite_toUserId_idx" ON "GameInvite"("toUserId");

-- CreateIndex
CREATE INDEX "GameInvite_status_idx" ON "GameInvite"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MatchmakingTicket_userId_key" ON "MatchmakingTicket"("userId");

-- CreateIndex
CREATE INDEX "MatchmakingTicket_status_idx" ON "MatchmakingTicket"("status");

-- CreateIndex
CREATE INDEX "MatchmakingTicket_createdAt_idx" ON "MatchmakingTicket"("createdAt");

-- AddForeignKey
ALTER TABLE "GameParticipant" ADD CONSTRAINT "GameParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
