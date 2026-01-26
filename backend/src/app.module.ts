import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { FriendsModule } from './friends/friends.module';
import { FriendsService } from './friends/friends.service';
import { GameModule } from './game/game.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, DatabaseModule, UsersModule, MailModule, FriendsModule, GameModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService, MailService, FriendsService],
})
export class AppModule {}
