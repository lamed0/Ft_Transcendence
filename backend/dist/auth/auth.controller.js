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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const local_guard_1 = require("./guards/local.guard");
const jwt_guard_1 = require("./guards/jwt.guard");
const register_dto_1 = require("./dto/register.dto");
const refresh_guard_1 = require("./guards/refresh.guard");
const public_decorator_1 = require("../common/decorators/public.decorator");
const google_auth_guard_1 = require("./guards/google-auth/google-auth.guard");
const ft_auth_guard_1 = require("./guards/ft-auth/ft-auth.guard");
const resend_verification_dto_1 = require("./dto/resend-verification.dto");
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
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
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
    __metadata("design:paramtypes", [resend_verification_dto_1.ResendVerificationDto]),
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
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map