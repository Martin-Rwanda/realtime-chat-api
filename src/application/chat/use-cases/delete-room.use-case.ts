import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IRoomRepository } from '../../../core/repositories/room.repository';
import { ROOM_REPOSITORY } from '../../../core/repositories/room.repository';
import { MemberRole } from 'src/shared/enum/member-role.enum';

@Injectable()
export class DeleteRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(userId: string, roomId: string): Promise<void> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) throw new NotFoundException('Room not found');

    const member = await this.roomRepository.findMember(roomId, userId);
    if (!member) throw new ForbiddenException('You are not a member of this room');

    if (member.role !== MemberRole.OWNER) {
      throw new ForbiddenException('Only the owner can delete a room');
    }

    await this.roomRepository.deleteRoom(roomId);
  }
}