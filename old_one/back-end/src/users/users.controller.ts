import { Controller, Get, Param } from '@nestjs/common';
import { CreateUserDto } from './dto/createuser.dto';
import { UserService } from './users.service';

@Controller('users')
export class UsersController {
    constructor (private readonly userService: UserService) {}

    // @()
    // create(@Body() createUserDto: CreateUserDto){
    //     return "this action add a new user."
    // }

    @Get()
    findAll(){
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return `user id: ${id}`;
    }
}
