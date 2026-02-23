import {
  Injectable,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import type { IMessageRepository } from '../../../core/repositories/message.repository';
import { MESSAGE_REPOSITORY } from '../../../core/repositories/message.repository';
import type { IRoomRepository } from '../../../core/repositories/room.repository';
import { ROOM_REPOSITORY } from '../../../core/repositories/room.repository';
import { GetMessagesDto } from '../../../presentation/chat/dto/get-messages.dto';
import { Message } from '../../../core/entities/message.entity';

@Injectable()
export class GetMessagesUseCase {
    constructor(
        @Inject(MESSAGE_REPOSITORY)
        private readonly messageRepository: IMessageRepository,
        @Inject(ROOM_REPOSITORY)
        private readonly roomRepository: IRoomRepository,
    ) {}

    async execute(userId: string, dto: GetMessagesDto): Promise<Message[]> {
        // Verify user is a member
        const member = await this.roomRepository.findMember(dto.roomId, userId);
        if (!member) {
        throw new ForbiddenException('You are not a member of this room');
        }

        return this.messageRepository.findByRoom({
        roomId: dto.roomId,
        limit: dto.limit ?? 20,
        cursor: dto.cursor,
        });
    }
}