/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/auth/src/auth.controller.ts"
/*!******************************************!*\
  !*** ./apps/auth/src/auth.controller.ts ***!
  \******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./apps/auth/src/auth.service.ts");
const local_guard_1 = __webpack_require__(/*! ./guards/local.guard */ "./apps/auth/src/guards/local.guard.ts");
const jwt_guard_1 = __webpack_require__(/*! ./guards/jwt.guard */ "./apps/auth/src/guards/jwt.guard.ts");
const register_dto_1 = __webpack_require__(/*! ./dto/register.dto */ "./apps/auth/src/dto/register.dto.ts");
const refresh_guard_1 = __webpack_require__(/*! ./guards/refresh.guard */ "./apps/auth/src/guards/refresh.guard.ts");
const public_decorator_1 = __webpack_require__(/*! ../../../libs/common/public.decorator */ "./libs/common/public.decorator.ts");
const google_auth_guard_1 = __webpack_require__(/*! ./guards/google-auth/google-auth.guard */ "./apps/auth/src/guards/google-auth/google-auth.guard.ts");
const ft_auth_guard_1 = __webpack_require__(/*! ./guards/ft-auth/ft-auth.guard */ "./apps/auth/src/guards/ft-auth/ft-auth.guard.ts");
const resend_verification_dto_1 = __webpack_require__(/*! ./dto/resend-verification.dto */ "./apps/auth/src/dto/resend-verification.dto.ts");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(req) {
        return req.user;
    }
    async guest() {
        return this.authService.guestLogin();
    }
    async status(req) {
        return req.user;
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async verifyEmail(token) {
        return this.authService.verifyEmail(token);
    }
    async resendVerification(dto) {
        return this.authService.resendVef(dto.email);
    }
    async refresh(req) {
        return this.authService.refreshTokens(req.user.userId, req.user.refreshToken);
    }
    async logout(req) {
        return this.authService.logout(req.user.id);
    }
    async googleLogin() { }
    async googleCallback(req, res) {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        const response = await this.authService.googleLogin(req.user);
        return res.redirect(`http://localhost:5173/oauth?token=${response.accessToken}`);
    }
    async ftlogin() { }
    async ftCallback(req, res) {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        const response = await this.authService.ftLogin(req.user);
        return res.redirect(`http://localhost:5173/oauth?token=${response.accessToken}`);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.UseGuards)(local_guard_1.LocalGuard),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('guest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "guest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "status", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof register_dto_1.RegisterDto !== "undefined" && register_dto_1.RegisterDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('verify-email'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('resend-verification'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof resend_verification_dto_1.ResendVerificationDto !== "undefined" && resend_verification_dto_1.ResendVerificationDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
__decorate([
    (0, common_1.UseGuards)(refresh_guard_1.RefreshGuard),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    (0, common_1.Get)('google/login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    (0, common_1.Get)('google/callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleCallback", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(ft_auth_guard_1.FtAuthGuard),
    (0, common_1.Get)('42/login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "ftlogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(ft_auth_guard_1.FtAuthGuard),
    (0, common_1.Get)('42/callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "ftCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ },

/***/ "./apps/auth/src/auth.module.ts"
/*!**************************************!*\
  !*** ./apps/auth/src/auth.module.ts ***!
  \**************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_controller_1 = __webpack_require__(/*! ./auth.controller */ "./apps/auth/src/auth.controller.ts");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./apps/auth/src/auth.service.ts");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const local_strategy_1 = __webpack_require__(/*! ./strategies/local.strategy */ "./apps/auth/src/strategies/local.strategy.ts");
const jwt_strategy_1 = __webpack_require__(/*! ./strategies/jwt.strategy */ "./apps/auth/src/strategies/jwt.strategy.ts");
const database_1 = __webpack_require__(/*! ../../../libs/database */ "./libs/database/index.ts");
const refresh_strategy_1 = __webpack_require__(/*! ./strategies/refresh.strategy */ "./apps/auth/src/strategies/refresh.strategy.ts");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const google_oauth_config_1 = __importDefault(__webpack_require__(/*! ./config/google-oauth.config */ "./apps/auth/src/config/google-oauth.config.ts"));
const google_strategy_1 = __webpack_require__(/*! ./strategies/google.strategy */ "./apps/auth/src/strategies/google.strategy.ts");
const config_2 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const jwt_config_1 = __importDefault(__webpack_require__(/*! ./config/jwt.config */ "./apps/auth/src/config/jwt.config.ts"));
const ft_oauth_config_1 = __importDefault(__webpack_require__(/*! ./config/ft-oauth.config */ "./apps/auth/src/config/ft-oauth.config.ts"));
const ft_strategy_1 = __webpack_require__(/*! ./strategies/ft.strategy */ "./apps/auth/src/strategies/ft.strategy.ts");
const mail_service_1 = __webpack_require__(/*! ../../../apps/mail/src/mail.service */ "./apps/mail/src/mail.service.ts");
const mail_module_1 = __webpack_require__(/*! ../../../apps/mail/src/mail.module */ "./apps/mail/src/mail.module.ts");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: 'apps/auth/.env',
            }),
            mail_module_1.MailModule,
            database_1.DatabaseModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_2.ConfigService],
                useFactory: (config) => ({
                    secret: config.getOrThrow('JWT_ACCESS_SECRET'),
                    signOptions: { expiresIn: '15m' },
                }),
            }),
            config_1.ConfigModule.forFeature(google_oauth_config_1.default),
            config_1.ConfigModule.forFeature(jwt_config_1.default),
            config_1.ConfigModule.forFeature(ft_oauth_config_1.default),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, local_strategy_1.LocalStrategy, jwt_strategy_1.JwtStrategy, refresh_strategy_1.RefreshStrategy, google_strategy_1.GoogleStrategy, ft_strategy_1.FtStrategy, mail_service_1.MailService]
    })
], AuthModule);


