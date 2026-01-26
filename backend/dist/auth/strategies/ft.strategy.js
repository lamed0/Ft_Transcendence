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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const ft_oauth_config_1 = __importDefault(require("../config/ft-oauth.config"));
const FortyTwo = require('passport-42');
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
    __metadata("design:paramtypes", [void 0])
], FtStrategy);
//# sourceMappingURL=ft.strategy.js.map