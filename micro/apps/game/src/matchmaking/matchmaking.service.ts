import { Injectable } from '@nestjs/common';
import { GameGateway } from '../realtime/game.gateway';
import { GameDatabaseService } from '../game-database.service';
import { UsersClient } from '../clients/users.client';

type JoinQueueResult =
  | { status: 'SEARCHING' }
  | { status: 'MATCHED'; sessionId: string; players: { id: number; username: string; avatarUrl: string | null }[] };

@Injectable()
export class MatchmakingService {
  constructor(
    private prisma: GameDatabaseService,
    private gateway: GameGateway,
    private userClient: UsersClient
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

        return { sessionId: session.id, playerIds: [userId, p.userId] };
    });

    if (!match) return { status: 'SEARCHING' };
    
    // Fetch player info
    const users = await this.userClient.batch(match.playerIds);

    // Keep same order as playerIds
    const byId = new Map(users.map((u) => [u.id, u]));
    const players = match.playerIds
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map((u) => ({ id: u!.id, username: u!.username, avatarUrl: u!.avatarUrl }));

    // 5) push notify both users via WS (no polling)
    this.gateway.notifyMatched(match.playerIds, match.sessionId);
    return { status: 'MATCHED', sessionId: match.sessionId, players };
    }

  async leaveQueue(userId: number) {
    await this.prisma.matchmakingTicket.updateMany({
      where: { userId, status: 'SEARCHING' },
      data: { status: 'CANCELED' },
    });
    return { status: 'CANCELED' as const };
  }
}
