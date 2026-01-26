import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { SocketAuthGuard } from './socket-auth.guard';

@WebSocketGateway({ namespace: '/game', cors: true })
export class GameGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  @UseGuards(SocketAuthGuard)
  handleConnection(client: Socket) {
    const userId = client.data.user.id;
    client.join(`user:${userId}`);
  }

  notifyInvite(toUserId: number, payload: any) {
    this.server.to(`user:${toUserId}`).emit('invite.received', payload);
  }

  notifyGameReady(userIds: number[], sessionId: string) {
    for (const id of userIds) {
      this.server.to(`user:${id}`).emit('game.ready', { sessionId });
    }
  }
}
