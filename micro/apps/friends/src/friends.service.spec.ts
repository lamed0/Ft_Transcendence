import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsDatabaseService } from './friends-database.service';
import { UsersClient } from './clients/user.client';
import { normalizePair } from './utils/friends.utils';

jest.mock('./utils/friends.utils');

describe('FriendsService', () => {
  let service: FriendsService;
  let prisma: jest.Mocked<FriendsDatabaseService>;
  let userClient: jest.Mocked<UsersClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
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
            batch: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
    prisma = module.get(FriendsDatabaseService) as jest.Mocked<FriendsDatabaseService>;
    userClient = module.get(UsersClient) as jest.Mocked<UsersClient>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendReq', () => {
    it('should throw BadRequestException when trying to friend yourself', async () => {
      await expect(service.sendReq(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if user does not exist', async () => {
      userClient.exists.mockRejectedValueOnce(new Error('User not found'));
      await expect(service.sendReq(1, 2)).rejects.toThrow();
    });

    it('should create a friend request', async () => {
      (normalizePair as jest.Mock).mockReturnValue({ low: 1, high: 2 });
      prisma.friends.findUnique.mockResolvedValueOnce(null);
      prisma.friends.create.mockResolvedValueOnce({
        id: 1,
        userLowId: 1,
        userHighId: 2,
        requestedBy: 1,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await service.sendReq(1, 2);

      expect(userClient.exists).toHaveBeenCalledTimes(2);
      expect(prisma.friends.create).toHaveBeenCalledWith({
        data: {
          userLowId: 1,
          userHighId: 2,
          requestedBy: 1,
          status: 'PENDING',
        },
      });
      expect(result.status).toBe('PENDING');
    });

    it('should throw ConflictException if already friends', async () => {
      (normalizePair as jest.Mock).mockReturnValue({ low: 1, high: 2 });
      prisma.friends.findUnique.mockResolvedValue({
        id: 1,
        userLowId: 1,
        userHighId: 2,
        requestedBy: 1,
        status: 'ACCEPTED',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(service.sendReq(1, 2)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if request already sent', async () => {
      (normalizePair as jest.Mock).mockReturnValue({ low: 1, high: 2 });
      prisma.friends.findUnique.mockResolvedValue({
        id: 1,
        userLowId: 1,
        userHighId: 2,
        requestedBy: 1,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(service.sendReq(1, 2)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if incoming request exists', async () => {
      (normalizePair as jest.Mock).mockReturnValue({ low: 1, high: 2 });
      prisma.friends.findUnique.mockResolvedValue({
        id: 1,
        userLowId: 1,
        userHighId: 2,
        requestedBy: 2,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(service.sendReq(1, 2)).rejects.toThrow(ConflictException);
    });
  });

  describe('acceptReq', () => {
    it('should throw BadRequestException when trying to accept from yourself', async () => {
      await expect(service.acceptReq(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if user does not exist', async () => {
      userClient.exists.mockRejectedValueOnce(new Error('User not found'));
      await expect(service.acceptReq(1, 2)).rejects.toThrow();
    });

    it('should throw NotFoundException if no pending request', async () => {
      (normalizePair as jest.Mock).mockReturnValue({ low: 1, high: 2 });
      prisma.friends.findUnique.mockResolvedValueOnce(null);

      await expect(service.acceptReq(1, 2)).rejects.toThrow(NotFoundException);
      await expect(service.acceptReq(1, 2)).rejects.toThrow('No pending request');
    });

    it('should throw ForbiddenException if you requested the friendship', async () => {
      (normalizePair as jest.Mock).mockReturnValue({ low: 1, high: 2 });
      prisma.friends.findUnique.mockResolvedValue({
        id: 1,
        userLowId: 1,
        userHighId: 2,
        requestedBy: 1,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(service.acceptReq(1, 2)).rejects.toThrow(ForbiddenException);
    });

    it('should accept a friend request', async () => {
      (normalizePair as jest.Mock).mockReturnValue({ low: 1, high: 2 });
      prisma.friends.findUnique.mockResolvedValueOnce({
        id: 1,
        userLowId: 1,
        userHighId: 2,
        requestedBy: 2,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      prisma.friends.update.mockResolvedValueOnce({
        id: 1,
        userLowId: 1,
        userHighId: 2,
        requestedBy: 2,
        status: 'ACCEPTED',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await service.acceptReq(1, 2);

      expect(prisma.friends.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'ACCEPTED' },
      });
      expect(result.status).toBe('ACCEPTED');
    });
  });

  describe('deleteRelationship', () => {
    it('should throw BadRequestException when trying to delete with yourself', async () => {
      await expect(service.deleteRelationship(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if user does not exist', async () => {
      userClient.exists.mockRejectedValueOnce(new Error('User not found'));
      await expect(service.deleteRelationship(1, 2)).rejects.toThrow();
    });

    it('should throw NotFoundException if relationship not found', async () => {
      (normalizePair as jest.Mock).mockReturnValue({ low: 1, high: 2 });
      prisma.friends.findUnique.mockResolvedValueOnce(null);

      await expect(service.deleteRelationship(1, 2)).rejects.toThrow(NotFoundException);
      await expect(service.deleteRelationship(1, 2)).rejects.toThrow('Relationship not found');
    });

    it('should delete a pending friend request', async () => {
      (normalizePair as jest.Mock).mockReturnValue({ low: 1, high: 2 });
      prisma.friends.findUnique.mockResolvedValueOnce({
        id: 1,
        userLowId: 1,
        userHighId: 2,
        requestedBy: 1,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      prisma.friends.delete.mockResolvedValueOnce({} as any);

      await service.deleteRelationship(1, 2);

      expect(prisma.friends.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should delete an accepted friendship', async () => {
      (normalizePair as jest.Mock).mockReturnValue({ low: 1, high: 2 });
      prisma.friends.findUnique.mockResolvedValueOnce({
        id: 1,
        userLowId: 1,
        userHighId: 2,
        requestedBy: 1,
        status: 'ACCEPTED',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      prisma.friends.delete.mockResolvedValueOnce({} as any);

      await service.deleteRelationship(1, 2);

      expect(prisma.friends.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('listFriends', () => {
    it('should return empty array if user has no friends', async () => {
      prisma.friends.findMany.mockResolvedValueOnce([]);
      userClient.batch.mockResolvedValueOnce([]);

      const result = await service.listFriends(1);

      expect(result).toEqual([]);
      expect(prisma.friends.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACCEPTED',
          OR: [{ userLowId: 1 }, { userHighId: 1 }],
        },
        select: {
          userLowId: true,
          userHighId: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should return list of friend IDs when user is userLow', async () => {
      const friends = [
        { id: 5, username: 'player5', avatarUrl: null, status: 'ONLINE', level: 3 },
        { id: 10, username: 'player10', avatarUrl: null, status: 'OFFLINE', level: 5 },
      ];
      prisma.friends.findMany.mockResolvedValueOnce([
        { userLowId: 1, userHighId: 5, updatedAt: new Date() },
        { userLowId: 1, userHighId: 10, updatedAt: new Date() },
      ] as any);
      userClient.batch.mockResolvedValueOnce(friends);

      const result = await service.listFriends(1);

      expect(result).toEqual(friends);
      expect(userClient.batch).toHaveBeenCalledWith([5, 10]);
    });

    it('should return list of friend IDs when user is userHigh', async () => {
      const friends = [
        { id: 3, username: 'player3', avatarUrl: null, status: 'IN_GAME', level: 2 },
        { id: 7, username: 'player7', avatarUrl: null, status: 'ONLINE', level: 4 },
      ];
      prisma.friends.findMany.mockResolvedValueOnce([
        { userLowId: 3, userHighId: 1, updatedAt: new Date() },
        { userLowId: 7, userHighId: 1, updatedAt: new Date() },
      ] as any);
      userClient.batch.mockResolvedValueOnce(friends);

      const result = await service.listFriends(1);

      expect(result).toEqual(friends);
      expect(userClient.batch).toHaveBeenCalledWith([3, 7]);
    });

    it('should return mixed friend IDs correctly', async () => {
      const friends = [
        { id: 5, username: 'player5', avatarUrl: null, status: 'ONLINE', level: 3 },
        { id: 3, username: 'player3', avatarUrl: null, status: 'IN_GAME', level: 2 },
        { id: 10, username: 'player10', avatarUrl: null, status: 'OFFLINE', level: 5 },
      ];
      prisma.friends.findMany.mockResolvedValueOnce([
        { userLowId: 1, userHighId: 5, updatedAt: new Date() },
        { userLowId: 3, userHighId: 1, updatedAt: new Date() },
        { userLowId: 1, userHighId: 10, updatedAt: new Date() },
      ] as any);
      userClient.batch.mockResolvedValueOnce(friends);

      const result = await service.listFriends(1);

      expect(result).toEqual(friends);
      expect(userClient.batch).toHaveBeenCalledWith([5, 3, 10]);
    });
  });
});
