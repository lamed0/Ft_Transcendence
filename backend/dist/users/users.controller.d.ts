import { UsersService } from './users.service';
import { UpdateDto } from './dto/update-profile.dto';
type ReqWithUser = Request & {
    user: {
        id: number;
    };
};
export declare class UsersController {
    private readonly userService;
    constructor(userService: UsersService);
    getMe(req: ReqWithUser): Promise<{
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
    updateMe(req: ReqWithUser, dto: UpdateDto): Promise<{
        username: string;
        id: number;
        avatarUrl: string | null;
        status: import(".prisma/client").$Enums.userStatus;
    }>;
    deleteME(req: ReqWithUser): Promise<{
        message: string;
    }>;
}
export {};
