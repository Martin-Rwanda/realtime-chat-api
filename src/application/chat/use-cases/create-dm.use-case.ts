import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { IRoomRepository } from '../../../core/repositories/room.repository';
import { ROOM_REPOSITORY } from '../../../core/repositories/room.repository';
import type { IUserRepository } from '../../../core/repositories/user.repository';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository';
import { Room } from '../../../core/entities/room.entity';
import { RoomType } from 'src/shared/enum/room-type.enum';
import { MemberRole } from 'src/shared/enum/member-role.enum';

@Injectable()
export class CreateDmUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, targetUserId: string): Promise<Room> {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot create DM with yourself');
    }

    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) throw new NotFoundException('Target user not found');

    // Check if DM already exists
    const existing = await this.roomRepository.findDmRoom(userId, targetUserId);
    if (existing) return existing;

    // Create DM room
    const room = await this.roomRepository.create({
      type: RoomType.DM,
      createdBy: userId,
    });

    // Add both users
    await this.roomRepository.addMember(room.id, userId, MemberRole.MEMBER);
    await this.roomRepository.addMember(room.id, targetUserId, MemberRole.MEMBER);

    return room;
  }
}