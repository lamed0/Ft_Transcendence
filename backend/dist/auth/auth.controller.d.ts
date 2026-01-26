import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
interface AuthenticatedRequest extends Request {
    user: any;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: AuthenticatedRequest): Promise<any>;
    guest(): Promise<{
        accesToken: string;
        user: {
            id: number;
            username: string;
            avatarUrl: string | null;
            status: import(".prisma/client").$Enums.userStatus;
            isGuest: boolean;
        };
    }>;
    status(req: AuthenticatedRequest): Promise<any>;
    register(dto: RegisterDto): Promise<{
        message: string;
        userId: number;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    resendVerification(dto: ResendVerificationDto): Promise<{
        message: string;
    }>;
    refresh(req: AuthenticatedRequest): Promise<{
        user: {
            username: string;
            id: number;
            email: string | null;
            avatarUrl: string | null;
            status: import(".prisma/client").$Enums.userStatus;
            createdAt: Date;
        };
        accessToken: string;
    }>;
    logout(req: AuthenticatedRequest): Promise<void>;
    googleLogin(): Promise<void>;
    googleCallback(req: AuthenticatedRequest, res: Response): Promise<void | Response<any, Record<string, any>>>;
    ftlogin(): Promise<void>;
    ftCallback(req: AuthenticatedRequest, res: Response): Promise<void | Response<any, Record<string, any>>>;
}
export {};
