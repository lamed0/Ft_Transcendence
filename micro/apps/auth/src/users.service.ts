import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { userStatus } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
import { UpdateDto } from './dto/update-profile.dto';
//heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeere

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService){}

    async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
        return this.prisma.users.update({
            where: { id: userId },
            data: { twoFactorAuthenticationSecret: secret },
        });
    }

    async turnOnTwoFactorAuthentication(userId: number) {
        return this.prisma.users.update({
            where: { id: userId },
            data: { isTwoFactorAuthenticationEnabled: true },
        });
    }

    async me(userId: number){
         const user = await this.prisma.users.findUnique({
            where: {id: userId},
            select: { id: true, username: true, avatarUrl: true, status: true, level: true, isTwoFactorAuthenticationEnabled: true, isGuest: true },
         });
         if (!user) throw new NotFoundException("User not found");
        return user;
    }

    async getAvatar(userId: number){
        // send image in body 
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            select: { avatarUrl: true },
        });
        if (!user) throw new NotFoundException("User not found");
        return user.avatarUrl;
    }
    
    async findOneById(id: number) {
        const user = await this.prisma.users.findUnique({
            where: { id },
            select: { id: true, username: true, email: true, twoFactorAuthenticationSecret: true, isTwoFactorAuthenticationEnabled: true }
        });
        if (!user) throw new NotFoundException("User not found");
        return user;
    }

    async findByEmailOrUsername(email?: string, username?: string) {
    return this.prisma.users.findFirst({
        where: {
        OR: [
            ...(email ? [{ email }] : []),
            ...(username ? [{ username }] : []),
        ],
        },
        select: { id: true, email: true, username: true },
    });
    }

    async turnOffTwoFactorAuthentication(userId: number) {
        return this.prisma.users.update({
            where: { id: userId },
            data: { 
                isTwoFactorAuthenticationEnabled: false,
                twoFactorAuthenticationSecret: null,
             },
        });
    }

    async getById(id: number){
        const user = await this.prisma.users.findUnique({
            where: { id },
            select: { id: true, username: true, avatarUrl: true, status: true, level: true, isTwoFactorAuthenticationEnabled: true, isGuest: true },
        });
        if(!user) throw new NotFoundException("User not Found");
        return user;
    }

    async updateMe(id: number, dto: UpdateDto){
        if(dto.username){
            const existing = await this.prisma.users.findUnique({
                where: {username: dto.username},
                select: { id: true },
            });
            if (existing && existing.id !== id) throw new ConflictException("Username already taken");
        }

        if(dto.email){
            const existing = await this.prisma.users.findUnique({
                where: {email: dto.email},
                select: { id: true },
            });
            if (existing && existing.id !== id) throw new ConflictException("Email already in use");
        }

        try {
            return await this.prisma.users.update({
                where: { id },
                data: {
                    ...(dto.username !== undefined ? { username: dto.username } : {}),
                    ...(dto.email !== undefined ? { email: dto.email } : {}),
                    ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
                },
                select: { id: true , username: true, email: true, status: true, avatarUrl: true, level: true },
            });
        }catch(e: any){
            if(e?.code == "P2025") throw new NotFoundException("User Not Found");
            throw e;
        }
    }

    async deleteUser(id: number){
        try {
            await this.prisma.users.delete({
                where: { id }
            });
            return { message: "Account Deleted"};
        }catch (e: any){
            if (e?.code === 'P2025') throw new NotFoundException("User Not Found");
            throw e; 
        }
    }

    async getUsersPublicBatch(ids: number[]){
        return this.prisma.users.findMany({
            where: { id: { in: ids } },
            select: { id: true, avatarUrl: true, username: true, status: true, level: true },
        });
    }

    async setStatusBatch(ids: number[], status: 'ONLINE'|'OFFLINE'|'IN_GAME') {
        await this.prisma.users.updateMany({
            where: { id: { in: ids } },
            data: { status },
        });
        return { updated: ids.length };
    }

    async updateLevel(id: number, level: number) {
        try {
            return await this.prisma.users.update({
                where: { id },
                data: { level },
                select: { id: true, username: true, level: true },
            });
        } catch (e: any) {
            if (e?.code === 'P2025') throw new NotFoundException('User not found');
            throw e;
        }
    }

    // ba9i makmltha gdpr bach nbdal info diyal specific user msah account diyalo l user mam3rofch 

    async anonymizeUser(id: number) {
        try {
            const user = await this.prisma.users.findUnique({
                where: { id },
                select: { id: true }
            });
            
            if (!user) throw new NotFoundException("User Not Found");

            await this.prisma.users.update({
                where: { id },
                data: {
                    username: `GhostUser_${id}`, //bash n5li history diyal game for id hidden name
                    email: null,                 // delete
                    password: null,              
                    googleId: null,              // ba9aaaaaaaaaaaaaaaaaaa mkamlaaaaaaaaaaaaat google
                    ftId: null,                  // ba9aaaaaaaaaaaaaaaaaaa mkamlaaaaaaaaaaaaat 42
                    avatarUrl: null,             
                    refreshToken: null,          
                    isEmailVerified: false,
                    isGuest: true,               // 4aywli guest
                    status: 'OFFLINE',
                }
            });

            return { message: "User anonymized successfully. Data scrubbed." };

        } catch (e: any) {
            if (e.code === 'P2002') { 
                throw new ConflictException("Anonymization failed: GhostUser ID conflict.");
            }
            throw e;
        }
    }

    /**
     * Get user by username (for public API)
     */
    async getByUsername(username: string) {
        return this.prisma.users.findUnique({
            where: { username },
            select: { id: true, username: true, level: true, avatarUrl: true, status: true },
        });
    }

    /**
     * Search users by username (for public API)
     */
    async searchByUsername(query: string, limit: number = 10) {
        return this.prisma.users.findMany({
            where: {
                username: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            select: { id: true, username: true, level: true, avatarUrl: true, status: true },
            take: limit,
        });
    }


    async exportData(userId: number){
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            select: { username: true, email: true, avatarUrl: true, level: true },
        });
        if (!user) throw new NotFoundException("User not found");

        const response: any = { ...user };

        // if (user.avatarUrl) {
        //     try {
        //         const imageBuffer = await this.prisma.$queryRaw`SELECT avatar FROM users WHERE id = ${userId}`;
        //         if (Array.isArray(imageBuffer) && imageBuffer.length > 0) {
        //             response.avatarBase64 = imageBuffer[0].avatar.toString('base64');
        //             response.avatarMimeType = 'image/jpeg';
        //         } else {
        //             response.avatarBase64 = null;
        //         }
        //     } catch (e) {
        //         console.error('Error reading avatar file:', e);
        //         response.avatarBase64 = null;
        //     }   
        // }
        return response;
    }
}

