import { Controller, Get, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { AppGateway } from './gateway.gateway';

@Controller()
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly appGateway: AppGateway,
  ) {}

  @Get()
  getHello(): string {
    return this.gatewayService.getHello();
  }

  @Post('notify-friend-request')
  async notifyFriendRequest(
    @Body() body: { fromUserId: number; toUserId: number; requestId: number; fromUsername: string },
    @Headers('x-internal-token') token?: string,
  ) {
    // Verify internal token
    if (!token || token !== process.env.INTERNAL_TOKEN) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    this.appGateway.notifyFriendRequest(body.fromUserId, body.toUserId, body.requestId, body.fromUsername);
    return { success: true };
  }

  @Post('notify-matched')
  async notifyMatched(
    @Body() body: { userIds: number[]; sessionId: string; players: any[] },
    @Headers('x-internal-token') token?: string,
  ) {
    // Verify internal token
    if (!token || token !== process.env.INTERNAL_TOKEN) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    this.appGateway.notifyMatched(body.userIds, body.sessionId, body.players);
    return { success: true };
  }
}
