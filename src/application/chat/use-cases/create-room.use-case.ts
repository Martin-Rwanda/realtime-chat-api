import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IRoomRepository } from '../../../core/repositories/room.repository';
import { ROOM_REPOSITORY } from '../../../core/repositories/room.repository';
import { CreateRoomDto } from '../../../presentation/chat/dto/create-room.dto';
import { Room } from '../../../core/entities/room.entity';
import { RoomType } from 'src/shared/enum/room-type.enum';
import { MemberRole } from 'src/shared/enum/member-role.enum';

@Injectable()
export class CreateRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(userId: string, dto: CreateRoomDto): Promise<Room> {
    if (dto.type === RoomType.DM) {
      throw new BadRequestException('Use /rooms/dm to create direct messages');
    }

    const room = await this.roomRepository.create({
      name: dto.name,
      description: dto.description,
      type: dto.type,
      createdBy: userId,
    });

    // Creator automatically becomes owner
    await this.roomRepository.addMember(room.id, userId, MemberRole.OWNER);

    return room;
  }
}