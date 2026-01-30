import { Injectable } from "@nestjs/common";
import { GameDatabaseService } from '../game-database.service';

@Injectable()
export class PermissionService{
    constructor(private readonly prisma: GameDatabaseService){}

    async areFriends(userA: number, userB: number){
        if (userA === userB) return true;

        const low = Math.min(userA, userB);
        const high = Math.max(userA, userB);

        const friendship = await this.prisma.friends.findUnique({
            where: {
                userLowId_userHighId: {
                    userLowId: low,
                    userHighId: high,
                },
            },
            select: { status: true },
        });
        return friendship?.status === 'ACCEPTED';    
    }

    async canSpectate(userId: number, sessionId: string){
    // Get all player IDs in the game
    const players = await this.prisma.gameParticipant.findMany({
        where: {
            sessionId,
            role: 'PLAYER',
        },
        select: { userId: true },
    });

    const playerIds = players.map(p => p.userId);
    
    if (playerIds.length === 0) return false;

    // Fetch friendships in a SINGLE query
    const friendship = await this.prisma.friends.findFirst({
        where: {
            OR: [
                {
                    userLowId: userId,
                    userHighId: { in: playerIds },
                    status: 'ACCEPTED',
                },
                {
                    userHighId: userId,
                    userLowId: { in: playerIds },
                    status: 'ACCEPTED',
                },
            ],
        },
    });

    return !!friendship;
}
}
