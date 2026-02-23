import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import type { IRoomRepository } from '../../../core/repositories/room.repository';
import { ROOM_REPOSITORY } from '../../../core/repositories/room.repository';
import { RoomMember } from '../../../core/entities/room.entity';
import { RoomType } from 'src/shared/enum/room-type.enum';
import { MemberRole } from 'src/shared/enum/member-role.enum';

@Injectable()
export class JoinRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(userId: string, roomId: string): Promise<RoomMember> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) throw new NotFoundException('Room not found');

    if (room.type === RoomType.PRIVATE || room.type === RoomType.DM) {
      throw new ForbiddenException('Cannot join private or DM rooms directly');
    }

    const existing = await this.roomRepository.findMember(roomId, userId);
    if (existing) throw new ConflictException('Already a member of this room');

    return this.roomRepository.addMember(roomId, userId, MemberRole.MEMBER);
  }
}