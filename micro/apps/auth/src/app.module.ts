import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module'; 
//heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeere

@Module({
  imports: [
    PrismaModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}