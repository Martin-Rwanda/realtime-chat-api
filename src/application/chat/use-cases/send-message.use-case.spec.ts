import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { SendMessageUseCase } from './send-message.use-case';
import { MESSAGE_REPOSITORY } from '../../../core/repositories/message.repository';
import { ROOM_REPOSITORY } from '../../../core/repositories/room.repository';
import { MessageType } from 'src/shared/enum/message-type.enum';
import { MemberRole } from 'src/shared/enum/member-role.enum';

const mockMessageRepository = {
  create: jest.fn(),
};

const mockRoomRepository = {
  findMember: jest.fn(),
};

describe('SendMessageUseCase', () => {
  let useCase: SendMessageUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendMessageUseCase,
        { provide: MESSAGE_REPOSITORY, useValue: mockMessageRepository },
        { provide: ROOM_REPOSITORY, useValue: mockRoomRepository },
      ],
    }).compile();

    useCase = module.get<SendMessageUseCase>(SendMessageUseCase);
    jest.clearAllMocks();
  });

  it('should send a message successfully', async () => {
    mockRoomRepository.findMember.mockResolvedValue({
      id: 'member-1',
      userId: 'user-1',
      roomId: 'room-1',
      role: MemberRole.MEMBER,
    });

    const mockMessage = {
      id: 'msg-1',
      roomId: 'room-1',
      senderId: 'user-1',
      content: 'Hello!',
      type: MessageType.TEXT,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockMessageRepository.create.mockResolvedValue(mockMessage);

    const result = await useCase.execute('user-1', {
      roomId: 'room-1',
      content: 'Hello!',
      type: MessageType.TEXT,
    });

    expect(result.content).toBe('Hello!');
    expect(result.senderId).toBe('user-1');
    expect(mockMessageRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should throw ForbiddenException if user is not a room member', async () => {
    mockRoomRepository.findMember.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', {
        roomId: 'room-1',
        content: 'Hello!',
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(mockMessageRepository.create).not.toHaveBeenCalled();
  });
});