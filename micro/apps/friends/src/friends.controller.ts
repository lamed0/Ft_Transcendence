import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../libs/common/guards/jwt.guard';
import { FriendsService } from './friends.service';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
    constructor(private readonly friendsSevice: FriendsService){}

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
}
