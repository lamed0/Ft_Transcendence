import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateDto } from './dto/update-profile.dto';

type ReqWithUser = Request & { user: { id: number }}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService){}

    @Get('me')
    async getMe(@Req() req: ReqWithUser){
        return this.userService.me(req.user.id);
    }

    @Get(":id")
    async getById(@Param("id", ParseIntPipe) id: number){
        return this.userService.getById(id);
    }

    @Patch('me')
    async updateMe(@Req() req: ReqWithUser, @Body() dto: UpdateDto){
        return this.userService.updateMe(req.user.id, dto); 
    }

    @Delete('me')
    async deleteME(@Req() req: ReqWithUser){
        return this.userService.deleteUser(req.user.id);
    }
}
