import { DatabaseService } from 'src/database/database.service';
import { PermissionService } from '../permission/permission.service';
import { GameGateway } from '../realtime/game.gateway';
export declare class InvitesService {
    private readonly prisma;
    private readonly permissions;
    private readonly gateway;
    constructor(prisma: DatabaseService, permissions: PermissionService, gateway: GameGateway);
    createInvite(fromUserId: number, toUserId: number): Promise<{
        inviteId: string;
    }>;
    acceptInvite(inviteId: string, userId: number): Promise<{
        sessionId: string;
        players: number[];
    }>;
    declineInvite(inviteId: string, userId: number): Promise<{
        status: string;
    }>;
}
