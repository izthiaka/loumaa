import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/features/user/services/user/user.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findUserByToken: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let context: ExecutionContext;
    let request: any;

    beforeEach(() => {
      request = {
        headers: {
          authorization: 'Bearer token',
        },
      };
      context = {
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue(request),
      };
    });

    it('should return false if bearer token is missing', async () => {
      request.headers.authorization = undefined;

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false if user is not found', async () => {
      userService.findUserByToken.mockResolvedValue(undefined);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false if token verification fails', async () => {
      userService.findUserByToken.mockResolvedValue({});
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token verification failed');
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should set request.matricule and return true if token is valid and not expired', async () => {
      const decodedToken = { exp: 1234567890 };
      userService.findUserByToken.mockResolvedValue({});
      jwtService.verify.mockReturnValue(decodedToken);
      guard.isDateNotExpired = jest.fn().mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.matricule).toBe(decodedToken);
    });

    it('should return false if token is valid but expired', async () => {
      const decodedToken = { exp: 1234567890 };
      userService.findUserByToken.mockResolvedValue({});
      jwtService.verify.mockReturnValue(decodedToken);
      guard.isDateNotExpired = jest.fn().mockResolvedValue(false);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(request.matricule).toBeUndefined();
    });
  });

  describe('isDateNotExpired', () => {
    it('should return true if expiration date is in the future', async () => {
      const expirationDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour in the future

      const result = await guard.isDateNotExpired(expirationDate);

      expect(result).toBe(true);
    });

    it('should return false if expiration date is in the past', async () => {
      const expirationDate = Math.floor(Date.now() / 1000) - 3600; // 1 hour in the past

      const result = await guard.isDateNotExpired(expirationDate);

      expect(result).toBe(false);
    });
  });
});
