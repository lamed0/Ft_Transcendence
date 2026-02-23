import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../libs/common/guards/jwt.guard';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
    constructor(private readonly friendsSevice: FriendsService){}

    private assertInternal(@Headers('x-internal-token') token?: string) {
        if (!process.env.INTERNAL_TOKEN || token !== process.env.INTERNAL_TOKEN) {
          throw new UnauthorizedException('Internal access only');
        }
    }
    
    @Post('request/:userId')
    @UseGuards(JwtAuthGuard)
    async send(@Req() req: any, @Param('userId', ParseIntPipe) userId: number){
        return this.friendsSevice.sendReq(req.user.sub, userId);
    }

    @Post('request/:userId/internal')
    async sendInternal(@Param('userId', ParseIntPipe) userId: number, @Body() body: { senderId: number }, @Headers('x-internal-token') token?: string){
        this.assertInternal(token);
        return this.friendsSevice.sendReq(body.senderId, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('request/:userId/accept')
    async accept(@Req() req: any, @Param('userId', ParseIntPipe) userId: number){
        return this.friendsSevice.acceptReq(req.user.sub, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('request/:userId/decline')
    async decline(@Req() req: any, @Param('userId', ParseIntPipe) userId: number){
        return this.friendsSevice.deleteRelationship(req.user.sub, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('request/:userId')
    deleteRelation(@Req() req: any, @Param('userId', ParseIntPipe) userId: number){
        return this.friendsSevice.deleteRelationship(req.user.sub, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    list(@Req() req: any) {
        return this.friendsSevice.listFriends(req.user.sub);
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