/***/ },

/***/ "./apps/auth/src/auth.service.ts"
/*!***************************************!*\
  !*** ./apps/auth/src/auth.service.ts ***!
  \***************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const database_service_1 = __webpack_require__(/*! ../../../libs/database/database.service */ "./libs/database/database.service.ts");
const bcrypt = __importStar(__webpack_require__(/*! bcrypt */ "bcrypt"));
const mail_service_1 = __webpack_require__(/*! ../../../apps/mail/src/mail.service */ "./apps/mail/src/mail.service.ts");
const token_1 = __webpack_require__(/*! ./utils/token */ "./apps/auth/src/utils/token.ts");
const crypto_1 = __webpack_require__(/*! crypto */ "crypto");
let AuthService = class AuthService {
    jwtService;
    prisma;
    mailService;
    configService;
    constructor(jwtService, prisma, mailService, configService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.mailService = mailService;
        this.configService = configService;
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
        const link = `${process.env.FRONT_URL}/auth/verify-email?token=${raw}`;
        await this.mailService.sendVerificationMail(user.email, link);
        return { message: 'If that email exists, a verification email has been sent.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof database_service_1.DatabaseService !== "undefined" && database_service_1.DatabaseService) === "function" ? _b : Object, typeof (_c = typeof mail_service_1.MailService !== "undefined" && mail_service_1.MailService) === "function" ? _c : Object, typeof (_d = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _d : Object])
], AuthService);


/***/ },

/***/ "./apps/auth/src/config/ft-oauth.config.ts"
/*!*************************************************!*\
  !*** ./apps/auth/src/config/ft-oauth.config.ts ***!
  \*************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
function must(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env: ${name}`);
    return v;
}
exports["default"] = (0, config_1.registerAs)('ftOAuth', () => ({
    clientID: must('FT_CLIENT_ID'),
    clientSecret: must('FT_CLIENT_SECRET'),
    callbackUrl: must('FT_CALLBACK_URL'),
}));


/***/ },

