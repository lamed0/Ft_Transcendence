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
exports.MatchmakingService = void 0;
const common_1 = require("@nestjs/common");
const game_gateway_1 = require("../realtime/game.gateway");
const database_service_1 = require("../../database/database.service");
let MatchmakingService = class MatchmakingService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async joinQueue(userId) {
        const already = await this.prisma.matchmakingTicket.findFirst({
            where: { userId, status: 'SEARCHING' },
            select: { id: true },
        });
        if (already)
            return { status: 'SEARCHING' };
        const myTicket = await this.prisma.matchmakingTicket.create({
            data: { userId, status: 'SEARCHING' },
            select: { id: true, createdAt: true },
        });
        const partner = await this.prisma.matchmakingTicket.findFirst({
            where: { status: 'SEARCHING', userId: { not: userId } },
            orderBy: { createdAt: 'asc' },
            select: { id: true, userId: true },
        });
        if (!partner)
            return { status: 'SEARCHING' };
        const match = await this.prisma.$transaction(async (tx) => {
            const p = await tx.matchmakingTicket.findUnique({
                where: { id: partner.id },
                select: { status: true, userId: true },
            });
            if (!p || p.status !== 'SEARCHING')
                return null;
            const session = await tx.gameSession.create({
                data: {
                    mode: 'ONEVONE_QUEUE',
                    status: 'WAITING',
                    participants: {
                        create: [
                            { userId: userId },
                            { userId: p.userId },
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
            return { sessionId: session.id, players: [userId, p.userId] };
        });
        if (!match)
            return { status: 'SEARCHING' };
        this.gateway.notifyMatched([...match.players], match.sessionId);
        return { status: 'MATCHED', sessionId: match.sessionId };
    }
    async leaveQueue(userId) {
        await this.prisma.matchmakingTicket.updateMany({
            where: { userId, status: 'SEARCHING' },
            data: { status: 'CANCELED' },
        });
        return { status: 'CANCELED' };
    }
};
exports.MatchmakingService = MatchmakingService;
exports.MatchmakingService = MatchmakingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        game_gateway_1.GameGateway])
], MatchmakingService);
//# sourceMappingURL=matchmaking.service.js.map