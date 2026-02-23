import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IMessageRepository } from '../../../core/repositories/message.repository';
import { MESSAGE_REPOSITORY } from '../../../core/repositories/message.repository';
import { EditMessageDto } from '../../../presentation/chat/dto/edit-message.dto';
import { Message } from '../../../core/entities/message.entity';

@Injectable()
export class EditMessageUseCase {
    constructor(
        @Inject(MESSAGE_REPOSITORY)
        private readonly messageRepository: IMessageRepository,
    ) {}

    async execute(userId: string, messageId: string, dto: EditMessageDto): Promise<Message> {
        const message = await this.messageRepository.findById(messageId);
        if (!message) throw new NotFoundException('Message not found');
        if (message.senderId !== userId) {
        throw new ForbiddenException('You can only edit your own messages');
        }
        if (message.isDeleted) {
        throw new ForbiddenException('Cannot edit a deleted message');
        }

        return this.messageRepository.update(messageId, {
        content: dto.content,
        isEdited: true,
        });
    }
}