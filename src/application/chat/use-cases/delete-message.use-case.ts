import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IMessageRepository } from '../../../core/repositories/message.repository';
import { MESSAGE_REPOSITORY } from '../../../core/repositories/message.repository';
import type { IRoomRepository } from '../../../core/repositories/room.repository';
import { ROOM_REPOSITORY } from '../../../core/repositories/room.repository';
import { MemberRole } from 'src/shared/enum/member-role.enum';

@Injectable()
export class DeleteMessageUseCase {
    constructor(
        @Inject(MESSAGE_REPOSITORY)
        private readonly messageRepository: IMessageRepository,
        @Inject(ROOM_REPOSITORY)
        private readonly roomRepository: IRoomRepository,
    ) {}

    async execute(userId: string, messageId: string): Promise<{ roomId: string }> {
        const message = await this.messageRepository.findById(messageId);
        if (!message) throw new NotFoundException('Message not found');

        const member = await this.roomRepository.findMember(message.roomId, userId);
        const isOwnerOrAdmin =
            member?.role === MemberRole.OWNER || member?.role === MemberRole.ADMIN;

        if (message.senderId !== userId && !isOwnerOrAdmin) {
            throw new ForbiddenException('You cannot delete this message');
        }

        await this.messageRepository.update(messageId, { isDeleted: true });

        return { roomId: message.roomId };
    }
}