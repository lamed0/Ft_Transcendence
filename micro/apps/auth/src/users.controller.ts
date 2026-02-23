import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Patch, Post, Put, Req, UnauthorizedException, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../../libs/common/guards/jwt.guard';
import { UpdateDto } from './dto/update-profile.dto';
import { ApiKeyService } from './api-key.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Multer } from 'multer';
import * as fs from 'fs';

type ReqWithUser = Request & { user: { sub: number }}

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
        private readonly apiKeyService: ApiKeyService,
    ){}

    private assertInternal(@Headers('x-internal-token') token?: string) {
    if (!process.env.INTERNAL_TOKEN || token !== process.env.INTERNAL_TOKEN) {
      throw new UnauthorizedException('Internal access only');
    }
  }


    @UseGuards(JwtAuthGuard)
    @Get('me/export')
    async exportData(@Req() req: ReqWithUser) {
        const data = await this.userService.exportData(req.user.sub);
        // sending the file in json response, frontend will handle the 
            return {
            filename: `my_data_${Date.now()}.json`,
            contentType: 'application/json',
            data: JSON.stringify(data),
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() req: ReqWithUser) {
        const user = await this.userService.me(req.user.sub);
        
        const response: any = { ...user };  // Allow dynamic properties
        
        // If user has an avatar, read the file and convert to base64
        if (user.avatarUrl) {
            const filename = user.avatarUrl.split('/').pop();
            if (filename) {  // Check that filename exists
                const imagePath = join(process.cwd(), 'uploads/avatars', filename);
                
                try {
                    const imageBuffer = fs.readFileSync(imagePath);
                    response.avatarBase64 = imageBuffer.toString('base64');
                    response.avatarMimeType = 'image/jpeg';
                } catch (e) {
                    // File not found, leave avatarBase64 empty
                }
            }
        }
        return response;
    }

    // @UseGuards(JwtAuthGuard)
    // @Get('me/avatar')
    // async getAvatar(@Req() req: ReqWithUser){
    //     return this.userService.getAvatar(req.user.sub);
    // }

    @UseGuards(JwtAuthGuard)
    @Post('avatar/upload')
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './uploads/avatars',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.startsWith('image/')) {
                    return cb(new BadRequestException('Only image files are allowed'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        }),
    )
    async uploadAvatar(@Req() req: ReqWithUser, @UploadedFile() file: Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        const avatarUrl = `/uploads/avatars/${file.filename}`;
        return this.userService.updateMe(req.user.sub, { avatarUrl });
        // extract file from request, save it to disk
         
    }

    // @Get(":id")
    // async getById(@Param("id", ParseIntPipe) id: number){
    //     return this.userService.getById(id);
    // }

    // @UseGuards(JwtAuthGuard)
    // @Patch('me')
    // async updateMe(@Req() req: ReqWithUser, @Body() dto: UpdateDto){
    //     return this.userService.updateMe(req.user.sub, dto); 
    // }

    // @UseGuards(JwtAuthGuard)
    // @Delete('me')
    // async deleteME(@Req() req: ReqWithUser){
    //     return this.userService.anonymizeUser(req.user.sub);
    // }

    @Delete(':id')
    deleteUserById(@Param('id', ParseIntPipe) id: number, @Headers('x-internal-token') token?: string){
        this.assertInternal(token);
        return this.userService.anonymizeUser(id);
    }

    
    @Get('internal/users/:id')
    getBatchUserId(@Param('id', ParseIntPipe) id: number, @Headers('x-internal-token') token?: string){
        this.assertInternal(token);
        return this.userService.getById(id);
    }

    @Post('internal/users/batch')
    batch(@Body() body: { ids: number[] }, @Headers('x-internal-token') token?: string){
        this.assertInternal(token);
        return this.userService.getUsersPublicBatch(body.ids);
    }

    @Post('internal/users/status/batch')
    async setStatusBatch(@Body() body: { ids: number[]; status: 'ONLINE'|'OFFLINE'|'IN_GAME' },
                        @Headers('x-internal-token') token?: string) {
    this.assertInternal(token);
    return this.userService.setStatusBatch(body.ids, body.status);
    }

    @Patch('internal/users/:id/level')
    async updateUserLevel(@Param('id', ParseIntPipe) id: number, @Body() body: { level: number }, @Headers('x-internal-token') token?: string) {
        this.assertInternal(token);
        return this.userService.updateLevel(id, body.level);
    }

    @Put(':id')
    async updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDto, @Headers('x-internal-token') token?: string) {
        this.assertInternal(token);
        return this.userService.updateMe(id, dto);
    }

    @Get('api-key/validate')
    async validateApiKey(@Headers('x-api-key') apiKey: string, @Headers('x-internal-token') token?: string) {
        this.assertInternal(token);
        return this.apiKeyService.validateApiKey(apiKey);
    }

    @Post('api-key/generate')
    async generateApiKey(@Body() body: { name: string; rateLimit?: number }, @Headers('x-internal-token') token?: string) {
        this.assertInternal(token);
        return this.apiKeyService.generateApiKey(body.name, body.rateLimit);
    }

    // @Delete('api-key/:id')
    // async revokeApiKey(@Param('id') keyId: string, @Headers('x-internal-token') token?: string) {
    //     this.assertInternal(token);
    //     const apiKey = await this.apiKeyService.getApiKey(Number(keyId));
    //     if (apiKey?.key) {
    //         await this.apiKeyService.revokeApiKey(apiKey.key);
    //     }
    //     return { message: 'API key revoked' };
    // }


}