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
exports.FriendsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const friends_utils_1 = require("./utils/friends.utils");
let FriendsService = class FriendsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkUserExist(userId) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        return user;
    }
    async sendReq(meId, otherId) {
        if (meId === otherId)
            throw new common_1.BadRequestException('Cannot friend yourself');
        await this.checkUserExist(meId);
        await this.checkUserExist(otherId);
        const { low, high } = (0, friends_utils_1.normalizePair)(meId, otherId);
        const existing = await this.prisma.friends.findUnique({
            where: { userLowId_userHighId: { userLowId: low, userHighId: high } },
        });
        if (!existing) {
            return this.prisma.friends.create({
                data: {
                    userLowId: low,
                    userHighId: high,
                    requestedBy: meId,
                    status: 'PENDING',
                },
            });
        }
        if (existing.status === 'ACCEPTED')
            throw new common_1.ConflictException('Already friends');
        if (existing.requestedBy === meId)
            throw new common_1.ConflictException('Request already sent');
        throw new common_1.ConflictException('You already have an incoming friend request from this user');
    }
    async acceptReq(meId, otherId) {
        if (meId === otherId)
            throw new common_1.BadRequestException('Invalid user');
        await this.checkUserExist(meId);
        await this.checkUserExist(otherId);
        const { low, high } = (0, friends_utils_1.normalizePair)(meId, otherId);
        const fr = await this.prisma.friends.findUnique({
            where: { userLowId_userHighId: { userLowId: low, userHighId: high } },
        });
        if (!fr || fr.status !== 'PENDING')
            throw new common_1.NotFoundException('No pending request');
        if (fr.requestedBy === meId)
            throw new common_1.ForbiddenException('You cannot accept your own request');
        return this.prisma.friends.update({
            where: { id: fr.id },
            data: { status: 'ACCEPTED' },
        });
    }
    async deleteRelationship(meId, otherId) {
        if (meId === otherId)
            throw new common_1.BadRequestException('Invalid user');
        await this.checkUserExist(meId);
        await this.checkUserExist(otherId);
        const { low, high } = (0, friends_utils_1.normalizePair)(meId, otherId);
        const fr = await this.prisma.friends.findUnique({
            where: { userLowId_userHighId: { userLowId: low, userHighId: high } },
        });
        if (!fr)
            throw new common_1.NotFoundException('Relationship not found');
        if (fr.status === 'PENDING') {
            return this.prisma.friends.delete({ where: { id: fr.id } });
        }
        if (fr.status === 'ACCEPTED') {
            return this.prisma.friends.delete({ where: { id: fr.id } });
        }
        throw new common_1.NotFoundException('Relationship not found');
    }
    async listFriends(meId) {
        const rows = await this.prisma.friends.findMany({
            where: {
                status: 'ACCEPTED',
                OR: [{ userLowId: meId }, { userHighId: meId }],
            },
            include: {
                userLow: { select: { id: true, username: true, avatarUrl: true, status: true } },
                userHigh: { select: { id: true, username: true, avatarUrl: true, status: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return rows.map((r) => (r.userLowId === meId ? r.userHigh : r.userLow));
    }
};
exports.FriendsService = FriendsService;
exports.FriendsService = FriendsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], FriendsService);
//# sourceMappingURL=friends.service.js.map