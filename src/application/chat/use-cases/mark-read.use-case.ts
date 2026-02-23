import { Injectable, Inject } from '@nestjs/common';
import type { IMessageRepository } from '../../../core/repositories/message.repository';
import { MESSAGE_REPOSITORY } from '../../../core/repositories/message.repository';
import { MessageRead } from '../../../core/entities/message.entity';

@Injectable()
export class MarkReadUseCase {
    constructor(
        @Inject(MESSAGE_REPOSITORY)
        private readonly messageRepository: IMessageRepository,
    ) {}

    async execute(userId: string, messageId: string): Promise<MessageRead> {
        const existing = await this.messageRepository.findRead(messageId, userId);
        if (existing) return existing;

        return this.messageRepository.markAsRead(messageId, userId);
    }
}