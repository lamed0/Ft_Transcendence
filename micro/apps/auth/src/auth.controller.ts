import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import type { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { RefreshGuard } from './guards/refresh.guard';
import { Public } from '../../../libs/common/public.decorator';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { FtAuthGuard } from './guards/ft-auth/ft-auth.guard';
import { ResendVerificationDto } from './dto/resend-verification.dto';

interface AuthenticatedRequest extends Request {
    user: any;
}

@Controller('auth')
export class AuthController {

    constructor( private authService: AuthService) {}
    
    @UseGuards(LocalGuard)
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
        return res.redirect(`http://localhost:5173/oauth?token=${response.accessToken}`);
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
        return res.redirect(`http://localhost:5173/oauth?token=${response.accessToken}`);
    }

}
