import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from './register.use-case';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository';
import { User, } from '../../../core/entities/user.entity';
import { UserStatus } from '../../../core/entities/user.entity';

const mockUserRepository = {
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
};

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findByUsername.mockResolvedValue(null);

    const mockUser: User = {
      id: 'uuid-1',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashed',
      avatarUrl: null,
      avatarPublicId: null,
      status: UserStatus.OFFLINE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUserRepository.create.mockResolvedValue(mockUser);

    const result = await useCase.execute({
      email: 'test@example.com',
      username: 'testuser',
      password: 'StrongPass123!',
    });

    expect(result).toBeDefined();
    expect(result.email).toBe('test@example.com');
    expect(result.username).toBe('testuser');
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should throw ConflictException if email already exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing-id' });

    await expect(
      useCase.execute({
        email: 'test@example.com',
        username: 'testuser',
        password: 'StrongPass123!',
      }),
    ).rejects.toThrow(ConflictException);

    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should throw ConflictException if username already taken', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findByUsername.mockResolvedValue({ id: 'existing-id' });

    await expect(
      useCase.execute({
        email: 'test@example.com',
        username: 'testuser',
        password: 'StrongPass123!',
      }),
    ).rejects.toThrow(ConflictException);

    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});