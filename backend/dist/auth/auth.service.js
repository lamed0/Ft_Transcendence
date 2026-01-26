"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const database_service_1 = require("../database/database.service");
const bcrypt = __importStar(require("bcrypt"));
const mail_service_1 = require("../mail/mail.service");
const token_1 = require("./utils/token");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    jwtService;
    prisma;
    mailService;
    constructor(jwtService, prisma, mailService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async validateUser({ username, password }) {
        const user = await this.prisma.users.findUnique({
            where: { username },
        });
        if (!user)
            return null;
        if (!user.password)
            throw new common_1.UnauthorizedException('This account uses Google login');
        if (!user.isEmailVerified) {
            throw new common_1.UnauthorizedException('Please verify your email before logging in.');
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid)
            return null;
        const update = await this.prisma.users.update({
            where: { id: user.id },
            data: { status: 'ONLINE' },
            select: { id: true, username: true, status: true, email: true },
        });
        return this.signTokenWithUser(update.id);
    }
    async register(dto) {
        console.log('Register attempt:', dto);
        const exist = await this.prisma.users.findFirst({
            where: {
                OR: [{ email: dto.email }, { username: dto.username }],
            },
        });
        if (exist)
            throw new common_1.ConflictException('User already exists');
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.users.create({
            data: {
                email: dto.email,
                username: dto.username,
                password: hashed,
                isEmailVerified: false,
            },
        });
        const { raw, hash } = (0, token_1.makeEmailVerifyToken)();
        await this.prisma.email_token.create({
            data: {
                userId: user.id,
                tokenHash: hash,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            },
        });
        const link = `${process.env.FRONT_URL}/auth/verify-email?token=${raw}`;
        try {
            await this.mailService.sendVerificationMail(user.email, link);
            console.log('Verification email sent successfully to:', user.email);
        }
        catch (e) {
            console.error('SEND MAIL ERROR:', e);
            throw new common_1.InternalServerErrorException('Failed to send verification email');
        }
        return { message: 'Account created. Check your email to verify your account.', userId: user.id };
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.prisma.users.findUnique({ where: { id: userId } });
        if (!user || !user.refreshToken)
            throw new common_1.UnauthorizedException();
        const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isValid)
            throw new common_1.UnauthorizedException();
        return this.signTokenWithUser(user.id);
    }
    async logout(userId) {
        if (!userId)
            return;
        await this.prisma.users.update({
            where: { id: userId },
            data: { refreshToken: null, status: 'OFFLINE' },
        });
    }
    async signToken(userId, username) {
        await this.prisma.users.update({
            where: { id: userId },
            data: { status: "ONLINE" },
        });
        const payload = { sub: userId, username };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });
        const hashed = await bcrypt.hash(refreshToken, 10);
        await this.prisma.users.update({
            where: { id: userId },
            data: { refreshToken: hashed },
        });
        return ({ accessToken });
    }
    async validateGoogleUser(googleUser) {
        const user = await this.prisma.users.findFirst({
            where: { email: googleUser.email },
        });
        if (user)
            return user;
        return await this.prisma.users.create({
            data: {
                email: googleUser.email,
                username: `${googleUser.email.split('@')[0]}_${googleUser.googleId.slice(0, 6)}`,
                googleId: googleUser.googleId,
                avatarUrl: googleUser.avatarUrl,
                password: null,
                status: 'ONLINE',
                isEmailVerified: true,
            }
        });
    }
    async googleLogin(googleUser) {
        const user = await this.validateGoogleUser(googleUser);
        return this.signTokenWithUser(user.id);
    }
    async validateFtUser(ftUser) {
        const user = await this.prisma.users.findUnique({
            where: { email: ftUser.email },
        });
        if (user) {
            if (!user.ftId) {
                return this.prisma.users.update({
                    where: { id: user.id },
                    data: { ftId: ftUser.ftId, avatarUrl: ftUser.avatarUrl, status: 'ONLINE', isEmailVerified: true },
                });
            }
            return user;
        }
        return this.prisma.users.create({
            data: {
                email: ftUser.email,
                username: ftUser.login,
                password: null,
                ftId: ftUser.ftId,
                avatarUrl: ftUser.avatarUrl,
                status: 'ONLINE',
                isEmailVerified: true,
            },
        });
    }
    async ftLogin(ftUser) {
        const user = await this.validateFtUser(ftUser);
        return this.signTokenWithUser(user.id);
    }
    async getSafeUser(userId) {
        return this.prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                status: true,
                createdAt: true,
            },
        });
    }
    async signTokenWithUser(userId) {
        const user = await this.getSafeUser(userId);
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const tokens = await this.signToken(userId, user.username);
        return { ...tokens, user };
    }
    async guestLogin() {
        const username = `guest_${Math.random().toString(16).slice(2, 8)}`;
        const user = await this.prisma.users.create({
            data: { username, password: null, isGuest: true, avatarUrl: null },
        });
        const payload = { sub: user.id, username: user.username, isGuest: true };
        const accesToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '30',
        });
        return { accesToken, user: { id: user.id, username: user.username, avatarUrl: user.avatarUrl, status: user.status, isGuest: true }, };
    }
    async verifyEmail(rawToken) {
        if (!rawToken)
            throw new common_1.BadRequestException('Missing token');
        const tokenHash = (0, crypto_1.createHash)('sha256').update(rawToken).digest('hex');
        const tokenRow = await this.prisma.email_token.findFirst({
            where: {
                tokenHash,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
        });
        if (!tokenRow) {
            throw new common_1.BadRequestException('Invalid or expired token');
        }
        await this.prisma.$transaction([
            this.prisma.users.update({
                where: { id: tokenRow.userId },
                data: { isEmailVerified: true },
            }),
            this.prisma.email_token.update({
                where: { id: tokenRow.id },
                data: { usedAt: new Date() },
            }),
        ]);
        return { message: 'Email verified successfully. You can now log in.' };
    }
    async resendVef(email) {
        if (!email)
            throw new common_1.BadRequestException('An Email is required');
        const user = await this.prisma.users.findUnique({
            where: { email },
        });
        if (!user)
            return { message: "If that email exists, a verification email has been sent." };
        if (user.isEmailVerified)
            return { message: "Email is already verified. You can log in." };
        const lastToken = await this.prisma.email_token.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
        });
        if (lastToken) {
            const diff = Date.now() - lastToken.createdAt.getTime();
            if (diff < 60 * 100) {
                throw new common_1.HttpException('Please wait a bit before requesting again.', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
        }
        await this.prisma.email_token.updateMany({
            where: {
                userId: user.id,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            data: { usedAt: new Date() },
        });
        const { raw, hash } = (0, token_1.makeEmailVerifyToken)();
        await this.prisma.email_token.create({
            data: {
                userId: user.id,
                tokenHash: hash,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            },
        });
        const link = `${process.env.BACK_URL}/auth/verify-email?token=${raw}`;
        await this.mailService.sendVerificationMail(user.email, link);
        return { message: 'If that email exists, a verification email has been sent.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, database_service_1.DatabaseService, mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map