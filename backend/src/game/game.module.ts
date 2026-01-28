import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PermissionService } from './permission/permission.service';
import { DatabaseService } from 'src/database/database.service';
import { InvitesService } from './invite/invite.service';
import { GameGateway } from './realtime/game.gateway';
import { JwtService } from '@nestjs/jwt';
import { MatchmakingService } from './matchmaking/matchmaking.service';

@Module({
  controllers: [GameController],
  providers: [GameService, PermissionService, DatabaseService, InvitesService, GameGateway, JwtService, MatchmakingService]
})
export class GameModule {}
