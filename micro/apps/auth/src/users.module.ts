import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../../../libs/database';
import { AuthDatabaseService } from './auth-database.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, AuthDatabaseService],
  exports: [UsersService],
})
export class UsersModule {}