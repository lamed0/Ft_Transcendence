import { Body, Controller, Get, Post, Query, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from '../../../libs/common/guards/local.guard';
import { JwtAuthGuard } from '../../../libs/common/guards/jwt.guard';
import type { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshGuard } from '../../../libs/common/guards/refresh.guard';
import { Public } from '../../../libs/common/public.decorator';
import { RateLimit } from './decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../../libs/common/guards/rate-limit.guard';
import { GoogleAuthGuard } from '../../../libs/common/guards/google-auth/google-auth.guard';
import { FtAuthGuard } from '../../../libs/common/guards/ft-auth/ft-auth.guard';
import { ResendVerificationDto } from './dto/resend-verification.dto';

import { UsersService } from './users.service'; 
import { TwoFactorAuthenticationService } from './twoFactor/twoFactor.service'; 
import { ApiKeyService } from './api-key.service'; 

interface AuthenticatedRequest extends Request {
    user: any;
}

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private usersService: UsersService, 
        private twoFactorService: TwoFactorAuthenticationService,
        private apiKeyService: ApiKeyService,
    ) {}
    //////////////////////////////////////////////////

    @Public()
    @Post('check-exists')
    async checkExists(@Body() body: { email?: string; username?: string }) {
        const { email, username } = body;
        
        if (!email && !username) {
            return { exists: false, message: 'Provide email or username' };
        }

        const user = await this.usersService.findByEmailOrUsername(email, username);
        
        return { exists: !!user };
    }

    // 2FA SECTION 

    @Post('2fa/generate')
    async generateTwoFactor(@Body() body: { userId?: number }, @Req() req: AuthenticatedRequest) {
        // Allow both authenticated users and unauthenticated users setting up 2FA
        const userId = req.user ? ((req.user as any).sub || req.user.id) : body.userId;
        if (!userId) {
            throw new UnauthorizedException('User ID required');
        }
        const user = await this.usersService.findOneById(userId);
        if (!user.email) {
            throw new UnauthorizedException('User must have an email address to use 2FA.');
        }
        const { otpauthUrl } = await this.twoFactorService.generateTwoFactorAuthenticationSecret({
            ...user,
            email: user.email
        });
        return this.twoFactorService.generateQrCodeDataURL(otpauthUrl);
    }
    
    // TURN-OFF ENDPOINT
    @UseGuards(JwtAuthGuard)
    @Post('2fa/turn-off')
    async turnOffTwoFactorAuthentication(@Req() req: AuthenticatedRequest) {
        const userId = (req.user as any).sub || req.user.id;
        await this.usersService.turnOffTwoFactorAuthentication(userId);
        return { message: "2FA is now disabled." };
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/turn-on')
    async turnOnTwoFactorAuthentication(@Req() req: AuthenticatedRequest) {
        const userId = (req.user as any).sub || req.user.id;
        await this.usersService.turnOnTwoFactorAuthentication(userId);
        return { message: "2FA is now enabled." };
    }
    
    @Post('2fa/validate-code')
    async ValidateFactorAuthentication(@Body() body: { userId: number, twoFactorAuthenticationCode: string }) {
        const user = await this.usersService.findOneById(body.userId);
        if (!user || !user.twoFactorAuthenticationSecret) {
            throw new UnauthorizedException('No 2FA secret found. Please generate QR code first.');
        }
        const isCodeValid = this.twoFactorService.isTwoFactorCodeValid(
            body.twoFactorAuthenticationCode,
            { twoFactorAuthenticationSecret: user.twoFactorAuthenticationSecret }
        );
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code');
        }
        // Optionally enable 2FA here if needed
        return { message: "2FA is now enabled!" };
    }


    @RateLimit({ max: 5, windowMs: 900000 })
    @UseGuards(LocalGuard, RateLimitGuard)
    @Post('login')
    async login(@Req() req: AuthenticatedRequest, @Res() res: Response){
        const result = req.user;

        // Check for 2FA requirement FIRST before destructuring tokens
        if (result.requires2fa) {
            return res.status(200).json({
                message: '2FA_REQUIRED',
                userId: result.userId
            });
        }
        
        const { accessToken, refreshToken, user } = result;
        // Get or create API key for this user
        const apiKey = await this.apiKeyService.getOrCreateApiKey(user.id, 'Default');
        
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, 
        });
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });
        
        res.cookie('x-api-key', apiKey.key, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        });
        
        return res.json({ user }); 
    }

    @Public()
    @RateLimit({ max: 5, windowMs: 300000 })
    @Post('2fa/authenticate')
    async authenticate2fa(@Body() body: { userId: number, twoFactorAuthenticationCode: string }, @Res() res: Response) {
        
        const result = await this.authService.loginWith2fa(body.userId, body.twoFactorAuthenticationCode);
        const { accessToken, refreshToken, user } = result;
        // Get or create API key for this user
        const apiKey = await this.apiKeyService.getOrCreateApiKey(user.id, 'Default');
        
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, 
        });
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });
        
        res.cookie('x-api-key', apiKey.key, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        });

        return res.json({ user });
    }


    /////////////////////////////////////////////////
   



    @Post('guest')
    async guest(@Res() res: Response){
        const result = await this.authService.guestLogin();
        
        const apiKey = await this.apiKeyService.getOrCreateApiKey(result.user.id, 'Default');
        // Set HTTP-only cookies with tokens
        res.cookie('accessToken', result.accesToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.cookie('x-api-key', apiKey.key, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        });
        
        return res.json({ user: result.user });
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async status(@Req() req: AuthenticatedRequest, @Res() res: Response){
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        return res.json(req.user);
    }

    @RateLimit({ max: 5, windowMs: 100 }) // 5 requests per hour
    @UseGuards(JwtAuthGuard, RateLimitGuard)
    @Post('change-password')
    async changePassword(@Req() req: AuthenticatedRequest, @Body() dto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.sub, dto.oldPassword, dto.newPassword, dto.confirmPassword);
    }

    @Public()
    @RateLimit({ max: 3, windowMs: 100 }) // 3 requests per hour
    @UseGuards(RateLimitGuard)
    @Post('register')
    async register(@Body() dto: RegisterDto){
        return this.authService.register(dto);
    }

    @Public()
    @Get('verify-email')
    async verifyEmail(@Query('token') token: string, @Res() res: Response){
        const result = await this.authService.verifyEmail(token);
        
        // Set HTTP-only cookies (secure, not visible in URL)
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        // Redirect to home without token in URL
        return res.redirect('https://localhost/home');
    }

    @Public()
    @Post('resend-verification')
    async resendVerification(@Body() dto: ResendVerificationDto){
        return this.authService.resendVef(dto.email);
    }


    @UseGuards(RefreshGuard)
    @Post('refresh')
    async refresh(@Req() req: AuthenticatedRequest, @Res() res: Response) {
        const { accessToken, refreshToken } = await this.authService.refreshTokens(req.user.userId, req.user.refreshToken);
        
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        return res.json({ status: 'success' });
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Req() req: AuthenticatedRequest) {
        const userId = (req.user as any)?.sub ?? (req.user as any)?.id;
        return this.authService.logout(userId);
    }

    @Public()
    @UseGuards(GoogleAuthGuard)
    @Get('google/login')
    async googleLogin(){}

    @Public()
    @UseGuards(GoogleAuthGuard)
    @Get('google/callback')
    async googleCallback(@Req() req: AuthenticatedRequest, @Res() res: Response){
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        
        const response = await this.authService.ftLogin(req.user);
        
        // Get or create API key for the user
        const apiKey = await this.apiKeyService.getOrCreateApiKey(req.user.id, 'Default');
        
        // Set HTTP-only cookies (secure, not visible in URL)
        res.cookie('accessToken', response.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        
        res.cookie('refreshToken', response.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        res.cookie('x-api-key', apiKey.key, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        });
        
        // Redirect to home without token in URL
        return res.redirect('https://localhost/home');
    }


    @Public()
    @UseGuards(FtAuthGuard)
    @Get('42/login')
    async ftlogin(){}

    @Public()
    @UseGuards(FtAuthGuard)
    @Get('42/callback')
    async ftCallback(@Req() req: AuthenticatedRequest, @Res() res: Response){
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        
        const response = await this.authService.ftLogin(req.user);
        
        // Get or create API key for the user
        const apiKey = await this.apiKeyService.getOrCreateApiKey(req.user.id, 'Default');
        
        // Set HTTP-only cookies (secure, not visible in URL)
        res.cookie('accessToken', response.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        
        res.cookie('refreshToken', response.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        res.cookie('x-api-key', apiKey.key, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        });
        
        // Redirect to home without token in URL
        return res.redirect('https://localhost/home');
    }

}
