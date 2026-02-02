import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FriendsDatabaseService } from './friends-database.service';
import { normalizePair } from './utils/friends.utils';
import { UsersClient } from './clients/user.client';


@Injectable()
export class FriendsService {
    constructor(private readonly prisma: FriendsDatabaseService, private readonly userClient: UsersClient){}

    private async checkUserExist(userId: number){
        await this.userClient.exists(userId);
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
            select: {
                userLowId: true,
                userHighId: true,
                updatedAt: true,
            },
            orderBy: { updatedAt: 'desc'},
        });
        const friendIds = rows.map((r) => (r.userLowId === meId? r.userHighId : r.userLowId));
        const friendsWithDetails = await this.userClient.batch(friendIds);
        return friendsWithDetails.sort((a, b) => {
            const aIdx = friendIds.indexOf(a.id);
            const bIdx = friendIds.indexOf(b.id);
            return aIdx - bIdx;
        });
    }

    async areFriends(userA: number, userB: number){
        if (userA === userB) return true;

        const low = Math.min(userA, userB);
        const high = Math.max(userA, userB);

        const fr = await this.prisma.friends.findUnique({
            where: { userLowId_userHighId: { userLowId: low, userHighId: high } },
            select: { status: true },
        });

        return fr?.status === 'ACCEPTED';
    }

    async anyAccepted(userId: number, otherIds: number[]): Promise<Boolean>{
        if (otherIds.length === 0) return false;

        const fr = await this.prisma.friends.findFirst({
            where: { status: 'ACCEPTED',
                OR: [
                    { userLowId: userId, userHighId: { in: otherIds }},
                    { userHighId: userId, userLowId: { in : otherIds}},
                ],
            },
            select: { id: true},
        });
        return !!fr; //if theres friends it return true else false
    }
}
