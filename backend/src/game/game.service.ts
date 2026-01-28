import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { SubmitScoreResult } from './dto/result.dto';
import { NotFoundError } from 'rxjs';
import { CreateCoopDto } from './dto/create-coop.dto';
import { PermissionService } from './permission/permission.service';

@Injectable()
export class GameService {
    constructor(private readonly prisma: DatabaseService, private readonly permissions: PermissionService){}

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

    async submitResult(sessionId: string, userId: number, dto: SubmitScoreResult){
        const session = await this.prisma.gameSession.findUnique({
            where: { id: sessionId },
            include: { participants: true },
        });
        if (!session) throw new NotFoundException('Session not found');

        const isPlayer = session.participants.some(
            (p) => p.userId === userId && p.role === 'PLAYER',
        );
        if (!isPlayer) throw new BadRequestException('Not allowed');
        if (session.status === 'FINISHED') throw new BadRequestException('Already finished');

        return this.prisma.gameSession.update({
            where: { id: sessionId },
            data: {
                status: 'FINISHED',
                scoreA: dto.scoreA,
                scoreB: dto.scoreB,
                endedAt: new Date(),
            },
            select: { id: true, status: true, scoreA: true, scoreB: true },
        });
    }

    async history(userId: number) {
        return this.prisma.gameSession.findMany({
        where: {
            status: 'FINISHED',
            participants: { some: { userId, role: 'PLAYER' } },
        },
        orderBy: { endedAt: 'desc' },
        take: 30,
        include: {
            participants: { select: { userId: true, role: true } },
        },
        });
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
}
