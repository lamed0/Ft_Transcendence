import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { GameDatabaseService } from './game-database.service';
import { PermissionService } from './permission/permission.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SubmitScoreResult } from './dto/result.dto';

describe('GameService', () => {
  let service: GameService;
  let prisma: jest.Mocked<GameDatabaseService>;
  let permissions: jest.Mocked<PermissionService>;

  const mockDate = new Date('2026-01-31T10:00:00.000Z');

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    const mockPrisma = {
      gameSession: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };

    const mockPermissions = {
      areFriends: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: GameDatabaseService, useValue: mockPrisma },
        { provide: PermissionService, useValue: mockPermissions },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    prisma = module.get(GameDatabaseService) as jest.Mocked<GameDatabaseService>;
    permissions = module.get(PermissionService) as jest.Mocked<PermissionService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('submitResult', () => {
    const sessionId = 'session-uuid-123';
    const userId = 1;
    const dto: SubmitScoreResult = { scoreA: 11, scoreB: 9 };

    it('should successfully submit result for ONEVONE_QUEUE game', async () => {
      const mockSession = {
        id: sessionId,
        mode: 'ONEVONE_QUEUE',
        status: 'LIVE',
        hostUserId: 1,
        scoreA: 0,
        scoreB: 0,
        createdAt: new Date('2026-01-31T09:50:00.000Z'),
        startedAt: new Date('2026-01-31T09:51:00.000Z'),
        endedAt: null,
        participants: [
          { id: 'p1', userId: 1, role: 'PLAYER', sessionId, joinedAt: mockDate },
          { id: 'p2', userId: 2, role: 'PLAYER', sessionId, joinedAt: mockDate },
        ],
      };

      const mockUpdatedSession = {
        id: sessionId,
        status: 'FINISHED',
        scoreA: 11,
        scoreB: 9,
      };

      prisma.gameSession.findUnique.mockResolvedValue(mockSession as any);
      prisma.gameSession.update.mockResolvedValue(mockUpdatedSession as any);

      const result = await service.submitResult(sessionId, userId, dto);

      expect(prisma.gameSession.findUnique).toHaveBeenCalledWith({
        where: { id: sessionId },
        include: { participants: true },
      });

      expect(prisma.gameSession.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: {
          status: 'FINISHED',
          scoreA: 11,
          scoreB: 9,
          endedAt: mockDate,
        },
        select: { id: true, status: true, scoreA: true, scoreB: true, playerALevel: true, playerBLevel: true },
      });

      expect(result).toEqual({
        id: sessionId,
        status: 'FINISHED',
        scoreA: 11,
        scoreB: 9,
      });
    });

    it('should successfully submit result for ONEVONE_INVITE game', async () => {
      const mockSession = {
        id: sessionId,
        mode: 'ONEVONE_INVITE',
        status: 'LIVE',
        hostUserId: 1,
        participants: [
          { userId: 1, role: 'PLAYER' },
          { userId: 2, role: 'PLAYER' },
        ],
      };

      prisma.gameSession.findUnique.mockResolvedValue(mockSession as any);
      prisma.gameSession.update.mockResolvedValue({
        id: sessionId,
        status: 'FINISHED',
        scoreA: 11,
        scoreB: 9,
      } as any);

      const result = await service.submitResult(sessionId, userId, dto);

      expect(result.status).toBe('FINISHED');
    });

    it('should throw NotFoundException when session does not exist', async () => {
      prisma.gameSession.findUnique.mockResolvedValue(null);

      await expect(service.submitResult(sessionId, userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.submitResult(sessionId, userId, dto)).rejects.toThrow(
        'Session not found',
      );

      expect(prisma.gameSession.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user is SPECTATOR', async () => {
      const mockSession = {
        id: sessionId,
        status: 'LIVE',
        participants: [
          { userId: 1, role: 'SPECTATOR' },
          { userId: 2, role: 'PLAYER' },
        ],
      };

      prisma.gameSession.findUnique.mockResolvedValue(mockSession as any);

      await expect(service.submitResult(sessionId, userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.submitResult(sessionId, userId, dto)).rejects.toThrow(
        'Not allowed',
      );
    });

    it('should throw BadRequestException when session status is FINISHED', async () => {
      const mockSession = {
        id: sessionId,
        status: 'FINISHED',
        participants: [{ userId: 1, role: 'PLAYER' }],
      };

      prisma.gameSession.findUnique.mockResolvedValue(mockSession as any);

      await expect(service.submitResult(sessionId, userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.submitResult(sessionId, userId, dto)).rejects.toThrow(
        'Already finished',
      );
    });

    it('should throw BadRequestException when session status is CANCELED', async () => {
      const mockSession = {
        id: sessionId,
        status: 'CANCELED',
        participants: [{ userId: 1, role: 'PLAYER' }],
      };

      prisma.gameSession.findUnique.mockResolvedValue(mockSession as any);

      await expect(service.submitResult(sessionId, userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when user is not in participants list', async () => {
      const mockSession = {
        id: sessionId,
        status: 'LIVE',
        participants: [
          { userId: 2, role: 'PLAYER' },
          { userId: 3, role: 'PLAYER' },
        ],
      };

      prisma.gameSession.findUnique.mockResolvedValue(mockSession as any);

      await expect(service.submitResult(sessionId, userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle session in WAITING status', async () => {
      const mockSession = {
        id: sessionId,
        status: 'WAITING',
        participants: [{ userId: 1, role: 'PLAYER' }],
      };

      prisma.gameSession.findUnique.mockResolvedValue(mockSession as any);
      prisma.gameSession.update.mockResolvedValue({
        id: sessionId,
        status: 'FINISHED',
        scoreA: 11,
        scoreB: 9,
      } as any);

      const result = await service.submitResult(sessionId, userId, dto);

      expect(result.status).toBe('FINISHED');
    });

    it('should correctly set endedAt timestamp', async () => {
      const mockSession = {
        id: sessionId,
        status: 'LIVE',
        participants: [{ userId: 1, role: 'PLAYER' }],
      };

      prisma.gameSession.findUnique.mockResolvedValue(mockSession as any);
      prisma.gameSession.update.mockResolvedValue({} as any);

      await service.submitResult(sessionId, userId, dto);

      expect(prisma.gameSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            endedAt: mockDate,
          }),
        }),
      );
    });
  });

  describe('history', () => {
    const userId = 1;

    it('should return finished games with ONEVONE_QUEUE mode', async () => {
      const mockHistory = [
        {
          id: 'session-1',
          mode: 'ONEVONE_QUEUE',
          status: 'FINISHED',
          scoreA: 11,
          scoreB: 9,
          playerALevel: 5,
          playerBLevel: 3,
          hostUserId: 1,
          createdAt: new Date('2026-01-31T09:00:00.000Z'),
          startedAt: new Date('2026-01-31T09:01:00.000Z'),
          endedAt: new Date('2026-01-31T09:15:00.000Z'),
          participants: [
            { userId: 1, role: 'PLAYER' },
            { userId: 2, role: 'PLAYER' },
          ],
        },
      ];

      prisma.gameSession.findMany.mockResolvedValue(mockHistory as any);

      const result = await service.history(userId);

      expect(prisma.gameSession.findMany).toHaveBeenCalledWith({
        where: {
          status: 'FINISHED',
          participants: { some: { userId, role: 'PLAYER' } },
        },
        orderBy: { endedAt: 'desc' },
        take: 30,
        select: {
          id: true,
          mode: true,
          status: true,
          scoreA: true,
          scoreB: true,
          playerALevel: true,
          playerBLevel: true,
          startedAt: true,
          endedAt: true,
          participants: { select: { userId: true, role: true } },
        },
      });

      expect(result).toEqual(mockHistory);
      expect(result).toHaveLength(1);
    });

    it('should return finished games with ONEVONE_INVITE mode', async () => {
      const mockHistory = [
        {
          id: 'session-2',
          mode: 'ONEVONE_INVITE',
          status: 'FINISHED',
          scoreA: 8,
          scoreB: 11,
          playerALevel: 2,
          playerBLevel: 4,
          startedAt: new Date('2026-01-31T09:20:00.000Z'),
          endedAt: new Date('2026-01-31T09:30:00.000Z'),
          participants: [
            { userId: 1, role: 'PLAYER' },
            { userId: 3, role: 'PLAYER' },
          ],
        },
      ];

      prisma.gameSession.findMany.mockResolvedValue(mockHistory as any);

      const result = await service.history(userId);

      expect(result).toHaveLength(1);
      expect(result[0].mode).toBe('ONEVONE_INVITE');
    });

    it('should return empty array when user has no finished games', async () => {
      prisma.gameSession.findMany.mockResolvedValue([]);

      const result = await service.history(userId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should only return games where user was PLAYER, not SPECTATOR', async () => {
      prisma.gameSession.findMany.mockResolvedValue([]);

      await service.history(userId);

      expect(prisma.gameSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            participants: { some: { userId, role: 'PLAYER' } },
          }),
        }),
      );
    });

    it('should order results by endedAt descending (most recent first)', async () => {
      await service.history(userId);

      expect(prisma.gameSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { endedAt: 'desc' },
        }),
      );
    });

    it('should limit results to maximum 30 games', async () => {
      const mockHistory = Array(40)
        .fill(null)
        .map((_, i) => ({
          id: `session-${i}`,
          status: 'FINISHED',
          participants: [{ userId: 1, role: 'PLAYER' }],
        }));

      prisma.gameSession.findMany.mockResolvedValue(mockHistory.slice(0, 30) as any);

      const result = await service.history(userId);

      expect(prisma.gameSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 30 }),
      );
      expect(result.length).toBeLessThanOrEqual(30);
    });

    it('should not return WAITING status games', async () => {
      await service.history(userId);

      expect(prisma.gameSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'FINISHED',
          }),
        }),
      );
    });

    it('should not return LIVE status games', async () => {
      await service.history(userId);

      expect(prisma.gameSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'FINISHED',
          }),
        }),
      );
    });

    it('should not return CANCELED status games', async () => {
      await service.history(userId);

      expect(prisma.gameSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'FINISHED',
          }),
        }),
      );
    });

    it('should include participant details in response', async () => {
      const mockHistory = [
        {
          id: 'session-1',
          status: 'FINISHED',
          participants: [
            { userId: 1, role: 'PLAYER' },
            { userId: 2, role: 'PLAYER' },
          ],
        },
      ];

      prisma.gameSession.findMany.mockResolvedValue(mockHistory as any);

      const result = await service.history(userId);

      expect(result[0].participants).toBeDefined();
      expect(result[0].participants).toHaveLength(2);
    });
  });

  describe('getFriendActiveSession', () => {
    const myId = 1;
    const friendId = 2;

    it('should return friend active ONEVONE_QUEUE session when friends', async () => {
      const mockSession = {
        id: 'session-uuid-123',
        status: 'LIVE',
        mode: 'ONEVONE_QUEUE',
        createdAt: new Date('2026-01-31T09:50:00.000Z'),
      };

      permissions.areFriends.mockResolvedValue(true);
      prisma.gameSession.findFirst.mockResolvedValue(mockSession as any);

      const result = await service.getFriendActiveSession(myId, friendId);

      expect(permissions.areFriends).toHaveBeenCalledWith(myId, friendId);
      expect(prisma.gameSession.findFirst).toHaveBeenCalledWith({
        where: {
          status: { in: ['WAITING', 'LIVE'] },
          participants: {
            some: {
              role: 'PLAYER',
              userId: friendId,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true, mode: true },
      });

      expect(result).toEqual({
        sessionId: 'session-uuid-123',
        status: 'LIVE',
        mode: 'ONEVONE_QUEUE',
      });
    });

    it('should return friend active ONEVONE_INVITE session when friends', async () => {
      const mockSession = {
        id: 'session-uuid-456',
        status: 'WAITING',
        mode: 'ONEVONE_INVITE',
      };

      permissions.areFriends.mockResolvedValue(true);
      prisma.gameSession.findFirst.mockResolvedValue(mockSession as any);

      const result = await service.getFriendActiveSession(myId, friendId);

      expect(result).toEqual({
        sessionId: 'session-uuid-456',
        status: 'WAITING',
        mode: 'ONEVONE_INVITE',
      });
    });

    it('should throw ForbiddenException when users are not friends', async () => {
      permissions.areFriends.mockResolvedValue(false);

      await expect(service.getFriendActiveSession(myId, friendId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.getFriendActiveSession(myId, friendId)).rejects.toThrow(
        'Not friends',
      );

      expect(prisma.gameSession.findFirst).not.toHaveBeenCalled();
    });

    it('should return null values when friend has no active session', async () => {
      permissions.areFriends.mockResolvedValue(true);
      prisma.gameSession.findFirst.mockResolvedValue(null);

      const result = await service.getFriendActiveSession(myId, friendId);

      expect(result).toEqual({
        sessionId: null,
        status: null,
        mode: null,
      });
    });

    it('should return WAITING status session if friend is in queue', async () => {
      const mockSession = {
        id: 'session-789',
        status: 'WAITING',
        mode: 'ONEVONE_QUEUE',
      };

      permissions.areFriends.mockResolvedValue(true);
      prisma.gameSession.findFirst.mockResolvedValue(mockSession as any);

      const result = await service.getFriendActiveSession(myId, friendId);

      expect(result.status).toBe('WAITING');
    });

    it('should only return sessions where friend is PLAYER, not SPECTATOR', async () => {
      permissions.areFriends.mockResolvedValue(true);
      prisma.gameSession.findFirst.mockResolvedValue(null);

      await service.getFriendActiveSession(myId, friendId);

      expect(prisma.gameSession.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            participants: {
              some: {
                role: 'PLAYER',
                userId: friendId,
              },
            },
          }),
        }),
      );
    });

    it('should not return FINISHED sessions', async () => {
      permissions.areFriends.mockResolvedValue(true);
      prisma.gameSession.findFirst.mockResolvedValue(null);

      await service.getFriendActiveSession(myId, friendId);

      expect(prisma.gameSession.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ['WAITING', 'LIVE'] },
          }),
        }),
      );
    });

    it('should not return CANCELED sessions', async () => {
      permissions.areFriends.mockResolvedValue(true);
      await service.getFriendActiveSession(myId, friendId);

      const callArgs = prisma.gameSession.findFirst.mock.calls[0][0];
      expect(callArgs.where.status.in).not.toContain('CANCELED');
      expect(callArgs.where.status.in).not.toContain('FINISHED');
    });

    it('should return most recent session when multiple active sessions exist', async () => {
      permissions.areFriends.mockResolvedValue(true);
      prisma.gameSession.findFirst.mockResolvedValue({
        id: 'newest-session',
        status: 'LIVE',
        mode: 'ONEVONE_QUEUE',
      } as any);

      await service.getFriendActiveSession(myId, friendId);

      expect(prisma.gameSession.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should handle permission check failure gracefully', async () => {
      permissions.areFriends.mockRejectedValue(new Error('Service unavailable'));

      await expect(service.getFriendActiveSession(myId, friendId)).rejects.toThrow(
        'Service unavailable',
      );
    });
  });
});