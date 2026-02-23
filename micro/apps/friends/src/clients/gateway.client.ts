import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayClient {
  private gatewayUrl = process.env.GATEWAY_URL || 'http://gateway:3000';

  constructor(private readonly httpService: HttpService) {}

  async notifyFriendRequest(fromUserId: number, toUserId: number, requestId: number, fromUsername: string) {
    try {
      // Use internal HTTP to gateway service on docker network
      const url = `${this.gatewayUrl}/gateway/notify-friend-request`;
      console.log(`Notifying gateway at ${url} about friend request from ${fromUsername} to user ${toUserId}`);
      console.log(`Using INTERNAL_TOKEN: ${process.env.INTERNAL_TOKEN ? 'SET' : 'NOT SET'}`);
      const response = await firstValueFrom(
        this.httpService.post(url, {
          fromUserId,
          toUserId,
          requestId,
          fromUsername,
        }, {
          headers: {
            'x-internal-token': process.env.INTERNAL_TOKEN || '',
          },
        })
      );
      console.log(`Gateway notification successful:`, response.data);
    } catch (error: any) {
      console.error('Failed to notify gateway about friend request:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      // Don't throw - the local friends gateway notification should still work
    }
  }
}
