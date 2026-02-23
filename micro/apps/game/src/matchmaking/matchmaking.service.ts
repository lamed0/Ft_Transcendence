import { Injectable } from '@nestjs/common';
import { GameDatabaseService } from '../game-database.service';
import { UsersClient } from '../clients/users.client';

type JoinQueueResult =
  | { status: 'SEARCHING' }
  | { status: 'MATCHED'; sessionId: string; opponent: { id: number; username: string; avatarUrl: string | null; level?: number }; players: any[]; playerIds: number[] };

@Injectable()
export class MatchmakingService {
  constructor(
    private prisma: GameDatabaseService,
    private userClient: UsersClient
  ) {}

  async joinQueue(userId: number): Promise<JoinQueueResult> {
    if (!userId || typeof userId !== 'number') {
      return { status: 'SEARCHING' };
    }

    // 0) Upsert ticket - ensures we have exactly one ticket per user
    const myTicket = await this.prisma.matchmakingTicket.upsert({
        where: { userId },
        update: { status: 'SEARCHING', createdAt: new Date() },
        create: { userId, status: 'SEARCHING' },
        select: { id: true, createdAt: true },
    });

    // 1) find oldest other searching ticket (excluding own ticket)
    const partner = await this.prisma.matchmakingTicket.findFirst({
        where: { 
            status: 'SEARCHING', 
            userId: { not: userId }
        },
        orderBy: { createdAt: 'asc' },
        select: { id: true, userId: true },
    });

    if (!partner) {
      return { status: 'SEARCHING' };
    }

    // 2) atomic match (transaction)
    const match = await this.prisma.$transaction(async (tx) => {
        // re-check partner still SEARCHING (important)
        const p = await tx.matchmakingTicket.findUnique({
        where: { id: partner.id },
        select: { status: true, userId: true },
        });
        if (!p || p.status !== 'SEARCHING') return null;

        const session = await tx.gameSession.create({
        data: {
            mode: 'ONEVONE_QUEUE',
            status: 'WAITING',
            participants: {
            create: [
                { userId: userId },   // you
                { userId: p.userId }, // partner
            ],
            },
        },
        select: { id: true },
        });

        await tx.matchmakingTicket.updateMany({
        where: { id: { in: [myTicket.id, partner.id] } },
        data: {
            status: 'MATCHED',
            sessionId: session.id,
            matchedAt: new Date(),
        },
        });

        const users = await this.userClient.batch([userId, p.userId]);
        const players = users.map(u => ({
          id: u.id,
          username: u.username,
          avatarUrl: u.avatarUrl ?? null,
          level: u.level ?? 1,
        }));
        return { sessionId: session.id, playerIds: [userId, p.userId], players };
    });

    if (!match) return { status: 'SEARCHING' };
    
    const opponentId = match.playerIds.find(id => id !== userId)!;
    const users = await this.userClient.batch([opponentId]);
    const opponent = users[0];

    return { status: 'MATCHED', sessionId: match.sessionId, opponent: { id: opponent.id, username: opponent.username, avatarUrl: opponent.avatarUrl, level: opponent.level }, players: match.players, playerIds: match.playerIds };
  }

  async leaveQueue(userId: number) {
    await this.prisma.matchmakingTicket.updateMany({
      where: { userId, status: 'SEARCHING' },
      data: { status: 'CANCELED' },
    });
    return { status: 'CANCELED' as const };
  }
}
