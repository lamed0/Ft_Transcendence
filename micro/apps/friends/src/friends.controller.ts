import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../libs/common/guards/jwt.guard';
import { FriendsService } from './friends.service';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
    constructor(private readonly friendsSevice: FriendsService){}

    private assertInternal(@Headers('x-internal-token') token?: string) {
        if (!process.env.INTERNAL_TOKEN || token !== process.env.INTERNAL_TOKEN) {
          throw new UnauthorizedException('Internal access only');
        }
    }
    @Post('request/:userId')
    async send(@Req() req: any, @Param('userId', ParseIntPipe) userId: number){
        return this.friendsSevice.sendReq(req.user.id, userId);
    }

    @Post('request/:userId/accept')
    async accept(@Req() req: any, @Param('userId', ParseIntPipe) userId: number){
        return this.friendsSevice.acceptReq(req.user.id, userId);
    }

    @Delete('request/:userId')
    deleteRelation(@Req() req: any, @Param('userId', ParseIntPipe) userId: number){
        return this.friendsSevice.deleteRelationship(req.user.id, userId);
    }

    @Get()
    list(@Req() req: any) {
        return this.friendsSevice.listFriends(req.user.id);
    }

    @Get('internal/friends/are-friends')
    async areFriends(@Query('userA') userA: string, @Query('userB') userB: string, @Headers('x-internal-token') token?: string){
        this.assertInternal(token);
        const accepted = await this.friendsSevice.areFriends(Number(userA), Number(userB));
        return { accepted };
    }

    @Post('internal/friends/any-accepted')
    async anyAccepted(@Body() body: { userId: number, otherId: number[] }, @Headers('x-internal-token') token?: string){
        this.assertInternal(token);
        const accepted = await this.friendsSevice.anyAccepted(body.userId, body.otherId);
        return { accepted };
    }
}
