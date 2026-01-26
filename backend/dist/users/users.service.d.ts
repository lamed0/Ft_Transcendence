import { userStatus } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { UpdateDto } from './dto/update-profile.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: DatabaseService);
    me(userId: number): Promise<{
        username: string;
        id: number;
        avatarUrl: string | null;
        status: import(".prisma/client").$Enums.userStatus;
    }>;
    getById(id: number): Promise<{
        username: string;
        id: number;
        avatarUrl: string | null;
        status: import(".prisma/client").$Enums.userStatus;
    }>;
    updateMe(id: number, dto: UpdateDto): Promise<{
        username: string;
        id: number;
        avatarUrl: string | null;
        status: import(".prisma/client").$Enums.userStatus;
    }>;
    setStatus(userId: number, status: userStatus): Promise<{
        id: number;
        status: import(".prisma/client").$Enums.userStatus;
    }>;
    deleteUser(id: number): Promise<{
        message: string;
    }>;
}
