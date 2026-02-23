import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PermissionService } from './permission/permission.service';
import { GameDatabaseService } from './game-database.service';
import { InvitesService } from './invite/invite.service';
import { GameGateway } from './realtime/game.gateway';
import { JwtService } from '@nestjs/jwt';
import { MatchmakingService } from './matchmaking/matchmaking.service';
import { HttpModule } from '@nestjs/axios';
import { FriendsClient } from './clients/friends.client';
import { UsersClient } from './clients/users.client';
import { GatewayClient } from './clients/gateway.client';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [GameController],
  providers: [GameService, PermissionService, GameDatabaseService, InvitesService,
              GameGateway, JwtService, MatchmakingService, FriendsClient, UsersClient, GatewayClient, JwtStrategy]
})
export class GameModule {}
