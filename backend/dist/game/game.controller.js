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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const game_service_1 = require("./game.service");
const result_dto_1 = require("./dto/result.dto");
const invite_service_1 = require("./invite/invite.service");
const invite_dto_1 = require("./dto/invite.dto");
const matchmaking_service_1 = require("./matchmaking/matchmaking.service");
let GameController = class GameController {
    game;
    invite;
    mm;
    constructor(game, invite, mm) {
        this.game = game;
        this.invite = invite;
        this.mm = mm;
    }
    SubmitRes(req, id, dto) {
        return this.game.submitResult(id, req.user.id, dto);
    }
    getHistory(req) {
        return this.game.history(req.user.id);
    }
    createInvite(req, dto) {
        return this.invite.createInvite(req.user.id, dto.toUserId);
    }
    acceptInvite(req, id) {
        return this.invite.acceptInvite(id, req.user.id);
    }
    declineInvite(req, id) {
        return this.invite.declineInvite(id, req.user.id);
    }
    joinQueue(req) {
        return this.mm.joinQueue(req.user.id);
    }
    leaveQueue(req) {
        return this.mm.leaveQueue(req.user.id);
    }
    getFriendMAtch(req, friendId) {
        return this.game.getFriendActiveSession(req.user.id, Number(friendId));
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.Post)('session/:id/result'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, result_dto_1.SubmitScoreResult]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "SubmitRes", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)('invites'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, invite_dto_1.CreateInviteDto]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "createInvite", null);
__decorate([
    (0, common_1.Post)('invites/:id/accept'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "acceptInvite", null);
__decorate([
    (0, common_1.Post)('invites/:id/decline'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "declineInvite", null);
__decorate([
    (0, common_1.Post)('matchmaking/join'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "joinQueue", null);
__decorate([
    (0, common_1.Post)('matchmaking/leave'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "leaveQueue", null);
__decorate([
    (0, common_1.Get)('friends/:friendId/active-session'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "getFriendMAtch", null);
exports.GameController = GameController = __decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('game'),
    __metadata("design:paramtypes", [game_service_1.GameService,
        invite_service_1.InvitesService,
        matchmaking_service_1.MatchmakingService])
], GameController);
//# sourceMappingURL=game.controller.js.map