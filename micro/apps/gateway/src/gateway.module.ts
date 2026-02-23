import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { PublicApiController } from './public-api.controller';
import { AppGateway } from './gateway.gateway';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from 'libs/common/src/redis/redis.module';

@Module({
  imports: [
    HttpModule,
    RedisModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET ?? 'super-secret-access',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [GatewayController, PublicApiController],
  providers: [GatewayService, AppGateway],
})
export class GatewayModule {}


