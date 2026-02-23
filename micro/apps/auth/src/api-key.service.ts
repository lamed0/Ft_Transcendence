import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiKeyService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Generate a new API key
     */
    async generateApiKey(name: string, rateLimit: number = 1000): Promise<{ key: string; id: number }> {
        const key = `sk_live_${randomBytes(32).toString('hex')}`;
        
        const apiKey = await this.prisma.apiKey.create({
            data: {
                key,
                name,
                rateLimit,
            },
        });

        return { key, id: apiKey.id };
    }

    /**
     * Validate an API key
     */
    async validateApiKey(key: string): Promise<{ id: number; name: string; rateLimit: number; userId?: number }> {
        const apiKey = await this.prisma.apiKey.findUnique({
            where: { key },
            select: { id: true, name: true, rateLimit: true, isRevoked: true, userId: true },
        });

        if (!apiKey) {
            throw new UnauthorizedException('Invalid API key');
        }

        if (apiKey.isRevoked) {
            throw new UnauthorizedException('API key has been revoked');
        }

        return { id: apiKey.id, name: apiKey.name, rateLimit: apiKey.rateLimit, userId: apiKey.userId || undefined };
    }

    /**
     * Revoke an API key
     */
    async revokeApiKey(key: string): Promise<void> {
        await this.prisma.apiKey.update({
            where: { key },
            data: { isRevoked: true },
        });
    }

    /**
     * Get API key by ID
     */
    async getApiKey(id: number) {
        return this.prisma.apiKey.findUnique({
            where: { id },
            select: { id: true, key: true, name: true, rateLimit: true, isRevoked: true, createdAt: true },
        });
    }

    /**
     * List all API keys (admin only)
     */
    async listApiKeys(limit: number = 50, offset: number = 0) {
        return this.prisma.apiKey.findMany({
            select: { id: true, name: true, rateLimit: true, isRevoked: true, createdAt: true },
            take: limit,
            skip: offset,
        });
    }

    /**
     * Update rate limit for an API key
     */
    async updateRateLimit(keyId: number, rateLimit: number) {
        return this.prisma.apiKey.update({
            where: { id: keyId },
            data: { rateLimit },
        });
    }

    /**
     * Get or create API key by name for a specific user
     */
    async getOrCreateApiKey(userId: number, name: string): Promise<{ key: string; id: number }> {
        // Check if API key with this name already exists for this user
        const existingKey = await this.prisma.apiKey.findFirst({
            where: { name, userId },
            select: { id: true, key: true },
        });

        if (existingKey) {
            return { key: existingKey.key, id: existingKey.id };
        }

        // Create new API key
        const key = `sk_live_${randomBytes(32).toString('hex')}`;
        
        const apiKey = await this.prisma.apiKey.create({
            data: {
                key,
                name,
                userId,
                rateLimit: 1000,
            },
        });

        return { key, id: apiKey.id };
    }
}
