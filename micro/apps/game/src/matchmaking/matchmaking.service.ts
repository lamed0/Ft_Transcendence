import { Injectable } from '@nestjs/common';
import { GameGateway } from '../realtime/game.gateway';
import { GameDatabaseService } from '../game-database.service';

type JoinQueueResult =
  | { status: 'SEARCHING' }
  | { status: 'MATCHED'; sessionId: string; players: { id: number; username: string; avatarUrl: string | null }[] };

@Injectable()
export class MatchmakingService {
  constructor(
    private prisma: GameDatabaseService,
    private gateway: GameGateway,
  ) {}

    async joinQueue(userId: number): Promise<JoinQueueResult> {
    // 1) if already searching, do nothing
    const already = await this.prisma.matchmakingTicket.findFirst({
        where: { userId, status: 'SEARCHING' },
        select: { id: true },
    });
    if (already) return { status: 'SEARCHING' };

    // 2) create ticket
    const myTicket = await this.prisma.matchmakingTicket.create({
        data: { userId, status: 'SEARCHING' },
        select: { id: true, createdAt: true },
    });

    // 3) find oldest other searching ticket
    const partner = await this.prisma.matchmakingTicket.findFirst({
        where: { status: 'SEARCHING', userId: { not: userId } },
        orderBy: { createdAt: 'asc' },
        select: { id: true, userId: true },
    });

    if (!partner) return { status: 'SEARCHING' };

    // 4) atomic match (transaction)
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

        // Fetch player info
        const player1 = await tx.users.findUnique({
            where: { id: userId },
            select: { id: true, username: true, avatarUrl: true },
        });
        const player2 = await tx.users.findUnique({
            where: { id: p.userId },
            select: { id: true, username: true, avatarUrl: true },
        });

        if (!player1 || !player2) return null;

        return { 
            sessionId: session.id, 
            players: [player1, player2]
        };
    });

    if (!match) return { status: 'SEARCHING' };

    // 5) push notify both users via WS (no polling)
    this.gateway.notifyMatched(match.players.map(p => p.id), match.sessionId);

    return { status: 'MATCHED', sessionId: match.sessionId, players: match.players };
    }

  async leaveQueue(userId: number) {
    await this.prisma.matchmakingTicket.updateMany({
      where: { userId, status: 'SEARCHING' },
      data: { status: 'CANCELED' },
    });
    return { status: 'CANCELED' as const };
  }
}
