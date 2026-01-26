import { FriendsService } from './friends.service';
export declare class FriendsController {
    private readonly friendsSevice;
    constructor(friendsSevice: FriendsService);
    send(req: any, userId: number): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.Friendships_status;
        createdAt: Date;
        updatedAt: Date;
        userLowId: number;
        userHighId: number;
        requestedBy: number;
    }>;
    accept(req: any, userId: number): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.Friendships_status;
        createdAt: Date;
        updatedAt: Date;
        userLowId: number;
        userHighId: number;
        requestedBy: number;
    }>;
    deleteRelation(req: any, userId: number): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.Friendships_status;
        createdAt: Date;
        updatedAt: Date;
        userLowId: number;
        userHighId: number;
        requestedBy: number;
    }>;
    list(req: any): Promise<{
        username: string;
        id: number;
        avatarUrl: string | null;
        status: import(".prisma/client").$Enums.userStatus;
    }[]>;
}
