import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { FriendsService } from './friends.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: [
      'https://localhost',
      'http://localhost',
      'http://localhost:5173',
      'https://localhost:5173',
      process.env.FRONTEND_URL ?? 'https://localhost',
    ],
    credentials: true,
    methods: ['GET', 'POST'],
  }
})
export class FriendsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(@Inject(forwardRef(() => FriendsService)) private readonly friendsService: FriendsService) {}

  private userSockets = new Map<number, string>(); // userId -> socketId

  async handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(Number(userId), socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
      
      // Send pending friend requests when user connects
      try {
        const pendingRequests = await this.friendsService.getPendingRequests(Number(userId));
        pendingRequests.forEach(req => {
          const fromUserId = req.requestedBy;
          socket.emit('friendRequest', {
            fromUserId,
            fromUsername: req.requesterUsername,
            requestId: req.id,
            message: `${req.requesterUsername} sent you a friend request`,
          });
        });
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    }
  }

  handleDisconnect(socket: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === socket.id) {
        this.userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  // Emit friend request to receiver
  notifyFriendRequest(fromUserId: number, toUserId: number, requestId: number, fromUsername: string) {
    const receiverSocketId = this.userSockets.get(toUserId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('friendRequest', {
        fromUserId,
        fromUsername,
        requestId,
        message: `${fromUsername} sent you a friend request`,
      });
    }
  }
}
