import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { FriendsDatabaseService } from './friends-database.service';
import { HttpModule } from '@nestjs/axios';
import { UsersClient } from './clients/user.client';

@Module({
  imports: [HttpModule],
  providers: [FriendsService, FriendsDatabaseService, UsersClient],
  controllers: [FriendsController]
})
export class FriendsModule {}
