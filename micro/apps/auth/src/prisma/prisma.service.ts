import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { VaultService } from '../vault/vault.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private realClient: PrismaClient;
  private logger = new Logger(PrismaService.name);

  constructor(private vaultService: VaultService) {
    super({
      datasources: {
        db: { url: "postgresql://dummy:dummy@localhost:5432/dummy" }
      }
    });

    return new Proxy(this, {
      get: (target, prop: string | symbol) => {
        if (target.realClient && prop in target.realClient) {
          return target.realClient[prop as keyof PrismaClient];
        }
        return target[prop as keyof PrismaService];
      },
    });
  }

  async onModuleInit() {
    const databaseUrl = await this.vaultService.getDatabaseCredentials();
    
    this.realClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    await this.realClient.$connect();
    this.logger.log('✅ HOT-SWAP: Prisma connected via Vault!');
  }

  async onModuleDestroy() {
    if (this.realClient) {
      await this.realClient.$disconnect();
    }
  }
}