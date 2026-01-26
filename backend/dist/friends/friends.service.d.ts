import { DatabaseService } from 'src/database/database.service';
export declare class FriendsService {
    private readonly prisma;
    constructor(prisma: DatabaseService);
    private checkUserExist;
    sendReq(meId: number, otherId: number): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.Friendships_status;
        createdAt: Date;
        updatedAt: Date;
        userLowId: number;
        userHighId: number;
        requestedBy: number;
    }>;
    acceptReq(meId: number, otherId: number): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.Friendships_status;
        createdAt: Date;
        updatedAt: Date;
        userLowId: number;
        userHighId: number;
        requestedBy: number;
    }>;
    deleteRelationship(meId: number, otherId: number): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.Friendships_status;
        createdAt: Date;
        updatedAt: Date;
        userLowId: number;
        userHighId: number;
        requestedBy: number;
    }>;
    listFriends(meId: number): Promise<{
        username: string;
        id: number;
        avatarUrl: string | null;
        status: import(".prisma/client").$Enums.userStatus;
    }[]>;
}
