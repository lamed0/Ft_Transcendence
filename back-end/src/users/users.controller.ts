import { Controller, Get, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
    @Get()
    findAll(): string{
        return "Show users.";
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return `user id: ${id}`;
    }
}
