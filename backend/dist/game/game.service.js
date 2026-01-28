"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const permission_service_1 = require("./permission/permission.service");
let GameService = class GameService {
    prisma;
    permissions;
    constructor(prisma, permissions) {
        this.prisma = prisma;
        this.permissions = permissions;
    }
    async submitResult(sessionId, userId, dto) {
        const session = await this.prisma.gameSession.findUnique({
            where: { id: sessionId },
            include: { participants: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        const isPlayer = session.participants.some((p) => p.userId === userId && p.role === 'PLAYER');
        if (!isPlayer)
            throw new common_1.BadRequestException('Not allowed');
        if (session.status === 'FINISHED')
            throw new common_1.BadRequestException('Already finished');
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
    async history(userId) {
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
    async getFriendActiveSession(myId, friendId) {
        const areFriends = await this.permissions.areFriends(myId, friendId);
        if (!areFriends)
            throw new common_1.ForbiddenException('Not friends');
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
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService, permission_service_1.PermissionService])
], GameService);
//# sourceMappingURL=game.service.js.map