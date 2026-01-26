import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PermissionService } from './permission/permission.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [GameController],
  providers: [GameService, PermissionService, DatabaseService]
})
export class GameModule {}