/***/ "./apps/auth/src/config/google-oauth.config.ts"
/*!*****************************************************!*\
  !*** ./apps/auth/src/config/google-oauth.config.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
exports["default"] = (0, config_1.registerAs)('googleOauth', () => ({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
}));


/***/ },

/***/ "./apps/auth/src/config/jwt.config.ts"
/*!********************************************!*\
  !*** ./apps/auth/src/config/jwt.config.ts ***!
  \********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
exports["default"] = (0, config_1.registerAs)('jwt', () => ({
    jwtAccess: process.env.JWT_ACCESS_SECRET,
    jwtRefresh: process.env.JWT_REFRESH_SECRET,
}));


/***/ },

/***/ "./apps/auth/src/dto/register.dto.ts"
/*!*******************************************!*\
  !*** ./apps/auth/src/dto/register.dto.ts ***!
  \*******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class RegisterDto {
    email;
    password;
    username;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);


/***/ },

/***/ "./apps/auth/src/dto/resend-verification.dto.ts"
/*!******************************************************!*\
  !*** ./apps/auth/src/dto/resend-verification.dto.ts ***!
  \******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResendVerificationDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class ResendVerificationDto {
    email;
}
exports.ResendVerificationDto = ResendVerificationDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResendVerificationDto.prototype, "email", void 0);


/***/ },

/***/ "./apps/auth/src/guards/ft-auth/ft-auth.guard.ts"
/*!*******************************************************!*\
  !*** ./apps/auth/src/guards/ft-auth/ft-auth.guard.ts ***!
  \*******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FtAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
let FtAuthGuard = class FtAuthGuard extends (0, passport_1.AuthGuard)('42') {
    getAuthenticateOptions() {
        return { session: false };
    }
};
exports.FtAuthGuard = FtAuthGuard;
exports.FtAuthGuard = FtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], FtAuthGuard);


/***/ },

/***/ "./apps/auth/src/guards/google-auth/google-auth.guard.ts"
/*!***************************************************************!*\
  !*** ./apps/auth/src/guards/google-auth/google-auth.guard.ts ***!
  \***************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GoogleAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
let GoogleAuthGuard = class GoogleAuthGuard extends (0, passport_1.AuthGuard)('google') {
    getAuthenticateOptions() {
        return { session: false, scope: ['email', 'profile'] };
    }
};
exports.GoogleAuthGuard = GoogleAuthGuard;
exports.GoogleAuthGuard = GoogleAuthGuard = __decorate([
    (0, common_1.Injectable)()
], GoogleAuthGuard);


/***/ },

/***/ "./apps/auth/src/guards/jwt.guard.ts"
/*!*******************************************!*\
  !*** ./apps/auth/src/guards/jwt.guard.ts ***!
  \*******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const public_decorator_1 = __webpack_require__(/*! ../../../../libs/common/public.decorator */ "./libs/common/public.decorator.ts");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    reflector;
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    canActivate(context) {
        console.log("Inside JWT Guard CanActivate");
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], JwtAuthGuard);


/***/ },

/***/ "./apps/auth/src/guards/local.guard.ts"
/*!*********************************************!*\
  !*** ./apps/auth/src/guards/local.guard.ts ***!
  \*********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
let LocalGuard = class LocalGuard extends (0, passport_1.AuthGuard)('local') {
    canActivate(context) {
        return super.canActivate(context);
    }
};
exports.LocalGuard = LocalGuard;
exports.LocalGuard = LocalGuard = __decorate([
    (0, common_1.Injectable)()
], LocalGuard);


/***/ },

/***/ "./apps/auth/src/guards/refresh.guard.ts"
/*!***********************************************!*\
  !*** ./apps/auth/src/guards/refresh.guard.ts ***!
  \***********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
let RefreshGuard = class RefreshGuard extends (0, passport_1.AuthGuard)('jwt-refresh') {
};
exports.RefreshGuard = RefreshGuard;
exports.RefreshGuard = RefreshGuard = __decorate([
    (0, common_1.Injectable)()
], RefreshGuard);


/***/ },

