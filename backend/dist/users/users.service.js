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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async me(userId) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            select: { id: true, username: true, avatarUrl: true, status: true },
        });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        return user;
    }
    async getById(id) {
        const user = await this.prisma.users.findUnique({
            where: { id },
            select: { id: true, username: true, avatarUrl: true, status: true },
        });
        if (!user)
            throw new common_1.NotFoundException("User not Found");
        return user;
    }
    async updateMe(id, dto) {
        if (dto.username) {
            const existing = await this.prisma.users.findUnique({
                where: { username: dto.username },
                select: { id: true },
            });
            if (existing && existing.id !== id)
                throw new common_1.ConflictException("Username already taken");
        }
        try {
            return await this.prisma.users.update({
                where: { id },
                data: {
                    ...(dto.username ? { username: dto.username } : {}),
                },
                select: { id: true, username: true, status: true, avatarUrl: true },
            });
        }
        catch (e) {
            if (e?.code == "P2025")
                throw new common_1.NotFoundException("User Not Found");
            throw e;
        }
    }
    async setStatus(userId, status) {
        return this.prisma.users.update({
            where: { id: userId },
            data: { status },
            select: { id: true, status: true },
        });
    }
    async deleteUser(id) {
        try {
            await this.prisma.users.delete({
                where: { id }
            });
            return { message: "Account Deleted" };
        }
        catch (e) {
            if (e?.code === 'P2025')
                throw new common_1.NotFoundException("User Not Found");
            throw e;
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map