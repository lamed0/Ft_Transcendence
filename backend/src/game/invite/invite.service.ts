import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PermissionService } from '../permission/permission.service';
import { GameGateway } from '../realtime/game.gateway';

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: DatabaseService, private readonly permissions: PermissionService,
            private readonly gateway: GameGateway){}

    async createInvite(fromUserId: number, toUserId: number) {
        if (fromUserId === toUserId)
            throw new BadRequestException('Cannot invite yourself');

        const areFriends = await this.permissions.areFriends(fromUserId, toUserId);
        if (!areFriends)
            throw new ForbiddenException('You are not friends');

        const existing = await this.prisma.gameInvite.findFirst({
            where: {
                fromUserId,
                toUserId,
                status: 'PENDING',
            },
        });
        if (existing) return { inviteId: existing.id };

        const invite = await this.prisma.gameInvite.create({
            data: { fromUserId, toUserId },
        });

        this.gateway.notifyInvite(toUserId, {
            inviteId: invite.id,
            fromUserId,
        });

        return { inviteId: invite.id };
    }

  async acceptInvite(inviteId: string, userId: number) {
    const invite = await this.prisma.gameInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.toUserId !== userId)
      throw new ForbiddenException('Not your invite');
    if (invite.status !== 'PENDING')
      throw new BadRequestException('Invite already handled');

    const session = await this.prisma.$transaction(async (tx) => {
      const game = await tx.gameSession.create({
        data: {
          mode: 'ONEVONE_INVITE',
          participants: {
            create: [
              { userId: invite.fromUserId },
              { userId: invite.toUserId },
            ],
          },
        },
      });

      await tx.gameInvite.update({
        where: { id: inviteId },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
          sessionId: game.id,
        },
      });

      return game;
    });
    this.gateway.notifyGameReady(
        [invite.fromUserId, invite.toUserId],
        session.id,
    );

    return {
      sessionId: session.id,
      players: [invite.fromUserId, invite.toUserId],
    };
  }

  async declineInvite(inviteId: string, userId: number) {
    const invite = await this.prisma.gameInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) throw new NotFoundException();
    if (invite.toUserId !== userId)
      throw new ForbiddenException();

    await this.prisma.gameInvite.update({
      where: { id: inviteId },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
      },
    });

    return { status: 'DECLINED' };
  }
}
