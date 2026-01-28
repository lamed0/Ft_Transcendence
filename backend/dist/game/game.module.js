"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModule = void 0;
const common_1 = require("@nestjs/common");
const game_controller_1 = require("./game.controller");
const game_service_1 = require("./game.service");
const permission_service_1 = require("./permission/permission.service");
const database_service_1 = require("../database/database.service");
const invite_service_1 = require("./invite/invite.service");
const game_gateway_1 = require("./realtime/game.gateway");
const jwt_1 = require("@nestjs/jwt");
const matchmaking_service_1 = require("./matchmaking/matchmaking.service");
let GameModule = class GameModule {
};
exports.GameModule = GameModule;
exports.GameModule = GameModule = __decorate([
    (0, common_1.Module)({
        controllers: [game_controller_1.GameController],
        providers: [game_service_1.GameService, permission_service_1.PermissionService, database_service_1.DatabaseService, invite_service_1.InvitesService, game_gateway_1.GameGateway, jwt_1.JwtService, matchmaking_service_1.MatchmakingService]
    })
], GameModule);
//# sourceMappingURL=game.module.js.map