import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersPublicController } from './users-public.controller';
import { UsersService } from './users.service';
import { PrismaModule } from './prisma/prisma.module';
import { ApiKeyService } from './api-key.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
  ],
  controllers: [UsersController, UsersPublicController],
  providers: [UsersService, ApiKeyService],
  exports: [UsersService, ApiKeyService],
})
export class UsersModule {}