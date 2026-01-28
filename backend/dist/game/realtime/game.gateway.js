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
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const socket_auth_guard_1 = require("./socket-auth.guard");
const database_service_1 = require("../../database/database.service");
const permission_service_1 = require("../permission/permission.service");
let GameGateway = class GameGateway {
    prisma;
    permissions;
    server;
    activePlayers = new Map();
    disconnectTimers = new Map();
    lastState = new Map();
    hostBySession = new Map();
    runtime = new Map();
    constructor(prisma, permissions) {
        this.prisma = prisma;
        this.permissions = permissions;
    }
    handleConnection(client) {
        const userId = client.data.user.id;
        client.join(`user:${userId}`);
    }
    handleDisconnect(client) {
        const userId = client.data?.user?.id;
        if (!userId)
            return;
        for (const [sessionId, playersMap] of this.activePlayers.entries()) {
            const currentSocketId = playersMap.get(userId);
            if (currentSocketId !== client.id)
                continue;
            const timersMap = this.disconnectTimers.get(sessionId) ?? new Map();
            if (timersMap.has(userId))
                continue;
            const t = setTimeout(() => {
                void this.endMatch(sessionId, {
                    reason: 'PLAYER_DISCONNECTED',
                    loserId: userId,
                });
            }, 10000);
            timersMap.set(userId, t);
            this.disconnectTimers.set(sessionId, timersMap);
            this.server
                .to(this.matchRoom(sessionId))
                .emit('player.disconnected', { userId });
        }
    }
    matchRoom(sessionId) {
        return `match:${sessionId}`;
    }
    ensureRuntime(sessionId) {
        if (!this.runtime.has(sessionId)) {
            this.runtime.set(sessionId, { players: new Set(), started: false });
        }
        return this.runtime.get(sessionId);
    }
    cancelDisconnectTimer(sessionId, userId) {
        const timersMap = this.disconnectTimers.get(sessionId);
        if (!timersMap)
            return;
        const t = timersMap.get(userId);
        if (!t)
            return;
        clearTimeout(t);
        timersMap.delete(userId);
        if (timersMap.size === 0)
            this.disconnectTimers.delete(sessionId);
    }
    async endMatch(sessionId, payload) {
        const room = this.matchRoom(sessionId);
        this.server.to(room).emit('gameOver', payload);
        const isCanceled = payload?.reason === 'PLAYER_DISCONNECTED' || payload?.reason === 'PLAYER_LEFT';
        await this.prisma.gameSession.update({
            where: { id: sessionId },
            data: { status: isCanceled ? 'CANCELED' : 'FINISHED' },
        });
        await this.setPlayersOnline(sessionId);
        this.runtime.delete(sessionId);
        this.hostBySession.delete(sessionId);
        this.lastState.delete(sessionId);
        this.activePlayers.delete(sessionId);
        const timers = this.disconnectTimers.get(sessionId);
        if (timers) {
            for (const t of timers.values())
                clearTimeout(t);
            this.disconnectTimers.delete(sessionId);
        }
    }
    notifyInvite(toUserId, payload) {
        this.server.to(`user:${toUserId}`).emit('invite.received', payload);
    }
    notifyGameReady(userIds, sessionId) {
        for (const id of userIds) {
            this.server.to(`user:${id}`).emit('game.ready', { sessionId });
        }
    }
    notifyMatched(userIds, sessionId) {
        for (const id of userIds) {
            this.server.to(`user:${id}`).emit('mm.matched', { sessionId });
        }
    }
    async matchJoin(client, body) {
        const userId = client.data.user.id;
        const sessionId = body.sessionId;
        const role = body.as;
        const session = await this.prisma.gameSession.findUnique({
            where: { id: sessionId },
            select: { id: true },
        });
        if (!session) {
            client.emit('match.denied', { reason: 'SESSION_NOT_FOUND' });
            return;
        }
        client.data.matchRoles = client.data.matchRoles || {};
        client.data.matchRoles[sessionId] = role;
        if (role === 'player') {
            const isPlayer = await this.prisma.gameParticipant.findFirst({
                where: { sessionId, userId },
                select: { id: true },
            });
            if (!isPlayer) {
                client.emit('match.denied', { reason: 'NOT_A_PLAYER' });
                delete client.data.matchRoles[sessionId];
                return;
            }
            const rt = this.ensureRuntime(sessionId);
            if (rt.players.size >= 2 && !rt.players.has(userId)) {
                client.emit('match.denied', { reason: 'MATCH_FULL' });
                delete client.data.matchRoles[sessionId];
                return;
            }
            const playersMap = this.activePlayers.get(sessionId) ?? new Map();
            playersMap.set(userId, client.id);
            this.activePlayers.set(sessionId, playersMap);
            if (!this.hostBySession.has(sessionId)) {
                this.hostBySession.set(sessionId, userId);
            }
            this.cancelDisconnectTimer(sessionId, userId);
            rt.players.add(userId);
            if (rt.players.size === 2 && !rt.started) {
                rt.started = true;
                await this.prisma.gameSession.update({
                    where: { id: sessionId },
                    data: { status: 'LIVE' },
                });
                await this.setPlayersInGame(sessionId);
                this.server.to(this.matchRoom(sessionId)).emit('match.start', {
                    sessionId,
                    hostUserId: this.hostBySession.get(sessionId),
                    ts: Date.now(),
                });
            }
            this.server.to(this.matchRoom(sessionId)).emit('player.reconnected', { userId });
        }
        else {
            const ok = await this.permissions.canSpectate(userId, sessionId);
            if (!ok) {
                client.emit('match.denied', { reason: 'FRIENDS_ONLY' });
                delete client.data.matchRoles[sessionId];
                return;
            }
        }
        const room = this.matchRoom(sessionId);
        client.join(room);
        client.emit('match.joined', { sessionId, role });
        this.server.to(room).emit('match.notice', {
            type: role === 'spectator' ? 'SPECTATOR_JOINED' : 'PLAYER_JOINED',
            userId,
        });
        const snapshot = this.lastState.get(sessionId);
        if (snapshot) {
            client.emit('state', snapshot);
        }
    }
    matchLeave(client, body) {
        const userId = client.data.user.id;
        const sessionId = body.sessionId;
        const room = this.matchRoom(sessionId);
        const role = client.data.matchRoles?.[sessionId];
        client.leave(room);
        if (client.data.matchRoles?.[sessionId]) {
            delete client.data.matchRoles[sessionId];
        }
        if (role === 'player') {
            void this.endMatch(sessionId, { reason: 'PLAYER_LEFT', loserId: userId });
        }
    }
    input(client, body) {
        const sessionId = body.sessionId;
        const role = client.data.matchRoles?.[sessionId];
        if (role !== 'player') {
            client.emit('input.denied', { reason: 'SPECTATOR_NO_INPUT' });
            return;
        }
        this.server.to(this.matchRoom(sessionId)).emit('input', {
            userId: client.data.user.id,
            player: body.player,
            dy: body.dy,
            t: Date.now(),
        });
    }
    statePush(client, body) {
        const sessionId = body.sessionId;
        const role = client.data.matchRoles?.[sessionId];
        if (role !== 'player') {
            client.emit('state.denied', { reason: 'SPECTATOR_NO_STATE' });
            return;
        }
        const hostId = this.hostBySession.get(sessionId);
        if (hostId && hostId !== client.data.user.id) {
            client.emit('state.denied', { reason: 'ONLY_HOST_CAN_PUSH_STATE' });
            return;
        }
        this.lastState.set(sessionId, body.state);
        this.server.to(this.matchRoom(sessionId)).emit('state', body.state);
    }
    broadcastState(sessionId, state) {
        this.lastState.set(sessionId, state);
        this.server.to(this.matchRoom(sessionId)).emit('state', state);
    }
    async getPlayerIds(sessionId) {
        const rows = await this.prisma.gameParticipant.findMany({
            where: { sessionId, role: 'PLAYER' },
            select: { userId: true },
        });
        return rows.map(r => r.userId);
    }
    async setPlayersInGame(sessionId) {
        const playerIds = await this.getPlayerIds(sessionId);
        if (playerIds.length === 0)
            return;
        await this.prisma.users.updateMany({
            where: { id: { in: playerIds } },
            data: { status: 'IN_GAME' },
        });
    }
    async setPlayersOnline(sessionId) {
        const playerIds = await this.getPlayerIds(sessionId);
        if (playerIds.length === 0)
            return;
        await this.prisma.users.updateMany({
            where: { id: { in: playerIds } },
            data: { status: 'ONLINE' },
        });
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(socket_auth_guard_1.SocketAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleConnection", null);
__decorate([
    (0, common_1.UseGuards)(socket_auth_guard_1.SocketAuthGuard),
    (0, websockets_1.SubscribeMessage)('match.join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "matchJoin", null);
__decorate([
    (0, common_1.UseGuards)(socket_auth_guard_1.SocketAuthGuard),
    (0, websockets_1.SubscribeMessage)('match.leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "matchLeave", null);
__decorate([
    (0, common_1.UseGuards)(socket_auth_guard_1.SocketAuthGuard),
    (0, websockets_1.SubscribeMessage)('input'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "input", null);
__decorate([
    (0, common_1.UseGuards)(socket_auth_guard_1.SocketAuthGuard),
    (0, websockets_1.SubscribeMessage)('state.push'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "statePush", null);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/game', cors: true }),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        permission_service_1.PermissionService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map