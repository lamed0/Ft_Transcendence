import { GameService } from './game.service';
import { SubmitScoreResult } from './dto/result.dto';
export declare class GameController {
    private readonly game;
    constructor(game: GameService);
    SubmitRes(req: any, id: string, dto: SubmitScoreResult): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.GameStatus;
        scoreA: number;
        scoreB: number;
    }>;
    getHistory(req: any): Promise<({
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
