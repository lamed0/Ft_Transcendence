import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { FriendsDatabaseService } from './friends-database.service';
import { UsersClient } from './clients/user.client';

describe('FriendsController', () => {
  let friendsController: FriendsController;
  let friendsService: jest.Mocked<FriendsService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [
        {
          provide: FriendsService,
          useValue: {
            sendReq: jest.fn(),
            acceptReq: jest.fn(),
            deleteRelationship: jest.fn(),
            listFriends: jest.fn(),
          },
        },
        {
          provide: FriendsDatabaseService,
          useValue: {
            friends: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: UsersClient,
          useValue: {
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    friendsController = app.get<FriendsController>(FriendsController);
    friendsService = app.get(FriendsService) as jest.Mocked<FriendsService>;
  });

  describe('send', () => {
    it('should send a friend request', async () => {
      const req = { user: { id: 1 } };
      const friendRequest = { id: 1, userLowId: 1, userHighId: 2, status: 'PENDING' };
      
      friendsService.sendReq.mockResolvedValueOnce(friendRequest as any);

      const result = await friendsController.send(req, 2);

      expect(friendsService.sendReq).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(friendRequest);
    });
  });

  describe('accept', () => {
    it('should accept a friend request', async () => {
      const req = { user: { id: 1 } };
      const accepted = { id: 1, userLowId: 1, userHighId: 2, status: 'ACCEPTED' };
      
      friendsService.acceptReq.mockResolvedValueOnce(accepted as any);

      const result = await friendsController.accept(req, 2);

      expect(friendsService.acceptReq).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(accepted);
    });
  });

  describe('deleteRelation', () => {
    it('should delete a friendship', async () => {
      const req = { user: { id: 1 } };
      
      friendsService.deleteRelationship.mockResolvedValueOnce({} as any);

      const result = await friendsController.deleteRelation(req, 2);

      expect(friendsService.deleteRelationship).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('list', () => {
    it('should list friends', async () => {
      const req = { user: { id: 1 } };
      const friends = [2, 3, 4];
      
      friendsService.listFriends.mockResolvedValueOnce(friends as any);

      const result = await friendsController.list(req);

      expect(friendsService.listFriends).toHaveBeenCalledWith(1);
      expect(result).toEqual(friends);
    });
  });
});
