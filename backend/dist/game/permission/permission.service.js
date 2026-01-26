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
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let PermissionService = class PermissionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async areFriends(userA, userB) {
        if (userA === userB)
            return true;
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
    async canSpectate(userId, sessionId) {
        const players = await this.prisma.gameParticipant.findMany({
            where: {
                sessionId,
                role: 'PLAYER',
            },
            select: { userId: true },
        });
        const playerIds = players.map(p => p.userId);
        if (playerIds.length === 0)
            return false;
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
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PermissionService);
//# sourceMappingURL=permission.service.js.map