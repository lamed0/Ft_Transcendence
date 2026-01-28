import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

describe('FriendsController', () => {
  let friendsController: FriendsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [FriendsService],
    }).compile();

    friendsController = app.get<FriendsController>(FriendsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(friendsController.getHello()).toBe('Hello World!');
    });
  });
});
