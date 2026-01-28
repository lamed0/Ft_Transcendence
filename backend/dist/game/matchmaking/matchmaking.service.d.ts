import { GameGateway } from '../realtime/game.gateway';
import { DatabaseService } from 'src/database/database.service';
type JoinQueueResult = {
    status: 'SEARCHING';
} | {
    status: 'MATCHED';
    sessionId: string;
};
export declare class MatchmakingService {
    private prisma;
    private gateway;
    constructor(prisma: DatabaseService, gateway: GameGateway);
    joinQueue(userId: number): Promise<JoinQueueResult>;
    leaveQueue(userId: number): Promise<{
        status: "CANCELED";
    }>;
}
export {};
