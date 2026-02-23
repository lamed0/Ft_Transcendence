import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayClient {
  private gatewayUrl = 'http://gateway:3000';

  constructor(private readonly httpService: HttpService) {}

  async notifyMatched(userIds: number[], sessionId: string, players: any[]) {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.gatewayUrl}/notify-matched`, {
          userIds,
          sessionId,
          players,
        }, {
          headers: {
            'x-internal-token': process.env.INTERNAL_TOKEN || '',
          },
        })
      );
    } catch (error) {
      console.error('Failed to notify gateway about match:', error.message);
    }
  }
}
