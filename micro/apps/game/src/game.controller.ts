import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../libs/common/guards/jwt.guard';
import { ApiKeyGuard } from '../../../libs/common/guards/api-key.guard';
import { GameService } from './game.service';
import { SubmitScoreResult } from './dto/result.dto';
import { InvitesService } from './invite/invite.service';
import { CreateInviteDto } from './dto/invite.dto';
import { MatchmakingService } from './matchmaking/matchmaking.service';

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
    @UseGuards(JwtAuthGuard)
    @Get('session/:sessionId/players')
    getSessionPlayers(@Req() req: any, @Param('sessionId') sessionId: string) {
        return this.game.getSessionPlayers(sessionId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('session/:id/result')
    SubmitRes(@Req() req: any, @Param('id') id: string, @Body() dto: SubmitScoreResult){
        return this.game.submitResult(id, req.user.sub, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('history')
    getHistory(@Req() req: any){
        return this.game.history(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Post('invites')
    createInvite(@Req() req, @Body() dto: CreateInviteDto){
        return this.invite.createInvite(req.user.sub, dto.toUserId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('invites/:id/accept')
    acceptInvite(@Req() req: any, @Param('id') id: string){
        return this.invite.acceptInvite(id, req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Post('invites/:id/decline')
    declineInvite(@Req() req: any, @Param('id') id: string){
        return this.invite.declineInvite(id, req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Post('matchmaking/join')
    joinQueue(@Req() req: any){
        return this.mm.joinQueue(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Post('matchmaking/leave')
    leaveQueue(@Req() req: any){
        return this.mm.leaveQueue(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Get('friends/:friendId/active-session')
    getFriendMAtch(@Req() req: any, @Param('friendId') friendId: string){
        return this.game.getFriendActiveSession(req.user.sub, Number(friendId));
    }

    private assertInternal(@Headers('x-internal-token') token?: string) {
        console.log('Received internal token:', token);
        if (!process.env.INTERNAL_TOKEN || token !== process.env.INTERNAL_TOKEN) {
            throw new UnauthorizedException('Internal access only');
        }
    }

    // @UseGuards(ApiKeyGuard)
    // @Post('scores/update')
    // async updateScore(
    //     @Body() body: { updates?: { sessionId: string; userId: number; score: number }[] } | { sessionId: string; userId: number; score: number },
    //     @Headers('x-internal-token') token?: string
    // ) {
    //     console.log('Game controller received body:', JSON.stringify(body, null, 2));
    //     this.assertInternal(token);
        
    //     // Handle both formats: full updates array or individual update
    //     if ('updates' in body && Array.isArray(body.updates)) {
    //         // Multiple updates
    //         const results = await Promise.all(
    //             body.updates.map(update => 
    //                 this.game.updateSessionScore(update.sessionId, update.userId, update.score)
    //             )
    //         );
    //         return results;
    //     } else {
    //         // Single update
    //         const { sessionId, userId, score } = body as { sessionId: string; userId: number; score: number };
    //         return this.game.updateSessionScore(sessionId, userId, score);
    //     }
    // }


    // @UseGuards(ApiKeyGuard)
    // @Post('levels/update')
    // async updatePlayerLevels(
    //     @Body() body: { playerLevels: { userId: number; level: number }[] },
    //     @Headers('x-internal-token') token?: string
    // ) {
    //     this.assertInternal(token);
    //     return this.game.updatePlayerLevels(body.playerLevels);
    // }

    @UseGuards(ApiKeyGuard)
    @Post('results/submit')
    async publicSubmitResults(
    @Body() body: { results: { sessionId: string; userId: number; score: number; level: number }[] },
    @Headers('x-internal-token') token?: string
    ) {
    this.assertInternal(token);
    // Submit results and levels for both players
    const promises = body.results.map(async result => {
        // Fetch session participants
        const session = await this.game.getSessionPlayers(result.sessionId);
        // Sort participants by joinedAt to ensure correct A/B mapping
        const sortedParticipants = [...session.participants].sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
        const playerIndex = sortedParticipants.findIndex(p => p.userId === result.userId && p.role === 'PLAYER');
        let dto: any = { level: result.level };
        if (playerIndex === 0) {
            dto.scoreA = result.score;
        } else if (playerIndex === 1) {
            dto.scoreB = result.score;
        } else {
            throw new Error('User is not a player in this session');
        }
        return this.game.submitResult(result.sessionId, result.userId, dto);
    });
    return Promise.all(promises);
    }
}
