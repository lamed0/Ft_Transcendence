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
exports.InvitesService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const permission_service_1 = require("../permission/permission.service");
const game_gateway_1 = require("../realtime/game.gateway");
let InvitesService = class InvitesService {
    prisma;
    permissions;
    gateway;
    constructor(prisma, permissions, gateway) {
        this.prisma = prisma;
        this.permissions = permissions;
        this.gateway = gateway;
    }
    async createInvite(fromUserId, toUserId) {
        if (fromUserId === toUserId)
            throw new common_1.BadRequestException('Cannot invite yourself');
        const areFriends = await this.permissions.areFriends(fromUserId, toUserId);
        if (!areFriends)
            throw new common_1.ForbiddenException('You are not friends');
        const existing = await this.prisma.gameInvite.findFirst({
            where: {
                fromUserId,
                toUserId,
                status: 'PENDING',
            },
        });
        if (existing)
            return { inviteId: existing.id };
        const invite = await this.prisma.gameInvite.create({
            data: { fromUserId, toUserId },
        });
        this.gateway.notifyInvite(toUserId, {
            inviteId: invite.id,
            fromUserId,
        });
        return { inviteId: invite.id };
    }
    async acceptInvite(inviteId, userId) {
        const invite = await this.prisma.gameInvite.findUnique({
            where: { id: inviteId },
        });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        if (invite.toUserId !== userId)
            throw new common_1.ForbiddenException('Not your invite');
        if (invite.status !== 'PENDING')
            throw new common_1.BadRequestException('Invite already handled');
        const session = await this.prisma.$transaction(async (tx) => {
            const game = await tx.gameSession.create({
                data: {
                    mode: 'ONEVONE_INVITE',
                    participants: {
                        create: [
                            { userId: invite.fromUserId },
                            { userId: invite.toUserId },
                        ],
                    },
                },
            });
            await tx.gameInvite.update({
                where: { id: inviteId },
                data: {
                    status: 'ACCEPTED',
                    respondedAt: new Date(),
                    sessionId: game.id,
                },
            });
            return game;
        });
        this.gateway.notifyGameReady([invite.fromUserId, invite.toUserId], session.id);
        return {
            sessionId: session.id,
            players: [invite.fromUserId, invite.toUserId],
        };
    }
    async declineInvite(inviteId, userId) {
        const invite = await this.prisma.gameInvite.findUnique({
            where: { id: inviteId },
        });
        if (!invite)
            throw new common_1.NotFoundException();
        if (invite.toUserId !== userId)
            throw new common_1.ForbiddenException();
        await this.prisma.gameInvite.update({
            where: { id: inviteId },
            data: {
                status: 'DECLINED',
                respondedAt: new Date(),
            },
        });
        return { status: 'DECLINED' };
    }
};
exports.InvitesService = InvitesService;
exports.InvitesService = InvitesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService, permission_service_1.PermissionService,
        game_gateway_1.GameGateway])
], InvitesService);
//# sourceMappingURL=invite.service.js.map