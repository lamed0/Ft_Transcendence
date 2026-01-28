import { DatabaseService } from 'src/database/database.service';
import { SubmitScoreResult } from './dto/result.dto';
import { PermissionService } from './permission/permission.service';
export declare class GameService {
    private readonly prisma;
    private readonly permissions;
    constructor(prisma: DatabaseService, permissions: PermissionService);
    submitResult(sessionId: string, userId: number, dto: SubmitScoreResult): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.GameStatus;
        scoreA: number;
        scoreB: number;
    }>;
    history(userId: number): Promise<({
        participants: {
            userId: number;
            role: import(".prisma/client").$Enums.ParticipantRole;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.GameStatus;
        createdAt: Date;
        scoreA: number;
        scoreB: number;
        mode: import(".prisma/client").$Enums.GameMode;
        hostUserId: number | null;
        offlineP1: string | null;
        offlineP2: string | null;
        startedAt: Date | null;
        endedAt: Date | null;
    })[]>;
    getFriendActiveSession(myId: number, friendId: number): Promise<{
        sessionId: string | null;
        status: import(".prisma/client").$Enums.GameStatus | null;
        mode: import(".prisma/client").$Enums.GameMode | null;
    }>;
}
