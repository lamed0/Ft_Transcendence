import { Controller, Get } from '@nestjs/common';
import { FriendsService } from './friends.service';

@Controller()
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  getHello(): string {
    return this.friendsService.getHello();
  }
}
