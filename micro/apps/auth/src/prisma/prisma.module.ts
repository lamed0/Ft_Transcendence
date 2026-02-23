import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { VaultService } from '../vault/vault.service';
//heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeere

@Global()
@Module({
  providers: [PrismaService, VaultService],
  exports: [PrismaService, VaultService],
})
export class PrismaModule {}