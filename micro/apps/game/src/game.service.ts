import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { GameDatabaseService } from './game-database.service';
import { SubmitScoreResult } from './dto/result.dto';
import { NotFoundError } from 'rxjs';
import { CreateCoopDto } from './dto/create-coop.dto';
import { PermissionService } from './permission/permission.service';
import { UsersClient } from './clients/users.client';

@Injectable()
export class GameService {
    constructor(
        private readonly prisma: GameDatabaseService,
        private readonly permissions: PermissionService,
        private readonly userClient: UsersClient,
    ){}

    // async createCoop(dto: CreateCoopDto){
    //     return this.prisma.gameSession.create({
    //         data: {
    //             mode: 'COOP_LOCAL',
    //             status: 'LIVE',
    //             hostUserId: null,
    //             offlineP1: dto.nameP1 ?? 'P1',
    //             offlineP2: dto.nameP2 ?? 'P2',
    //             startedAt: new Date(),
    //         },
    //         select: { id: true, mode: true, status: true, offlineP1: true, offlineP2: true },
    //     });
    // }

    async submitResult(sessionId: string, userId: number, dto: SubmitScoreResult) {
        const session = await this.prisma.gameSession.findUnique({
            where: { id: sessionId },
            include: { participants: true },
        });
        if (!session) throw new NotFoundException('Session not found');
        if (session.status === 'CANCELED') throw new BadRequestException('Session canceled');

        const isPlayer = session.participants.some(
            (p) => p.userId === userId && p.role === 'PLAYER',
        );
        if (!isPlayer) throw new BadRequestException('Not allowed');
        if (session.status === 'FINISHED') throw new BadRequestException('Already finished');

        // Determine which player is submitting
        const playerIndex = session.participants.findIndex(p => p.userId === userId && p.role === 'PLAYER');
        const updateData: any = {};
        if (playerIndex === 0) {
            updateData.scoreA = dto.scoreA;
            if (dto.level !== undefined) updateData.playerALevel = dto.level;
        } else {
            updateData.scoreB = dto.scoreB;
            if (dto.level !== undefined) updateData.playerBLevel = dto.level;
        }

        const result = await this.prisma.gameSession.update({
            where: { id: sessionId },
            data: updateData,
            select: { id: true, status: true, scoreA: true, scoreB: true, playerALevel: true, playerBLevel: true, participants: true },
        });

        // Only finish and sync levels if both players have submitted (both scores and levels set)
        if (
            result.scoreA !== null && result.scoreB !== null &&
            result.playerALevel !== null && result.playerBLevel !== null
        ) {
            await this.prisma.gameSession.update({
                where: { id: sessionId },
                data: { status: 'FINISHED', endedAt: new Date() },
            });

            const playerLevels = result.participants
                .map((p, idx) => {
                    const level = idx === 0 ? result.playerALevel : result.playerBLevel;
                    return level !== null ? { userId: p.userId, level } : null;
                })
                .filter((p): p is { userId: number; level: number } => p !== null);

            if (playerLevels.length > 0) {
                await this.userClient.batchUpdateLevels(playerLevels).catch(() => {});
            }
        }

        return result;
}

    // async syncUserLevels(sessionId: string) {
    //     const session = await this.prisma.gameSession.findUnique({
    //         where: { id: sessionId },
    //         include: { participants: true },
    //     });
    //     if (!session) throw new NotFoundException('Session not found');
    //     if (session.status !== 'FINISHED') throw new BadRequestException('Session not finished');

    //     const playerLevels = session.participants
    //         .map((p, idx) => {
    //             const level = idx === 0 ? session.playerALevel : session.playerBLevel;
    //             return level !== null ? { userId: p.userId, level } : null;
    //         })
    //         .filter((p): p is { userId: number; level: number } => p !== null);
        
    //     if (playerLevels.length > 0) {
    //         await this.userClient.batchUpdateLevels(playerLevels).catch(() => {});
    //     }

    //     return { success: true, sessionId };
    // }

