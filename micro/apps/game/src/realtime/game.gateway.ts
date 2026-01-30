import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { SocketAuthGuard } from './socket-auth.guard';
import { GameDatabaseService } from '../game-database.service';
import { PermissionService } from '../permission/permission.service';

type JoinAs = 'player' | 'spectator';

@WebSocketGateway({ namespace: '/game', cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // sessionId -> { userId -> socketId }
  private activePlayers = new Map<string, Map<number, string>>();

  // sessionId -> { userId -> timeout }
  private disconnectTimers = new Map<string, Map<number, NodeJS.Timeout>>();

  // sessionId -> last state snapshot (for late joiners/spectators)
  private lastState = new Map<string, any>();

  // sessionId -> host userId (only host can push state)
  private hostBySession = new Map<string, number>();

  // sessionId -> runtime connected players + started flag (for match.start)
  private runtime = new Map<string, { players: Set<number>; started: boolean }>();

  constructor(
    private prisma: GameDatabaseService,
    private permissions: PermissionService,
  ) {}

  // ---------- connection lifecycle ----------
  @UseGuards(SocketAuthGuard)
  handleConnection(client: Socket) {
    const userId = client.data.user.id as number;
    client.join(`user:${userId}`);
  }

  handleDisconnect(client: Socket) {
    const userId: number | undefined = client.data?.user?.id;
    if (!userId) return;

    for (const [sessionId, playersMap] of this.activePlayers.entries()) {
      const currentSocketId = playersMap.get(userId);
      if (currentSocketId !== client.id) continue;

      const timersMap =
        this.disconnectTimers.get(sessionId) ?? new Map<number, NodeJS.Timeout>();

      // avoid multiple timers for same user+session
      if (timersMap.has(userId)) continue;

      const t = setTimeout(() => {
        // if they didn't reconnect => forfeit/end match
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

  // ---------- helpers ----------
  private matchRoom(sessionId: string) {
    return `match:${sessionId}`;
  }

  private ensureRuntime(sessionId: string) {
    if (!this.runtime.has(sessionId)) {
      this.runtime.set(sessionId, { players: new Set<number>(), started: false });
    }
    return this.runtime.get(sessionId)!;
  }

  private cancelDisconnectTimer(sessionId: string, userId: number) {
    const timersMap = this.disconnectTimers.get(sessionId);
    if (!timersMap) return;

    const t = timersMap.get(userId);
    if (!t) return;

    clearTimeout(t);
    timersMap.delete(userId);

    if (timersMap.size === 0) this.disconnectTimers.delete(sessionId);
  }

  private async endMatch(sessionId: string, payload: any) {
    const room = this.matchRoom(sessionId);

    // notify everyone
    this.server.to(room).emit('gameOver', payload);

    // ✅ mark session finished/canceled (optional)
    const isCanceled = payload?.reason === 'PLAYER_DISCONNECTED' || payload?.reason === 'PLAYER_LEFT';
    await this.prisma.gameSession.update({
        where: { id: sessionId },
        data: { status: isCanceled? 'CANCELED' : 'FINISHED' }, // or 'CANCELED' if reason is disconnect/leave
    });

    // ✅ set players ONLINE again
    await this.setPlayersOnline(sessionId);

    // cleanup in-memory
    this.runtime.delete(sessionId);
    this.hostBySession.delete(sessionId);
    this.lastState.delete(sessionId);
    this.activePlayers.delete(sessionId);

    const timers = this.disconnectTimers.get(sessionId);
    if (timers) {
        for (const t of timers.values()) clearTimeout(t);
        this.disconnectTimers.delete(sessionId);
    }
    }


  // ---------- notify methods (used by services) ----------
  notifyInvite(toUserId: number, payload: any) {
    this.server.to(`user:${toUserId}`).emit('invite.received', payload);
  }

  notifyGameReady(userIds: number[], sessionId: string) {
    for (const id of userIds) {
      this.server.to(`user:${id}`).emit('game.ready', { sessionId });
    }
  }

  notifyMatched(userIds: number[], sessionId: string) {
    for (const id of userIds) {
      const opponentId = userIds.find(userId => userId !== id);
      this.server.to(`user:${id}`).emit('mm.matched', { sessionId, opponentId, players: userIds });
    }
  }

  // ---------- match join / leave ----------
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('match.join')
  async matchJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { sessionId: string; as: JoinAs },
  ) {
    const userId = client.data.user.id as number;
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

    // store role early (helps future handlers)
    client.data.matchRoles = client.data.matchRoles || {};
    client.data.matchRoles[sessionId] = role;

    if (role === 'player') {
      // must be participant
      const isPlayer = await this.prisma.gameParticipant.findFirst({
        where: { sessionId, userId },
        select: { id: true },
      });
      if (!isPlayer) {
        client.emit('match.denied', { reason: 'NOT_A_PLAYER' });
        delete client.data.matchRoles[sessionId];
        return;
      }

      // limit to 2 players
      const rt = this.ensureRuntime(sessionId);
      if (rt.players.size >= 2 && !rt.players.has(userId)) {
        client.emit('match.denied', { reason: 'MATCH_FULL' });
        delete client.data.matchRoles[sessionId];
        return;
      }

      // register active player socket
      const playersMap = this.activePlayers.get(sessionId) ?? new Map<number, string>();
      playersMap.set(userId, client.id);
      this.activePlayers.set(sessionId, playersMap);

      // host selection (first player to join becomes host)
      if (!this.hostBySession.has(sessionId)) {
        this.hostBySession.set(sessionId, userId);
      }

      // reconnect => cancel timer
      this.cancelDisconnectTimer(sessionId, userId);

      // mark connected
      rt.players.add(userId);

      // if both players present => start (no game logic here, just signal)
      if (rt.players.size === 2 && !rt.started) {
        rt.started = true;

        // ✅ mark session LIVE (optional but recommended)
        await this.prisma.gameSession.update({
            where: { id: sessionId },
            data: { status: 'LIVE' },
        });

        // ✅ set both players IN_GAME
        await this.setPlayersInGame(sessionId);

        // ✅ notify clients
        this.server.to(this.matchRoom(sessionId)).emit('match.start', {
            sessionId,
            hostUserId: this.hostBySession.get(sessionId),
            ts: Date.now(),
        });
    }


      this.server.to(this.matchRoom(sessionId)).emit('player.reconnected', { userId });
    } else {
      // spectator: friends-only
      const ok = await this.permissions.canSpectate(userId, sessionId);
      if (!ok) {
        client.emit('match.denied', { reason: 'FRIENDS_ONLY' });
        delete client.data.matchRoles[sessionId];
        return;
      }
    }

    // join match room
    const room = this.matchRoom(sessionId);
    client.join(room);

    // ack to joiner
    client.emit('match.joined', { sessionId, role });

    // notice to everyone (including joiner)
    this.server.to(room).emit('match.notice', {
      type: role === 'spectator' ? 'SPECTATOR_JOINED' : 'PLAYER_JOINED',
      userId,
    });

    // send last snapshot to joiner (spectators / late join)
    const snapshot = this.lastState.get(sessionId);
    if (snapshot) {
      client.emit('state', snapshot);
    }
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('match.leave')
  matchLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { sessionId: string },
  ) {
    const userId = client.data.user.id as number;
    const sessionId = body.sessionId;
    const room = this.matchRoom(sessionId);

    const role = client.data.matchRoles?.[sessionId];

    client.leave(room);
    if (client.data.matchRoles?.[sessionId]) {
      delete client.data.matchRoles[sessionId];
    }

    // Optional behavior: if a player leaves intentionally -> forfeit
    if (role === 'player') {
      void this.endMatch(sessionId, { reason: 'PLAYER_LEFT', loserId: userId });
    }
  }

  // ---------- input relay ----------
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('input')
  input(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { sessionId: string; player: 1 | 2; dy: number },
  ) {
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

  // ---------- state relay (for teammate's game logic) ----------
  // Recommended: only host pushes state to avoid conflicts.
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('state.push')
  statePush(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { sessionId: string; state: any },
  ) {
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

  // If you ever need to broadcast from server-side services:
  broadcastState(sessionId: string, state: any) {
    this.lastState.set(sessionId, state);
    this.server.to(this.matchRoom(sessionId)).emit('state', state);
  }

    private async getPlayerIds(sessionId: string): Promise<number[]> {
        const rows = await this.prisma.gameParticipant.findMany({
            where: { sessionId, role: 'PLAYER' },
            select: { userId: true },
        });
        return rows.map(r => r.userId);
    }

    private async setPlayersInGame(sessionId: string) {
    const playerIds = await this.getPlayerIds(sessionId);

    if (playerIds.length === 0) return;

    await this.prisma.users.updateMany({
        where: { id: { in: playerIds } },
        data: { status: 'IN_GAME' },
    });
    }

    private async setPlayersOnline(sessionId: string) {
    const playerIds = await this.getPlayerIds(sessionId);

    if (playerIds.length === 0) return;

    await this.prisma.users.updateMany({
        where: { id: { in: playerIds } },
        data: { status: 'ONLINE' },
    });
    }


}
