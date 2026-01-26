import { DatabaseService } from "src/database/database.service";
export declare class PermissionService {
    private readonly prisma;
    constructor(prisma: DatabaseService);
    areFriends(userA: number, userB: number): Promise<boolean>;
    canSpectate(userId: number, sessionId: string): Promise<boolean>;
}