/***/ "./apps/auth/src/strategies/ft.strategy.ts"
/*!*************************************************!*\
  !*** ./apps/auth/src/strategies/ft.strategy.ts ***!
  \*************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FtStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const ft_oauth_config_1 = __importDefault(__webpack_require__(/*! ../config/ft-oauth.config */ "./apps/auth/src/config/ft-oauth.config.ts"));
const FortyTwo = __webpack_require__(/*! passport-42 */ "passport-42");
const FortyTwoStrategy = FortyTwo.Strategy || FortyTwo;
let FtStrategy = class FtStrategy extends (0, passport_1.PassportStrategy)(FortyTwoStrategy, '42') {
    cfg;
    constructor(cfg) {
        super({
            clientID: cfg.clientID,
            clientSecret: cfg.clientSecret,
            callbackURL: cfg.callbackUrl,
        });
        this.cfg = cfg;
    }
    async validate(accessToken, refreshToken, profile) {
        const raw = profile?._json;
        const ftUser = {
            email: raw?.email,
            login: raw?.login,
            firstName: raw?.first_name,
            lastName: raw?.last_name,
            avatarUrl: raw?.image?.link,
            ftId: raw?.id,
        };
        return ftUser;
    }
};
exports.FtStrategy = FtStrategy;
exports.FtStrategy = FtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ft_oauth_config_1.default.KEY)),
    __metadata("design:paramtypes", [Object])
], FtStrategy);


/***/ },

/***/ "./apps/auth/src/strategies/google.strategy.ts"
/*!*****************************************************!*\
  !*** ./apps/auth/src/strategies/google.strategy.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GoogleStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_google_oauth20_1 = __webpack_require__(/*! passport-google-oauth20 */ "passport-google-oauth20");
const google_oauth_config_1 = __importDefault(__webpack_require__(/*! ../config/google-oauth.config */ "./apps/auth/src/config/google-oauth.config.ts"));
const auth_service_1 = __webpack_require__(/*! ../auth.service */ "./apps/auth/src/auth.service.ts");
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    googleConfiguration;
    authService;
    constructor(googleConfiguration, authService) {
        super({
            clientID: googleConfiguration.clientID,
            clientSecret: googleConfiguration.clientSecret,
            callbackURL: googleConfiguration.callbackUrl,
            scope: ['email', 'profile'],
        });
        this.googleConfiguration = googleConfiguration;
        this.authService = authService;
    }
    async validate(accessToken, refreshToken, profile, done) {
        if (!profile) {
            return done(new Error('No profile received from Google'), false);
        }
        const googleUser = {
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            avatarUrl: profile.photos?.[0]?.value,
            googleId: profile.id,
        };
        const user = await this.authService.validateGoogleUser(googleUser);
        return done(null, user);
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(google_oauth_config_1.default.KEY)),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], GoogleStrategy);


/***/ },

/***/ "./apps/auth/src/strategies/jwt.strategy.ts"
/*!**************************************************!*\
  !*** ./apps/auth/src/strategies/jwt.strategy.ts ***!
  \**************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_jwt_1 = __webpack_require__(/*! passport-jwt */ "passport-jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(config) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow('JWT_ACCESS_SECRET'),
        });
    }
    validate(payload) {
        console.log('Inside JWT strategy Validate');
        console.log(payload);
        const id = payload.sub ?? payload.id;
        if (!id)
            throw new common_1.UnauthorizedException("Token payload missing user id");
        return { id, username: payload.username };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], JwtStrategy);


/***/ },

/***/ "./apps/auth/src/strategies/local.strategy.ts"
/*!****************************************************!*\
  !*** ./apps/auth/src/strategies/local.strategy.ts ***!
  \****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_local_1 = __webpack_require__(/*! passport-local */ "passport-local");
