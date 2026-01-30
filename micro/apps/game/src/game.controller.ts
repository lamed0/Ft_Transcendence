import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../libs/common/guards/jwt.guard';
import { GameService } from './game.service';
import { SubmitScoreResult } from './dto/result.dto';
import { InvitesService } from './invite/invite.service';
import { CreateInviteDto } from './dto/invite.dto';
import { MatchmakingService } from './matchmaking/matchmaking.service';

@UseGuards(JwtAuthGuard)
@Controller('game')
export class GameController {
    constructor(
        private readonly game: GameService,
        private readonly invite: InvitesService,
        private readonly mm: MatchmakingService,
    ){}

    // @Post('/session/co-op')
    // createGame(@Req() req: any, @Body() dto: CreateCoopDto){
    //     return this.game.createCoop(req.user.id, dto.opponentId);
    // }


    @Post('session/:id/result')
    SubmitRes(@Req() req: any, @Param('id') id: string, @Body() dto: SubmitScoreResult){
        return this.game.submitResult(id, req.user.id, dto);
    }

    @Get('history')
    getHistory(@Req() req: any){
        return this.game.history(req.user.id);
    }

    @Post('invites')
    createInvite(@Req() req, @Body() dto: CreateInviteDto){
        return this.invite.createInvite(req.user.id, dto.toUserId);
    }

    @Post('invites/:id/accept')
    acceptInvite(@Req() req: any, @Param('id') id: string){
        return this.invite.acceptInvite(id, req.user.id);
    }

    @Post('invites/:id/decline')
    declineInvite(@Req() req: any, @Param('id') id: string){
        return this.invite.declineInvite(id, req.user.id);
    }

    @Post('matchmaking/join')
    joinQueue(@Req() req: any){
        return this.mm.joinQueue(req.user.id);
    }

    @Post('matchmaking/leave')
    leaveQueue(@Req() req: any){
        return this.mm.leaveQueue(req.user.id);
    }

    @Get('friends/:friendId/active-session')
    getFriendMAtch(@Req() req: any, @Param('friendId') friendId: string){
        return this.game.getFriendActiveSession(req.user.id, Number(friendId));
    }
}
