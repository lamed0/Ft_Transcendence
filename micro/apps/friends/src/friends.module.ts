import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { FriendsDatabaseService } from './friends-database.service';
import { FriendsGateway } from './friends.gateway';
import { HttpModule } from '@nestjs/axios';
import { UsersClient } from './clients/user.client';
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
  providers: [FriendsService, FriendsDatabaseService, UsersClient, GatewayClient, JwtStrategy, FriendsGateway],
  controllers: [FriendsController],
  exports: [FriendsService, FriendsGateway],
})
export class FriendsModule {}
