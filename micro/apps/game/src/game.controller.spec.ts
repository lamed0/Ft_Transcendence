import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { InvitesService } from './invite/invite.service';
import { MatchmakingService } from './matchmaking/matchmaking.service';

describe('GameController', () => {
  let controller: GameController;
  let gameService: jest.Mocked<GameService>;
  let invitesService: jest.Mocked<InvitesService>;
  let matchmakingService: jest.Mocked<MatchmakingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        {
          provide: GameService,
          useValue: {
            submitResult: jest.fn(),
            history: jest.fn(),
            getFriendActiveSession: jest.fn(),
          },
        },
        {
          provide: InvitesService,
          useValue: {
            createInvite: jest.fn(),
            acceptInvite: jest.fn(),
            declineInvite: jest.fn(),
          },
        },
        {
          provide: MatchmakingService,
          useValue: {
            joinQueue: jest.fn(),
            leaveQueue: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GameController>(GameController);
    gameService = module.get(GameService) as jest.Mocked<GameService>;
    invitesService = module.get(InvitesService) as jest.Mocked<InvitesService>;
    matchmakingService = module.get(MatchmakingService) as jest.Mocked<MatchmakingService>;
  });

  describe('SubmitRes', () => {
    it('should submit game result', async () => {
      const req = { user: { id: 1 } };
      const result = { id: 'session-1', status: 'FINISHED', scoreA: 5, scoreB: 3 };

      gameService.submitResult.mockResolvedValueOnce(result as any);

      const response = await controller.SubmitRes(req, 'session-1', { scoreA: 5, scoreB: 3 });

      expect(gameService.submitResult).toHaveBeenCalledWith('session-1', 1, { scoreA: 5, scoreB: 3 });
      expect(response).toEqual(result);
    });
  });

  describe('getHistory', () => {
    it('should return user game history', async () => {
      const req = { user: { id: 1 } };
      const history = [{ id: 'session-1', status: 'FINISHED' }];

      gameService.history.mockResolvedValueOnce(history as any);

      const response = await controller.getHistory(req);

      expect(gameService.history).toHaveBeenCalledWith(1);
      expect(response).toEqual(history);
    });
  });

  describe('createInvite', () => {
    it('should create game invite', async () => {
      const req = { user: { id: 1 } };
      const invite = { id: 'invite-1', fromUserId: 1, toUserId: 2, status: 'PENDING' };

      invitesService.createInvite.mockResolvedValueOnce(invite as any);

      const response = await controller.createInvite(req, { toUserId: 2 });

      expect(invitesService.createInvite).toHaveBeenCalledWith(1, 2);
      expect(response).toEqual(invite);
    });
  });

  describe('acceptInvite', () => {
    it('should accept game invite', async () => {
      const req = { user: { id: 1 } };
      const accepted = { id: 'invite-1', status: 'ACCEPTED' };

      invitesService.acceptInvite.mockResolvedValueOnce(accepted as any);

      const response = await controller.acceptInvite(req, 'invite-1');

      expect(invitesService.acceptInvite).toHaveBeenCalledWith('invite-1', 1);
      expect(response).toEqual(accepted);
    });
  });

  describe('declineInvite', () => {
    it('should decline game invite', async () => {
      const req = { user: { id: 1 } };
      const declined = { id: 'invite-1', status: 'DECLINED' };

      invitesService.declineInvite.mockResolvedValueOnce(declined as any);

      const response = await controller.declineInvite(req, 'invite-1');

      expect(invitesService.declineInvite).toHaveBeenCalledWith('invite-1', 1);
      expect(response).toEqual(declined);
    });
  });

  describe('joinQueue', () => {
    it('should join matchmaking queue', async () => {
      const req = { user: { id: 1 } };
      const ticket = { id: 'ticket-1', userId: 1, status: 'SEARCHING' };

      matchmakingService.joinQueue.mockResolvedValueOnce(ticket as any);

      const response = await controller.joinQueue(req);

      expect(matchmakingService.joinQueue).toHaveBeenCalledWith(1);
      expect(response).toEqual(ticket);
    });
  });

  describe('leaveQueue', () => {
    it('should leave matchmaking queue', async () => {
      const req = { user: { id: 1 } };

      matchmakingService.leaveQueue.mockResolvedValueOnce({} as any);

      await controller.leaveQueue(req);

      expect(matchmakingService.leaveQueue).toHaveBeenCalledWith(1);
    });
  });

  describe('getFriendMAtch', () => {
    it('should get friend active session', async () => {
      const req = { user: { id: 1 } };
      const activeSession = {
        sessionId: 'session-1',
        status: 'LIVE',
        mode: 'ONEVONE_QUEUE',
      };

      gameService.getFriendActiveSession.mockResolvedValueOnce(activeSession as any);

      const response = await controller.getFriendMAtch(req, '2');

      expect(gameService.getFriendActiveSession).toHaveBeenCalledWith(1, 2);
      expect(response).toEqual(activeSession);
    });
  });
});
