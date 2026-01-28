import { Injectable } from '@nestjs/common';

@Injectable()
export class FriendsService {
  getHello(): string {
    return 'Hello World!';
  }
}
