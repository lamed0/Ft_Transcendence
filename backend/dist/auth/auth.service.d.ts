import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { RegisterDto } from './dto/register.dto';
import { GoogleDto } from './dto/google.dto';
import { FtDto } from './dto/ft.dto';
import { MailService } from 'src/mail/mail.service';
export declare class AuthService {
    private jwtService;
    private prisma;
    private mailService;
    constructor(jwtService: JwtService, prisma: DatabaseService, mailService: MailService);
    validateUser({ username, password }: AuthPayloadDto): Promise<{
        user: {
            username: string;
            id: number;
            email: string | null;
            avatarUrl: string | null;
            status: import(".prisma/client").$Enums.userStatus;
            createdAt: Date;
        };
        accessToken: string;
    } | null>;
    register(dto: RegisterDto): Promise<{
        message: string;
        userId: number;
    }>;
    refreshTokens(userId: number, refreshToken: string): Promise<{
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
    logout(userId: number): Promise<void>;
    private signToken;
    validateGoogleUser(googleUser: GoogleDto): Promise<{
        username: string;
        password: string | null;
        id: number;
        email: string | null;
        googleId: string | null;
        ftId: number | null;
        avatarUrl: string | null;
        refreshToken: string | null;
        status: import(".prisma/client").$Enums.userStatus;
        isGuest: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    googleLogin(googleUser: GoogleDto): Promise<{
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
    validateFtUser(ftUser: FtDto): Promise<{
        username: string;
        password: string | null;
        id: number;
        email: string | null;
        googleId: string | null;
        ftId: number | null;
        avatarUrl: string | null;
        refreshToken: string | null;
        status: import(".prisma/client").$Enums.userStatus;
        isGuest: boolean;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    ftLogin(ftUser: FtDto): Promise<{
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
    private getSafeUser;
    private signTokenWithUser;
    guestLogin(): Promise<{
        accesToken: string;
        user: {
            id: number;
            username: string;
            avatarUrl: string | null;
            status: import(".prisma/client").$Enums.userStatus;
            isGuest: boolean;
        };
    }>;
    verifyEmail(rawToken: string): Promise<{
        message: string;
    }>;
    resendVef(email: string): Promise<{
        message: string;
    }>;
}
