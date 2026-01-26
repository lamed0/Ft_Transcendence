import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt'; 
import { RegisterDto } from './dto/register.dto';
import { GoogleDto } from './dto/google.dto';
import { FtDto } from './dto/ft.dto';
import { isBigUint64Array } from 'util/types';
import { MailService } from 'src/mail/mail.service';
import { makeEmailVerifyToken } from './utils/token';
import { createHash } from 'crypto';
import { last, NotFoundError } from 'rxjs';

@Injectable()
export class AuthService {
    constructor ( private jwtService: JwtService, private prisma: DatabaseService, private mailService: MailService) {}

    async validateUser({ username, password }:  AuthPayloadDto){
        const user = await this.prisma.users.findUnique({
            where: { username },
        });
        if (!user) return null;
        if (!user.password) throw new UnauthorizedException('This account uses Google login');

        if (!user.isEmailVerified) {
            throw new UnauthorizedException('Please verify your email before logging in.');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const update = await this.prisma.users.update({
            where: { id: user.id },
            data: { status: 'ONLINE' },
            select: { id: true, username: true, status: true, email: true },
        })
        return this.signTokenWithUser(update.id);
    }

    async register(dto: RegisterDto){
        console.log('Register attempt:', dto);
        const exist = await this.prisma.users.findFirst({
            where: {
                OR: [{email: dto.email}, {username: dto.username}],
            },
        }) ;
        if (exist) throw new ConflictException('User already exists');

        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.users.create({
            data: {
                email: dto.email,
                username: dto.username,
                password: hashed,
                isEmailVerified: false,
            },
        });

        const {raw, hash } = makeEmailVerifyToken();
        await this.prisma.email_token.create({
            data: {
                userId: user.id,
                tokenHash: hash,
                expiresAt: new Date(Date.now() + 30 * 60  * 1000),
            },
        });
        const link = `${process.env.FRONT_URL}/auth/verify-email?token=${raw}`;
        try{
            await this.mailService.sendVerificationMail(user.email!, link);
            console.log('Verification email sent successfully to:', user.email);
        }catch(e){
            console.error('SEND MAIL ERROR:', e);
            throw new InternalServerErrorException('Failed to send verification email');
        }
        return { message: 'Account created. Check your email to verify your account.', userId: user.id };
    }

    async refreshTokens(userId: number, refreshToken: string){
        const user = await this.prisma.users.findUnique({where: {id: userId}});
        if (!user || !user.refreshToken) throw new UnauthorizedException();

        const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isValid) throw new UnauthorizedException();

        return this.signTokenWithUser(user.id);
    }

    async logout(userId: number){
        if (!userId) return;
        await this.prisma.users.update({
            where: {id: userId},
            data: {refreshToken: null, status: 'OFFLINE'},
        });
    }

    private async signToken(userId: number, username: string) {
        await this.prisma.users.update({
            where: {id: userId},
            data: { status: "ONLINE"},
        });

        const payload = { sub: userId, username };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });

        const hashed = await bcrypt.hash(refreshToken, 10);
        await this.prisma.users.update({
            where: {id: userId},
            data: {refreshToken: hashed},
        });
        return ({accessToken});
    }

    async validateGoogleUser(googleUser: GoogleDto){
        const user = await this.prisma.users.findFirst({
            where: {email: googleUser.email},
        });
        if (user) return user;
        return await this.prisma.users.create({
            data: {
                email: googleUser.email,
                username: `${googleUser.email.split('@')[0]}_${googleUser.googleId.slice(0, 6)}`,
                googleId: googleUser.googleId,
                avatarUrl: googleUser.avatarUrl,
                password: null,
                status: 'ONLINE',
                isEmailVerified: true,
            }
        });
    }

    async googleLogin(googleUser: GoogleDto) {
        const user = await this.validateGoogleUser(googleUser);
        return this.signTokenWithUser(user.id);
    }

    async validateFtUser(ftUser: FtDto){
        const user = await this.prisma.users.findUnique({
            where: {email: ftUser.email},
        });
        if (user){
            if (!user.ftId){
                return this.prisma.users.update({
                    where: {id: user.id},
                    data: { ftId: ftUser.ftId, avatarUrl: ftUser.avatarUrl, status: 'ONLINE', isEmailVerified: true},
                });
            }
            return user;
        }
        return this.prisma.users.create({
            data: {
                email: ftUser.email,
                username: ftUser.login,
                password: null,
                ftId: ftUser.ftId,
                avatarUrl: ftUser.avatarUrl,
                status: 'ONLINE',
                isEmailVerified: true,
            },
        });
    }

    async ftLogin(ftUser: FtDto){
        const user = await this.validateFtUser(ftUser);
        return this.signTokenWithUser(user.id);
    }

    private async getSafeUser(userId: number) {
        return this.prisma.users.findUnique({
            where: { id: userId },
            select: {
            id: true,
            username: true,
            email: true,      // keep if you want frontend to show it
            avatarUrl: true,
            status: true,
            createdAt: true,
            },
        });
    }

    private async signTokenWithUser(userId: number) {
        const user = await this.getSafeUser(userId);
        if (!user) throw new UnauthorizedException('User not found');
        const tokens = await this.signToken(userId, user.username);
        return { ...tokens, user };
    }

    async guestLogin(){
        const username = `guest_${Math.random().toString(16).slice(2, 8)}`;
        const user = await this.prisma.users.create({
            data: { username, password: null, isGuest: true, avatarUrl: null },
        });

        const payload = { sub: user.id, username: user.username, isGuest: true };

        const accesToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '30',
        });

        return { accesToken, user: { id: user.id, username: user.username, avatarUrl: user.avatarUrl, status: user.status, isGuest: true },};
    }

    async verifyEmail(rawToken: string) {
    if (!rawToken) throw new BadRequestException('Missing token');

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const tokenRow = await this.prisma.email_token.findFirst({
        where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
        },
    });

    if (!tokenRow) {
        throw new BadRequestException('Invalid or expired token');
    }

    await this.prisma.$transaction([
        this.prisma.users.update({
        where: { id: tokenRow.userId },
        data: { isEmailVerified: true },
        }),
        this.prisma.email_token.update({
        where: { id: tokenRow.id },
        data: { usedAt: new Date() },
        }),
    ]);

    return { message: 'Email verified successfully. You can now log in.' };
    }

    async resendVef(email: string){
        if(!email) throw new BadRequestException('An Email is required');
        const user = await this.prisma.users.findUnique({
            where: { email },
        });
        if (!user) return { message: "If that email exists, a verification email has been sent." };
        if (user.isEmailVerified) return { message: "Email is already verified. You can log in."};

        const lastToken = await this.prisma.email_token.findFirst({
            where: { userId: user.id },
            orderBy: {createdAt: 'desc'},
            select: { createdAt: true },
        });

        if(lastToken){
            const diff = Date.now() - lastToken.createdAt.getTime();
            if (diff < 60 * 100){ 
                throw new HttpException('Please wait a bit before requesting again.', HttpStatus.TOO_MANY_REQUESTS);
            }
        }
        await this.prisma.email_token.updateMany({
            where: {
                userId: user.id,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            data: { usedAt: new Date() },
        });

        const { raw, hash } = makeEmailVerifyToken();

        await this.prisma.email_token.create({
            data: {
            userId: user.id,
            tokenHash: hash,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            },
        });

        const link = `${process.env.BACK_URL}/auth/verify-email?token=${raw}`;

        await this.mailService.sendVerificationMail(user.email!, link);

        return { message: 'If that email exists, a verification email has been sent.' };
    }
}
