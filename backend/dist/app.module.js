"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const database_service_1 = require("./database/database.service");
const database_module_1 = require("./database/database.module");
const users_module_1 = require("./users/users.module");
const mail_module_1 = require("./mail/mail.module");
const mail_service_1 = require("./mail/mail.service");
const friends_module_1 = require("./friends/friends.module");
const friends_service_1 = require("./friends/friends.service");
const game_module_1 = require("./game/game.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot({ isGlobal: true }), auth_module_1.AuthModule, database_module_1.DatabaseModule, users_module_1.UsersModule, mail_module_1.MailModule, friends_module_1.FriendsModule, game_module_1.GameModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, database_service_1.DatabaseService, mail_service_1.MailService, friends_service_1.FriendsService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map