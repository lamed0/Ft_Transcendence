"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const local_strategy_1 = require("./strategies/local.strategy");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const database_module_1 = require("../database/database.module");
const refresh_strategy_1 = require("./strategies/refresh.strategy");
const config_1 = require("@nestjs/config");
const google_oauth_config_1 = __importDefault(require("./config/google-oauth.config"));
const google_strategy_1 = require("./strategies/google.strategy");
const config_2 = require("@nestjs/config");
const jwt_config_1 = __importDefault(require("./config/jwt.config"));
const ft_oauth_config_1 = __importDefault(require("./config/ft-oauth.config"));
const ft_strategy_1 = require("./strategies/ft.strategy");
const mail_service_1 = require("../mail/mail.service");
const mail_module_1 = require("../mail/mail.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mail_module_1.MailModule,
            config_1.ConfigModule,
            database_module_1.DatabaseModule,
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
//# sourceMappingURL=auth.module.js.map