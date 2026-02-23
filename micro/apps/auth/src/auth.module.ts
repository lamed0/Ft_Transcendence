import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from './prisma/prisma.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from './config/google-oauth.config';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigService } from "@nestjs/config";
import jwtConfig from './config/jwt.config';
import ftOauthConfig from './config/ft-oauth.config';
import { FtStrategy } from './strategies/ft.strategy';
import { MailService } from '../../../apps/mail/src/mail.service';
import { MailModule } from '../../../apps/mail/src/mail.module';
import { UsersModule } from './users.module';
import { RedisModule } from 'libs/common/src/redis/redis.module';
import { TwoFactorAuthenticationService } from './twoFactor/twoFactor.service';
import { ApiKeyService } from './api-key.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/auth/.env',
    }),
    MailModule,
    PrismaModule,
    UsersModule,
    RedisModule,
    PassportModule,
    JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      signOptions: { expiresIn: '15m' },
    }),
  }),

    ConfigModule.forFeature(googleOauthConfig),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(ftOauthConfig),

  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    ApiKeyService,
    LocalStrategy, 
    JwtStrategy, 
    RefreshStrategy, 
    GoogleStrategy, 
    FtStrategy, 
    MailService,
    TwoFactorAuthenticationService,
  ]
})
export class AuthModule {}
