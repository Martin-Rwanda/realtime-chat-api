import {
  Injectable,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import type { IMessageRepository } from '../../../core/repositories/message.repository';
import { MESSAGE_REPOSITORY } from '../../../core/repositories/message.repository';
import type { IRoomRepository } from '../../../core/repositories/room.repository';
import { ROOM_REPOSITORY } from '../../../core/repositories/room.repository';
import { SendMessageDto } from '../../../presentation/chat/dto/send-message.dto';
import { Message } from '../../../core/entities/message.entity';
import { MessageType } from 'src/shared/enum/message-type.enum';

@Injectable()
export class SendMessageUseCase {
    constructor(
        @Inject(MESSAGE_REPOSITORY)
        private readonly messageRepository: IMessageRepository,
        @Inject(ROOM_REPOSITORY)
        private readonly roomRepository: IRoomRepository,
    ) {}

    async execute(senderId: string, dto: SendMessageDto): Promise<Message> {
        // Verify sender is a member of the room
        const member = await this.roomRepository.findMember(dto.roomId, senderId);
        if (!member) {
        throw new ForbiddenException('You are not a member of this room');
        }

        return this.messageRepository.create({
        roomId: dto.roomId,
        senderId,
        content: dto.content,
        type: dto.type ?? MessageType.TEXT,
        });
    }
}