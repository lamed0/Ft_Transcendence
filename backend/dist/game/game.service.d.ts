import { DatabaseService } from 'src/database/database.service';
import { SubmitScoreResult } from './dto/result.dto';
export declare class GameService {
    private readonly prisma;
    constructor(prisma: DatabaseService);
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
        mode: import(".prisma/client").$Enums.GameMode;
        hostUserId: number | null;
        offlineP1: string | null;
        offlineP2: string | null;
        startedAt: Date | null;
        endedAt: Date | null;
        scoreA: number;
        scoreB: number;
    })[]>;
}
