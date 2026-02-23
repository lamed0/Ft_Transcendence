import { Controller, Get, Post, Put, Patch, Delete, Headers, Param, Body, UseGuards, HttpException, HttpStatus, Req } from '@nestjs/common';
import { RateLimit } from '../../auth/src/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../../libs/common/guards/rate-limit.guard';
import { ApiKeyGuard } from '../../../libs/common/guards/api-key.guard';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { AppGateway } from './gateway.gateway';

// Internal controller for internal service communication
// @Controller()
// export class InternalController {
//     constructor(private readonly appGateway: AppGateway) {}

//     private assertInternal(@Headers('x-internal-token') token?: string) {
//         if (!token || token !== process.env.INTERNAL_TOKEN) {
//             throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
//         }
//     }

//     @Post('gateway/notify-friend-request')
//     async notifyFriendRequest(@Body() body: { fromUserId: number; toUserId: number; requestId: number; fromUsername: string; }, @Headers('x-internal-token') token?: string) {
//         this.assertInternal(token);
//         this.appGateway.notifyFriendRequest(body.fromUserId, body.toUserId, body.requestId, body.fromUsername);
//         return { success: true };
//     }
// }

@Controller('public')
@UseGuards(ApiKeyGuard, RateLimitGuard)
export class PublicApiController {
    constructor(
        private readonly http: HttpService,
        private readonly jwtService: JwtService,
        private readonly appGateway: AppGateway,
    ) {}

    private authServiceUrl() {
        return process.env.AUTH_SERVICE_URL ?? 'http://auth:3001';
    }

    private friendsServiceUrl() {
        return process.env.FRIENDS_SERVICE_URL ?? 'http://friends:3003';
    }

    private gameServiceUrl() {
        return process.env.GAME_SERVICE_URL ?? 'http://game:3005';
    }

    private internalToken() {
        return process.env.INTERNAL_TOKEN ?? '';
    }

    private getUserFromCookie(req: any): number {
        try {
            const token = req.cookies?.accessToken;
            if (!token) {
                throw new HttpException('No access token found', HttpStatus.UNAUTHORIZED);
            }
            const decoded = this.jwtService.verify(token, {
                secret: process.env.JWT_ACCESS_SECRET ?? 'super-secret-access',
            });
            return decoded.sub;
        } catch (error) {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
    }

    @RateLimit({ max: 10, windowMs: 60 * 1000 }) // 10 requests per minute
    @Get('users/:id')
    async getUser(@Param('id') id: string) {
        try {
            const response = await firstValueFrom(
                this.http.get(
                    `${this.authServiceUrl()}/users/${id}`,
                    {
                        headers: {
                            'x-internal-token': this.internalToken(),
                        },
                    },
                ),
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException('Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // @RateLimit({ max: 10, windowMs: 60 * 1000 })
    @Post('users/search')
    async searchUsers(@Body() body: { query: string; limit?: number }) {
        try {
            const response = await firstValueFrom(
                this.http.post(
                    `${this.authServiceUrl()}/users/public/search`,
                    { query: body.query, limit: body.limit || 10 },
                    {
                        headers: {
                            'x-internal-token': this.internalToken(),
                        },
                    },
                ),
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException('Failed to search users', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RateLimit({ max: 5, windowMs: 60 * 1000 })
    @Put('users/:id')
    async updateUserProfile(@Param('id') id: string, @Body() body: { username?: string; password?: string; avatarUrl?: string }) {
        try {
            const response = await firstValueFrom(
                this.http.put(
                    `${this.authServiceUrl()}/users/${id}`,
                    body,
                    {
                        headers: {
                            'x-internal-token': this.internalToken(),
                        },
                    },
                ),
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException('Failed to update user profile', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RateLimit({ max: 5, windowMs: 60 * 1000 })
    @Delete('users/me')
    async deleteUser(@Req() req: any) {
        try {
            const userId = this.getUserFromCookie(req);
            
            const response = await firstValueFrom(
                this.http.delete(
                    `${this.authServiceUrl()}/users/${userId}`,
                    {
                        headers: {
                            'x-internal-token': this.internalToken(),
                        },
                    },
                ),
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RateLimit({ max: 10, windowMs: 60 * 1000 })
    @Get('users/profile/me')
    async getCurrentUser() {
        try {
            const response = await firstValueFrom(
                this.http.get(
                    `${this.authServiceUrl()}/users/me`,
                    {
                        headers: {
                            'x-internal-token': this.internalToken(),
                        },
                    },
                ),
            );
            return response.data;
        } catch (error: any) {
            throw new HttpException('Failed to fetch current user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RateLimit({ max: 5, windowMs: 60 * 1000 })
    @Post('friends/request/:userId')
    async sendFriendRequest(@Param('userId') userId: string, @Req() req: any) {
        try {
            const senderId = this.getUserFromCookie(req);
            
            const response = await firstValueFrom(
                this.http.post(
                    `${this.friendsServiceUrl()}/friends/request/${userId}/internal`,
                    { senderId },
                    {
                        headers: {
                            'x-internal-token': this.internalToken(),
                        },
                    },
                ),
            );
            return response.data;
        } catch (error: any) {
            // Pass through client errors (4xx) from friends service
            if (error.response?.status >= 400 && error.response?.status < 500) {
                throw new HttpException(
                    error.response.data?.message || 'Friend request error',
                    error.response.status,
                );
            }
            console.error('Friend request error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config?.url,
            });
            throw new HttpException('Failed to send friend request', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @RateLimit({ max: 5, windowMs: 60 * 1000 })
    @Post('game/results/submit')
    async submitGameResults(
    @Body() body: { results: { sessionId: string; userId: number; score: number; level: number }[] },
    @Headers('x-internal-token') token?: string
    ) {
    if (!process.env.INTERNAL_TOKEN || token !== process.env.INTERNAL_TOKEN) {
        throw new HttpException('Invalid internal token', HttpStatus.UNAUTHORIZED);
    }

    try {
        // Forward the results to the game service
        const response = await firstValueFrom(
        this.http.post(
            `${this.gameServiceUrl()}/game/results/submit`,
            body,
            {
            headers: {
                'x-internal-token': this.internalToken(),
                'Content-Type': 'application/json',
            },
            }
        )
        );
        return response.data;
    } catch (error: any) {
        console.error('Gateway error:', error.response?.data || error.message);
        const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        throw new HttpException(error.response?.data?.message || 'Failed to submit game results', status);
    }
    }

}
