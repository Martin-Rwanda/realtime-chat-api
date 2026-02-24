import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoginUseCase } from './login.use-case';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository';
import { RefreshTokenOrmEntity } from '../../../infrastructure/database/typeorm/entities/refresh-token.orm-entity';
import { UserStatus } from '../../../core/entities/user.entity';
import * as bcrypt from 'bcrypt';

const mockUserRepository = {
  findByEmail: jest.fn(),
};

const mockRefreshTokenRepo = {
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-access-token'),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('mock-secret'),
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: getRepositoryToken(RefreshTokenOrmEntity),
          useValue: mockRefreshTokenRepo,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    jest.clearAllMocks();
  });

  it('should login successfully with correct credentials', async () => {
    const passwordHash = await bcrypt.hash('StrongPass123!', 12);

    mockUserRepository.findByEmail.mockResolvedValue({
      id: 'uuid-1',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash,
      avatarUrl: null,
      status: UserStatus.OFFLINE,
    });

    mockRefreshTokenRepo.save.mockResolvedValue({});
    mockJwtService.sign.mockReturnValue('mock-access-token');

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'StrongPass123!',
    });

    expect(result.accessToken).toBe('mock-access-token');
    expect(result.user.email).toBe('test@example.com');
  });

  it('should throw UnauthorizedException if user not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'wrong@example.com',
        password: 'StrongPass123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is wrong', async () => {
    const passwordHash = await bcrypt.hash('StrongPass123!', 12);
    mockUserRepository.findByEmail.mockResolvedValue({
      id: 'uuid-1',
      email: 'test@example.com',
      passwordHash,
    });

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});