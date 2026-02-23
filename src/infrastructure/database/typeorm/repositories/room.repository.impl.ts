import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomOrmEntity } from '../entities/room.orm-entity';
import { RoomMemberOrmEntity } from '../entities/room-member.orm-entity';
import { IRoomRepository, ICreateRoomInput } from '../../../../core/repositories/room.repository';
import { Room, RoomMember } from '../../../../core/entities/room.entity';
import { RoomType } from 'src/shared/enum/room-type.enum';
import { MemberRole } from 'src/shared/enum/member-role.enum';

@Injectable()
export class RoomRepositoryImpl implements IRoomRepository {
    constructor(
        @InjectRepository(RoomOrmEntity)
        private readonly roomRepo: Repository<RoomOrmEntity>,
        @InjectRepository(RoomMemberOrmEntity)
        private readonly memberRepo: Repository<RoomMemberOrmEntity>,
    ) {}

    async findById(id: string): Promise<Room | null> {
        const entity = await this.roomRepo.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }

    async findPublicRooms(): Promise<Room[]> {
        const entities = await this.roomRepo.find({
        where: { type: RoomType.PUBLIC },
        order: { createdAt: 'DESC' },
        });
        return entities.map(this.toDomain);
    }

    async findDmRoom(userId1: string, userId2: string): Promise<Room | null> {
        const entity = await this.roomRepo
        .createQueryBuilder('room')
        .innerJoin('room.members', 'm1', 'm1.user_id = :userId1', { userId1 })
        .innerJoin('room.members', 'm2', 'm2.user_id = :userId2', { userId2 })
        .where('room.type = :type', { type: RoomType.DM })
        .getOne();
        return entity ? this.toDomain(entity) : null;
    }

    async create(input: ICreateRoomInput): Promise<Room> {
        const entity = this.roomRepo.create(input);
        const saved = await this.roomRepo.save(entity);
        return this.toDomain(saved);
    }

    async addMember(roomId: string, userId: string, role: MemberRole): Promise<RoomMember> {
        const entity = this.memberRepo.create({ roomId, userId, role });
        const saved = await this.memberRepo.save(entity);
        return this.toDomainMember(saved);
    }

    async removeMember(roomId: string, userId: string): Promise<void> {
        await this.memberRepo.delete({ roomId, userId });
    }

    async findMember(roomId: string, userId: string): Promise<RoomMember | null> {
        const entity = await this.memberRepo.findOne({ where: { roomId, userId } });
        return entity ? this.toDomainMember(entity) : null;
    }

    async findMembers(roomId: string): Promise<RoomMember[]> {
        const entities = await this.memberRepo.find({
        where: { roomId },
        order: { joinedAt: 'ASC' },
        });
        return entities.map(this.toDomainMember);
    }

    async updateMemberRole(roomId: string, userId: string, role: MemberRole): Promise<void> {
        await this.memberRepo.update({ roomId, userId }, { role });
    }

    async deleteRoom(roomId: string): Promise<void> {
        await this.roomRepo.delete(roomId);
    }

    private toDomain(entity: RoomOrmEntity): Room {
        const room = new Room();
        room.id = entity.id;
        room.name = entity.name;
        room.description = entity.description;
        room.type = entity.type;
        room.createdBy = entity.createdBy;
        room.createdAt = entity.createdAt;
        room.updatedAt = entity.updatedAt;
        return room;
    }

    private toDomainMember(entity: RoomMemberOrmEntity): RoomMember {
        const member = new RoomMember();
        member.id = entity.id;
        member.roomId = entity.roomId;
        member.userId = entity.userId;
        member.role = entity.role;
        member.joinedAt = entity.joinedAt;
        return member;
    }
}