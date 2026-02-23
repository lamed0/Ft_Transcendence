import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'https://localhost',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<number, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(Number(userId), client.id);
      console.log(`User ${userId} connected with socket ${client.id}`);
    } else {
      console.log(`Client connected: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        return;
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('mm.join')
  handleMatchmakingJoin(client: Socket, data: any) {
    console.log(`Matchmaking join from ${client.id}:`, data);
    return { event: 'response', data: 'Joined matchmaking' };
  }

  @SubscribeMessage('friendRequest')
  handleFriendRequest(client: Socket, data: any) {
    console.log(`Friend request from ${client.id}:`, data);
    return { event: 'response', data: 'Friend request received' };
  }

  // Method to notify a user about a friend request
  notifyFriendRequest(fromUserId: number, toUserId: number, requestId: number, fromUsername: string) {
    const receiverSocketId = this.userSockets.get(toUserId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('friendRequest', {
        fromUserId,
        fromUsername,
        requestId,
        message: `${fromUsername} sent you a friend request`,
      });
      console.log(`Notified user ${toUserId} about friend request from ${fromUsername}`);
    } else {
      console.log(`User ${toUserId} not connected, skipping notification`);
    }
  }

  // Method to notify users about a match
  notifyMatched(userIds: number[], sessionId: string, players: any[]) {
    for (const userId of userIds) {
      const socketId = this.userSockets.get(userId);
      if (socketId) {
        const opponent = players.find(p => p.id !== userId);
        this.server.to(socketId).emit('mm.matched', {
          sessionId,
          opponentId: opponent?.id ?? null,
          opponent: opponent ?? { id: 0, username: 'Unknown', avatarUrl: null },
          players,
        });
        console.log(`Notified user ${userId} about match`);
      } else {
        console.log(`User ${userId} not connected, skipping match notification`);
      }
    }
  }
}

