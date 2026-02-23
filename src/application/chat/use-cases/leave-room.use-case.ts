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
export class LeaveRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(userId: string, roomId: string): Promise<void> {
    const member = await this.roomRepository.findMember(roomId, userId);
    if (!member) throw new NotFoundException('You are not a member of this room');

    const allMembers = await this.roomRepository.findMembers(roomId);

    // If last member → delete the room entirely
    if (allMembers.length === 1) {
      await this.roomRepository.deleteRoom(roomId);
      return;
    }

    // If owner is leaving → promote someone else first
    if (member.role === MemberRole.OWNER) {
      const remaining = allMembers.filter((m) => m.userId !== userId);

      // Prefer promoting an admin, otherwise promote longest-standing member
      const nextOwner =
        remaining.find((m) => m.role === MemberRole.ADMIN) ?? remaining[0];

      await this.roomRepository.updateMemberRole(
        roomId,
        nextOwner.userId,
        MemberRole.OWNER,
      );
    }

    await this.roomRepository.removeMember(roomId, userId);
  }
}