const auth_service_1 = __webpack_require__(/*! ../auth.service */ "./apps/auth/src/auth.service.ts");
let LocalStrategy = class LocalStrategy extends (0, passport_1.PassportStrategy)(passport_local_1.Strategy) {
    authService;
    constructor(authService) {
        super();
        this.authService = authService;
    }
    async validate(username, password) {
        const token = await this.authService.validateUser({ username, password });
        if (!token)
            throw new common_1.UnauthorizedException();
        if (password === "")
            throw new common_1.UnauthorizedException("Please Provide The Password");
        return token;
    }
};
exports.LocalStrategy = LocalStrategy;
exports.LocalStrategy = LocalStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], LocalStrategy);


/***/ },

/***/ "./apps/auth/src/strategies/refresh.strategy.ts"
/*!******************************************************!*\
  !*** ./apps/auth/src/strategies/refresh.strategy.ts ***!
  \******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_jwt_1 = __webpack_require__(/*! passport-jwt */ "passport-jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let RefreshStrategy = class RefreshStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt-refresh') {
    constructor(config) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_REFRESH_SECRET,
            passReqToCallback: true,
        });
    }
    validate(req, payload) {
        const refreshToken = req.get('authorization')?.replace('Bearer ', '');
        return {
            userId: payload.sub,
            refreshToken,
        };
    }
};
exports.RefreshStrategy = RefreshStrategy;
exports.RefreshStrategy = RefreshStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], RefreshStrategy);


/***/ },

/***/ "./apps/auth/src/utils/token.ts"
/*!**************************************!*\
  !*** ./apps/auth/src/utils/token.ts ***!
  \**************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeEmailVerifyToken = makeEmailVerifyToken;
const crypto_1 = __webpack_require__(/*! crypto */ "crypto");
function makeEmailVerifyToken() {
    const raw = (0, crypto_1.randomBytes)(32).toString('base64url');
    const hash = (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
    return { raw, hash };
}


/***/ },

/***/ "./apps/mail/src/mail.module.ts"
/*!**************************************!*\
  !*** ./apps/mail/src/mail.module.ts ***!
  \**************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MailModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mail_service_1 = __webpack_require__(/*! ./mail.service */ "./apps/mail/src/mail.service.ts");
let MailModule = class MailModule {
};
exports.MailModule = MailModule;
exports.MailModule = MailModule = __decorate([
    (0, common_1.Module)({
        providers: [mail_service_1.MailService]
    })
], MailModule);


/***/ },

/***/ "./apps/mail/src/mail.service.ts"
/*!***************************************!*\
  !*** ./apps/mail/src/mail.service.ts ***!
  \***************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MailService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const nodemailer = __importStar(__webpack_require__(/*! nodemailer */ "nodemailer"));
let MailService = class MailService {
    transporter;
    constructor() {
        const host = process.env.MAIL_HOST;
        const portStr = process.env.MAIL_PORT;
        const user = process.env.MAIL_USER;
        const pass = process.env.MAIL_PASS;
        if (!host || !portStr || !user || !pass)
            throw new Error("Missing Mail_* environement variables");
        const port = Number(portStr);
        if (Number.isNaN(port))
            throw new Error("MAIL_PORT must be a number");
        this.transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: port === 465,
            auth: { user, pass },
        });
    }
    async SendEmail(data) {
        try {
            const from = process.env.MAIL_FROM || process.env.MAIL_USER || '';
            await this.transporter.sendMail({
                from,
                to: data.to,
                subject: data.subject,
                html: data.html,
                text: data.text,
            });
            return true;
        }
        catch (err) {
            console.error('NODEMAILER ERROR:', err);
            console.error('NODEMAILER MESSAGE:', err?.message);
            console.error('NODEMAILER RESPONSE:', err?.response);
            console.error('NODEMAILER CODE:', err?.code);
            throw new common_1.InternalServerErrorException('Failed to send mail');
        }
    }
    async sendVerificationMail(to, verifyLink) {
        const html = `
        <h2>Verify your email</h2>
        <p>Click the button below to verify your email address.</p>
        <p><a href="${verifyLink}">Verify Email</a></p>
        <p>If you didn't request this, ignore this email.</p>`;
        return this.SendEmail({
            to,
            subject: 'Verify your Email',
            html,
            text: `Verify your Email: ${verifyLink}`,
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);


/***/ },

/***/ "./libs/common/public.decorator.ts"
/*!*****************************************!*\
  !*** ./libs/common/public.decorator.ts ***!
  \*****************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;


/***/ },

