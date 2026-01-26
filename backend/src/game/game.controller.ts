import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GameService } from './game.service';
import { SubmitScoreResult } from './dto/result.dto';
import { InvitesService } from './invite/invite.service';
import { CreateInviteDto } from './dto/invite.dto';

@UseGuards(JwtAuthGuard)
@Controller('game')
export class GameController {
    constructor(private readonly game: GameService,private readonly invite: InvitesService){}

    // @Post('/session/co-op')
    // createGame(@Req() req: any, @Body() dto: CreateCoopDto){
    //     return this.game.createCoop(req.user.id, dto.opponentId);
    // }


    @Post('/session/:id/result')
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
}

