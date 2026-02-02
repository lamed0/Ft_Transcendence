import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../../libs/common/guards/jwt.guard';
import { UpdateDto } from './dto/update-profile.dto';

type ReqWithUser = Request & { user: { id: number }}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService){}

    private assertInternal(@Headers('x-internal-token') token?: string) {
    if (!process.env.INTERNAL_TOKEN || token !== process.env.INTERNAL_TOKEN) {
      throw new UnauthorizedException('Internal access only');
    }
  }

    @Get('me')
    async getMe(@Req() req: ReqWithUser){
        return this.userService.me(req.user.id);
    }

    // @Get(":id")
    // async getById(@Param("id", ParseIntPipe) id: number){
    //     return this.userService.getById(id);
    // }

    @Patch('me')
    async updateMe(@Req() req: ReqWithUser, @Body() dto: UpdateDto){
        return this.userService.updateMe(req.user.id, dto); 
    }

    @Delete('me')
    async deleteME(@Req() req: ReqWithUser){
        return this.userService.deleteUser(req.user.id);
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

}