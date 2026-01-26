import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [FriendsService, DatabaseService],
  controllers: [FriendsController]
})
export class FriendsModule {}
