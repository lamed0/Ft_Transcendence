import { GameService } from './game.service';
import { SubmitScoreResult } from './dto/result.dto';
import { InvitesService } from './invite/invite.service';
import { CreateInviteDto } from './dto/invite.dto';
import { MatchmakingService } from './matchmaking/matchmaking.service';
export declare class GameController {
    private readonly game;
    private readonly invite;
    private readonly mm;
    constructor(game: GameService, invite: InvitesService, mm: MatchmakingService);
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
        scoreA: number;
        scoreB: number;
        mode: import(".prisma/client").$Enums.GameMode;
        hostUserId: number | null;
        offlineP1: string | null;
        offlineP2: string | null;
        startedAt: Date | null;
        endedAt: Date | null;
    })[]>;
    createInvite(req: any, dto: CreateInviteDto): Promise<{
        inviteId: string;
    }>;
    acceptInvite(req: any, id: string): Promise<{
        sessionId: string;
        players: number[];
    }>;
    declineInvite(req: any, id: string): Promise<{
        status: string;
    }>;
    joinQueue(req: any): Promise<{
        status: "SEARCHING";
    } | {
        status: "MATCHED";
        sessionId: string;
    }>;
    leaveQueue(req: any): Promise<{
        status: "CANCELED";
    }>;
    getFriendMAtch(req: any, friendId: string): Promise<{
        sessionId: string | null;
        status: import(".prisma/client").$Enums.GameStatus | null;
        mode: import(".prisma/client").$Enums.GameMode | null;
    }>;
}
