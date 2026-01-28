import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DatabaseService } from 'src/database/database.service';
import { PermissionService } from '../permission/permission.service';
type JoinAs = 'player' | 'spectator';
export declare class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private prisma;
    private permissions;
    server: Server;
    private activePlayers;
    private disconnectTimers;
    private lastState;
    private hostBySession;
    private runtime;
    constructor(prisma: DatabaseService, permissions: PermissionService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private matchRoom;
    private ensureRuntime;
    private cancelDisconnectTimer;
    private endMatch;
    notifyInvite(toUserId: number, payload: any): void;
    notifyGameReady(userIds: number[], sessionId: string): void;
    notifyMatched(userIds: number[], sessionId: string): void;
    matchJoin(client: Socket, body: {
        sessionId: string;
        as: JoinAs;
    }): Promise<void>;
    matchLeave(client: Socket, body: {
        sessionId: string;
    }): void;
    input(client: Socket, body: {
        sessionId: string;
        player: 1 | 2;
        dy: number;
    }): void;
    statePush(client: Socket, body: {
        sessionId: string;
        state: any;
    }): void;
    broadcastState(sessionId: string, state: any): void;
    private getPlayerIds;
    private setPlayersInGame;
    private setPlayersOnline;
}
export {};