/***/ "./libs/database/database.module.ts"
/*!******************************************!*\
  !*** ./libs/database/database.module.ts ***!
  \******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const database_service_1 = __webpack_require__(/*! ./database.service */ "./libs/database/database.service.ts");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        providers: [database_service_1.DatabaseService],
        exports: [database_service_1.DatabaseService],
    })
], DatabaseModule);


/***/ },

/***/ "./libs/database/database.service.ts"
/*!*******************************************!*\
  !*** ./libs/database/database.service.ts ***!
  \*******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const client_1 = __webpack_require__(/*! @prisma/client */ "@prisma/client");
let DatabaseService = class DatabaseService extends client_1.PrismaClient {
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);


/***/ },

/***/ "./libs/database/index.ts"
/*!********************************!*\
  !*** ./libs/database/index.ts ***!
  \********************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./database.service */ "./libs/database/database.service.ts"), exports);
__exportStar(__webpack_require__(/*! ./database.module */ "./libs/database/database.module.ts"), exports);


/***/ },

/***/ "@nestjs/common"
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
(module) {

module.exports = require("@nestjs/common");

/***/ },

/***/ "@nestjs/config"
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
(module) {

module.exports = require("@nestjs/config");

/***/ },

/***/ "@nestjs/core"
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
(module) {

module.exports = require("@nestjs/core");

/***/ },

/***/ "@nestjs/jwt"
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
(module) {

module.exports = require("@nestjs/jwt");

/***/ },

/***/ "@nestjs/passport"
/*!***********************************!*\
  !*** external "@nestjs/passport" ***!
  \***********************************/
(module) {

module.exports = require("@nestjs/passport");

/***/ },

/***/ "@prisma/client"
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
(module) {

module.exports = require("@prisma/client");

/***/ },

/***/ "bcrypt"
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
(module) {

module.exports = require("bcrypt");

/***/ },

/***/ "class-validator"
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
(module) {

module.exports = require("class-validator");

/***/ },

/***/ "crypto"
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
(module) {

module.exports = require("crypto");

/***/ },

/***/ "nodemailer"
/*!*****************************!*\
  !*** external "nodemailer" ***!
  \*****************************/
(module) {

module.exports = require("nodemailer");

/***/ },

/***/ "passport-42"
/*!******************************!*\
  !*** external "passport-42" ***!
  \******************************/
(module) {

module.exports = require("passport-42");

/***/ },

/***/ "passport-google-oauth20"
/*!******************************************!*\
  !*** external "passport-google-oauth20" ***!
  \******************************************/
(module) {

module.exports = require("passport-google-oauth20");

/***/ },

/***/ "passport-jwt"
/*!*******************************!*\
  !*** external "passport-jwt" ***!
  \*******************************/
(module) {

module.exports = require("passport-jwt");

/***/ },

/***/ "passport-local"
/*!*********************************!*\
  !*** external "passport-local" ***!
  \*********************************/
(module) {

module.exports = require("passport-local");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*******************************!*\
  !*** ./apps/auth/src/main.ts ***!
  \*******************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const auth_module_1 = __webpack_require__(/*! ./auth.module */ "./apps/auth/src/auth.module.ts");
async function bootstrap() {
    const app = await core_1.NestFactory.create(auth_module_1.AuthModule);
    await app.listen(process.env.port ?? 3001);
}
bootstrap();

})();

/******/ })()
;