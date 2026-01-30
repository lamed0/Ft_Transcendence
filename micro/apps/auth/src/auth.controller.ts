import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
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

interface AuthenticatedRequest extends Request {
    user: any;
}

@Controller('auth')
export class AuthController {

    constructor( private authService: AuthService) {}
    
    @RateLimit({ max: 5, windowMs: 900000 }) // 5 requests per 15 minutes
    @UseGuards(LocalGuard, RateLimitGuard)
    @Post('login')
    async login(@Req() req: AuthenticatedRequest){
        return req.user;
    }

    @Post('guest')
    async guest(){
        return this.authService.guestLogin();
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async status(@Req() req: AuthenticatedRequest){
        return req.user;
    }

    @RateLimit({ max: 5, windowMs: 3600000 }) // 5 requests per hour
    @UseGuards(JwtAuthGuard, RateLimitGuard)
    @Post('change-password')
    async changePassword(@Req() req: AuthenticatedRequest, @Body() dto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.id, dto.oldPassword, dto.newPassword, dto.confirmPassword);
    }

    @Public()
    @RateLimit({ max: 3, windowMs: 3600000 }) // 3 requests per hour
    @UseGuards(RateLimitGuard)
    @Post('register')
    async register(@Body() dto: RegisterDto){
        return this.authService.register(dto);
    }

    @Public()
    @Get('verify-email')
    async verifyEmail(@Query('token') token: string){
        return this.authService.verifyEmail(token);
    }

    @Public()
    @Post('resend-verification')
    async resendVerification(@Body() dto: ResendVerificationDto){
        return this.authService.resendVef(dto.email);
    }


    @UseGuards(RefreshGuard)
    @Post('refresh')
    async refresh(@Req() req: AuthenticatedRequest) {
        return this.authService.refreshTokens(req.user.userId, req.user.refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Req() req: AuthenticatedRequest) {
        return this.authService.logout(req.user.id);
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
        
        const response = await this.authService.googleLogin(req.user);
        return res.redirect(`http://localhost:5173/home?token=${response.accessToken}`);
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
        return res.redirect(`http://localhost:5173/home?token=${response.accessToken}`);
    }

}