    async history(userId: number) {
        const sessions = await this.prisma.gameSession.findMany({
            where: {
                status: 'FINISHED',
                participants: { some: { userId, role: 'PLAYER' } },
            },
            orderBy: { endedAt: 'desc' },
            take: 30,
            select: {
                id: true,
                mode: true,
                status: true,
                scoreA: true,
                scoreB: true,
                playerALevel: true,
                playerBLevel: true,
                startedAt: true,
                endedAt: true,
                participants: { select: { userId: true, role: true } },
            },
        });

        // Fetch user details for all participants
        const userIds = new Set<number>();
        sessions.forEach(session => {
            session.participants.forEach(p => userIds.add(p.userId));
        });

        const users = await this.userClient.batch(Array.from(userIds));
        const userMap = new Map(users.map(u => [u.id, u]));

        // Enrich sessions with user details
        return sessions.map(session => ({
            ...session,
            participants: session.participants.map(p => ({
                ...p,
                username: userMap.get(p.userId)?.username || 'Unknown',
            })),
        }));
    }

    async getFriendActiveSession(myId: number, friendId: number) {
        const areFriends = await this.permissions.areFriends(myId, friendId);
        if (!areFriends) throw new ForbiddenException('Not friends');

        const session = await this.prisma.gameSession.findFirst({
        where: {
            status: { in: ['WAITING', 'LIVE'] },
            participants: {
            some: {
                role: 'PLAYER',
                userId: friendId,
            },
            },
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true, mode: true },
        });

        return {
            sessionId: session?.id ?? null,
            status: session?.status ?? null,
            mode: session?.mode ?? null,
        };
    }

    async updateSessionScore(sessionId: string, userId: number, score: number) {
        try {
            console.log(`Updating session ${sessionId} for user ${userId} with score ${score}`);
            
            const session = await this.prisma.gameSession.findUnique({
                where: { id: sessionId },
                include: { participants: true },
            });
            
            if (!session) {
                console.error(`Session not found: ${sessionId}`);
                throw new NotFoundException('Session not found');
            }
            
            console.log(`Found session, participants:`, session.participants);
            
            const isPlayer = session.participants.some(p => p.userId === userId);
            if (!isPlayer) {
                console.error(`User ${userId} not in session ${sessionId}`);
                throw new BadRequestException('User not in this session');
            }

            // Update the player's score (assumes first player is scoreA, second is scoreB)
            const playerIndex = session.participants.findIndex(p => p.userId === userId && p.role === 'PLAYER');
            if (playerIndex === -1) {
                console.error(`User ${userId} is not a PLAYER in session ${sessionId}. Participants:`, session.participants);
                throw new BadRequestException('User is not a player');
            }

            const updateData = playerIndex === 0 ? { scoreA: score } : { scoreB: score };
            
            console.log(`Updating session with data:`, updateData);

            return this.prisma.gameSession.update({
                where: { id: sessionId },
                data: updateData,
                select: { id: true, scoreA: true, scoreB: true, status: true },
            });
        } catch (error) {
            console.error('Error in updateSessionScore:', error);
            throw error;
        }
    }

    async getSessionPlayers(sessionId: string) {
        const participants = await this.prisma.gameParticipant.findMany({
            where: { sessionId, role: 'PLAYER' },
            select: { userId: true, role: true, joinedAt: true }, 
        });
        
        if (!participants.length) throw new NotFoundException('Session not found');
        
        const users = await this.userClient.batch(
            participants.map(p => p.userId)
        );
        
        return {
            sessionId,
            participants,
            players: users
        };
    }

    async updatePlayerLevels(playerLevels: { userId: number; level: number }[]) {
        const results: { userId: number; newLevel: number }[] = [];
        
        for (const { userId, level } of playerLevels) {
            try {
                // Call auth service to update user level
                await this.userClient.updateLevel(userId, level);
                results.push({
                    userId,
                    newLevel: level
                });
            } catch (error) {
                console.error(`Failed to update level for user ${userId}:`, error);
            }
        }
        
        return { updated: results };
    }
}
