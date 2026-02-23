import { Controller, Post, Headers, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AppGateway } from './gateway.gateway';

@Controller('gateway')
export class InternalGatewayController {
    constructor(private readonly appGateway: AppGateway) {}

    @Post('notify-friend-request')
    async notifyFriendRequest(
        @Body() body: { fromUserId: number; toUserId: number; requestId: number; fromUsername: string },
        @Headers('x-internal-token') token?: string
    ) {
        // Verify internal token
        if (!token || token !== process.env.INTERNAL_TOKEN) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        this.appGateway.notifyFriendRequest(body.fromUserId, body.toUserId, body.requestId, body.fromUsername);
        return { success: true };
    }
}
