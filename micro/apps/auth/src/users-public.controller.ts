import { Controller, Get, Post, Put, Delete, Patch, Body, Headers, UnauthorizedException, Req, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../../libs/common/guards/jwt.guard';

type ReqWithUser = Request & { user: { sub: number }};

@Controller('users')
export class UsersPublicController {
    constructor(
        private readonly usersService: UsersService,
        private readonly http: HttpService,
    ) {}

    private assertInternal(@Headers('x-internal-token') token?: string) {
        if (!process.env.INTERNAL_TOKEN || token !== process.env.INTERNAL_TOKEN) {
            throw new UnauthorizedException('Internal access only');
        }
    }

    private friendsServiceUrl() {
        return process.env.FRIENDS_SERVICE_URL ?? 'http://friends:3005';
    }

    private internalToken() {
        return process.env.INTERNAL_TOKEN ?? '';
    }

    private assertServiceAuth(@Headers('x-service-key') key?: string) {
        const validKeys = (process.env.SERVICE_KEYS ?? '').split(',').filter(Boolean);
        if (!validKeys.length || !key || !validKeys.includes(key)) {
            throw new UnauthorizedException('Service access only');
        }
    }

    @Get('friends')
    async listFriends(@Req() req: ReqWithUser) {
        try {
            const response = await firstValueFrom(
                this.http.get(
                    `${this.friendsServiceUrl()}/friends/internal/friends/list/${req.user.sub}`,
                    {
                        headers: {
                            'x-internal-token': this.internalToken(),
                        },
                    },
                ),
            );
            return response.data;
        } catch (error: any) {
            throw new UnauthorizedException('Failed to fetch friends list');
        }
    }

    @Post('public/search')
    async searchUsers(@Body() body: { query: string; limit?: number }) {
        const limit = Math.min(body.limit || 10, 50); // Max 50 results

        const users = await this.usersService.searchByUsername(body.query, limit);

        return {
            status: 'success',
            data: users.map((u) => ({
                id: u.id,
                username: u.username,
                level: u.level,
                avatarUrl: u.avatarUrl,
                status: u.status,
            })),
        };
    }

    @UseGuards(JwtAuthGuard)
    @Put('me')
    async updateUser(@Req() req: ReqWithUser, @Body() body: { username?: string }) {
        return this.usersService.updateMe(req.user.sub, body);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('me')
    async deleteUser(@Req() req: ReqWithUser) {
        return this.usersService.anonymizeUser(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile/me')
    async getCurrentUser(@Req() req: ReqWithUser) {
        return this.usersService.me(req.user.sub);
    }

    @Patch('internal/users/:userId/level')
    async updateUserLevel(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() body: { level: number },
        @Headers('x-internal-token') token?: string
    ) {
        this.assertInternal(token);
        return this.usersService.updateLevel(userId, body.level);
    }

    @Post('internal/batch-update-levels')
    async batchUpdateLevels(
        @Body() body: { updates: Array<{ userId: number; level: number }> },
        @Headers('x-internal-token') token?: string
    ) {
        this.assertInternal(token);
        const results = await Promise.all(
            body.updates.map(({ userId, level }) =>
                this.usersService.updateLevel(userId, level).catch(() => null)
            )
        );
        return { success: true, updated: results.filter(r => r !== null).length };
    }
}
