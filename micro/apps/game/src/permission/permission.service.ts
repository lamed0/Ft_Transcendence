import { Injectable } from "@nestjs/common";
import { GameDatabaseService } from '../game-database.service';
import { FriendsClient } from "../clients/friends.client";

@Injectable()
export class PermissionService{
    constructor(private readonly prisma: GameDatabaseService, private readonly friendClient: FriendsClient){}

    async areFriends(userA: number, userB: number){
        return this.friendClient.areFriends(userA, userB);   
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

    return this.friendClient.anyAccepted(userId, playerIds);
}
}
