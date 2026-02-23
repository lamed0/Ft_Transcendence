import { Injectable, Logger } from '@nestjs/common';
import NodeVault from 'node-vault'; 
//heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeere

@Injectable()
export class VaultService {
  private vault;
  private logger = new Logger(VaultService.name);

  constructor() {
    this.vault = NodeVault({
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR || 'http://vault:8200',
      token: process.env.VAULT_TOKEN,
    });
  }

async getDatabaseCredentials() {
    try {
      this.logger.log(':closed_lock_with_key: Fetching DB credentials from Vault...');
      const result = await this.vault.read('secret/data/db');
      
      this.logger.debug('Vault response:', JSON.stringify(result, null, 2));
      
      const { user, password, database } = result.data.data;

      this.logger.debug(`Keys received - user: ${user}, password: ${password}, database: ${database}`);

      if (!user || !password || !database) {
        throw new Error(`Vault is missing required DB keys. Got: user=${user}, password=${password}, database=${database}`);
      }
      
      this.logger.log(':white_check_mark: Credentials retrieved successfully.');

      return `postgresql://${user}:${password}@postgres:5432/${database}?schema=auth`;
      
    } catch (error) {
      this.logger.error(`❌ Failed to connect to Vault: ${error.message}`);
      throw error;
    }
  }
}
