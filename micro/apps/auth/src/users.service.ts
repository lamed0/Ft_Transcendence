import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { userStatus } from '@prisma/client';
import { AuthDatabaseService } from './auth-database.service';
import { UpdateDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: AuthDatabaseService){}

    async me(userId: number){
         const user = await this.prisma.users.findUnique({
            where: {id: userId},
            select: { id: true, username: true, avatarUrl: true, status: true, level: true },
         });
         if (!user) throw new NotFoundException("User not found");
        return user;
    }

    async getById(id: number){
        const user = await this.prisma.users.findUnique({
            where: { id },
            select: { id: true, username: true, avatarUrl: true, status: true, level: true },
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
        try {
            return await this.prisma.users.update({
                where: { id },
                data: {
                    ...(dto.username ? { username: dto.username } : {}),
                },
                select: { id: true , username: true, status: true, avatarUrl: true, level: true },
            });
        }catch(e: any){
            if(e?.code == "P2025") throw new NotFoundException("User Not Found");
            throw e;
        }
    }

    // async setStatus(userId: number, status: userStatus){
    //     return this.prisma.users.update({
    //         where: { id: userId },
    //         data: { status },
    //         select: { id: true, status: true },
    //     });
    // }

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

}