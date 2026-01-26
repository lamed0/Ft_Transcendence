import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { normalizePair } from './utils/friends.utils';

@Injectable()
export class FriendsService {
    constructor(private readonly prisma: DatabaseService){}

    private async checkUserExist(userId: number){
        const user = await this.prisma.users.findUnique({
            where: {id: userId},
        });
        if (!user) throw new NotFoundException('User not found.');
        return user;
    } 

    async sendReq(meId: number, otherId: number){
        if (meId === otherId) throw new BadRequestException('Cannot friend yourself');
        await this.checkUserExist(meId);
        await this.checkUserExist(otherId);

        const { low, high } = normalizePair(meId, otherId);
        const existing = await this.prisma.friends.findUnique({
            where: { userLowId_userHighId : { userLowId: low, userHighId: high }},
        });
        if (!existing){
            return this.prisma.friends.create({
                data: {
                    userLowId: low,
                    userHighId: high,
                    requestedBy: meId,
                    status: 'PENDING',
                },
            });
        }
        if (existing.status === 'ACCEPTED') throw new ConflictException('Already friends');
        if (existing.requestedBy === meId) throw new ConflictException('Request already sent');
        throw new ConflictException('You already have an incoming friend request from this user');
    }


    async acceptReq(meId: number, otherId: number){
        if (meId === otherId) throw new BadRequestException('Invalid user');
        await this.checkUserExist(meId);
        await this.checkUserExist(otherId);

        const { low, high } = normalizePair(meId, otherId);
        const fr = await this.prisma.friends.findUnique({
            where: { userLowId_userHighId: { userLowId: low, userHighId: high }},
        });

        if (!fr || fr.status !== 'PENDING') throw new NotFoundException('No pending request');
        if (fr.requestedBy === meId) throw new ForbiddenException('You cannot accept your own request');
        
        return this.prisma.friends.update({
            where: { id: fr.id },
            data: { status: 'ACCEPTED' },
        });
    }


    // async rejectReq(meId: number, otherId: number){
    //     if (meId === otherId) throw new BadRequestException('Invalid user');
    //     await this.checkUserExist(meId);
    //     await this.checkUserExist(otherId);

    //     const { low, high } = normalizePair(meId, otherId);
    //     const fr = await this.prisma.friends.findUnique({
    //         where: { userLowId_userHighId: { userLowId: low, userHighId: high }},
    //     });

    //     if (!fr || fr.status !== 'PENDING') throw new NotFoundException('No pending request');
    //     if (fr.requestedBy === meId) throw new ForbiddenException('You cannot reject your own outgoing request');
        
    //     return this.prisma.friends.delete({ where: {id: fr.id} });
    // }

    // async removeFriend(meId: number, otherId: number) {
    // if (meId === otherId) throw new BadRequestException('Invalid user');
    // await this.checkUserExist(meId);
    // await this.checkUserExist(otherId);

    // const { low, high } = normalizePair(meId, otherId);

    // const fr = await this.prisma.friends.findUnique({
    //     where: { userLowId_userHighId: { userLowId: low, userHighId: high } },
    // });

    // if (!fr || fr.status !== 'ACCEPTED') {
    //     throw new NotFoundException('Friendship not found');
    // }

    // return this.prisma.friends.delete({ where: { id: fr.id } });
    // }

    async deleteRelationship(meId: number, otherId: number) {
    if (meId === otherId) throw new BadRequestException('Invalid user');
    await this.checkUserExist(meId);
    await this.checkUserExist(otherId);

    const { low, high } = normalizePair(meId, otherId);

    const fr = await this.prisma.friends.findUnique({
        where: { userLowId_userHighId: { userLowId: low, userHighId: high } },
    });

    if (!fr) throw new NotFoundException('Relationship not found');

    if (fr.status === 'PENDING') {
        // allow both:
        // - receiver rejects
        // - sender cancels
        return this.prisma.friends.delete({ where: { id: fr.id } });
    }

    if (fr.status === 'ACCEPTED') {
        return this.prisma.friends.delete({ where: { id: fr.id } });
    }

    throw new NotFoundException('Relationship not found');
    }




    async listFriends(meId: number){
        const rows = await this.prisma.friends.findMany({
            where: { 
                status: 'ACCEPTED',
                OR: [{userLowId: meId}, {userHighId: meId}],
            },
            include: {
                userLow: { select: {id: true, username: true, avatarUrl: true, status: true}},
                userHigh: { select: {id: true, username: true, avatarUrl: true, status: true}},
            },
            orderBy: { updatedAt: 'desc'},
        });
        return rows.map((r) => (r.userLowId === meId? r.userHigh : r.userLow));
    }
}
