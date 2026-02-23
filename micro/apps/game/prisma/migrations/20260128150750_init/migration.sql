-- CreateEnum
CREATE TYPE "game"."GameMode" AS ENUM ('ONEVONE_QUEUE', 'ONEVONE_INVITE');

-- CreateEnum
CREATE TYPE "game"."GameStatus" AS ENUM ('WAITING', 'LIVE', 'FINISHED', 'CANCELED');

-- CreateEnum
CREATE TYPE "game"."InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "game"."ParticipantRole" AS ENUM ('PLAYER', 'SPECTATOR');

-- CreateTable
CREATE TABLE "game"."GameSession" (
    "id" TEXT NOT NULL,
    "mode" "game"."GameMode" NOT NULL,
    "status" "game"."GameStatus" NOT NULL DEFAULT 'WAITING',
    "hostUserId" INTEGER,
    "offlineP1" TEXT,
    "offlineP2" TEXT,
    "playerALevel" INTEGER,
    "playerBLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "scoreA" INTEGER NOT NULL DEFAULT 0,
    "scoreB" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."GameParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "game"."ParticipantRole" NOT NULL DEFAULT 'PLAYER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."GameInvite" (
    "id" TEXT NOT NULL,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "status" "game"."InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "sessionId" TEXT,

    CONSTRAINT "GameInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game"."MatchmakingTicket" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SEARCHING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "matchedAt" TIMESTAMP(3),

    CONSTRAINT "MatchmakingTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameSession_status_idx" ON "game"."GameSession"("status");

-- CreateIndex
CREATE INDEX "GameSession_mode_idx" ON "game"."GameSession"("mode");

-- CreateIndex
CREATE INDEX "GameSession_hostUserId_idx" ON "game"."GameSession"("hostUserId");

-- CreateIndex
CREATE INDEX "GameParticipant_userId_idx" ON "game"."GameParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GameParticipant_sessionId_userId_key" ON "game"."GameParticipant"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "GameInvite_fromUserId_idx" ON "game"."GameInvite"("fromUserId");

-- CreateIndex
CREATE INDEX "GameInvite_toUserId_idx" ON "game"."GameInvite"("toUserId");

-- CreateIndex
CREATE INDEX "GameInvite_status_idx" ON "game"."GameInvite"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MatchmakingTicket_userId_key" ON "game"."MatchmakingTicket"("userId");

-- CreateIndex
CREATE INDEX "MatchmakingTicket_status_idx" ON "game"."MatchmakingTicket"("status");

-- CreateIndex
CREATE INDEX "MatchmakingTicket_createdAt_idx" ON "game"."MatchmakingTicket"("createdAt");

-- AddForeignKey
ALTER TABLE "game"."GameParticipant" ADD CONSTRAINT "GameParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "game"."GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
