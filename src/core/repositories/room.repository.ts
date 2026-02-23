import { Room, RoomMember } from '../entities/room.entity';
import { RoomType } from 'src/shared/enum/room-type.enum';
import { MemberRole } from 'src/shared/enum/member-role.enum';

export interface ICreateRoomInput {
  name?: string;
  description?: string;
  type: RoomType;
  createdBy: string;
}

export interface IRoomRepository {
  findById(id: string): Promise<Room | null>;
  findPublicRooms(): Promise<Room[]>;
  findDmRoom(userId1: string, userId2: string): Promise<Room | null>;
  create(input: ICreateRoomInput): Promise<Room>;
  addMember(roomId: string, userId: string, role: MemberRole): Promise<RoomMember>;
  removeMember(roomId: string, userId: string): Promise<void>;
  findMember(roomId: string, userId: string): Promise<RoomMember | null>;
  findMembers(roomId: string): Promise<RoomMember[]>;
  updateMemberRole(roomId: string, userId: string, role: MemberRole): Promise<void>; 
  deleteRoom(roomId: string): Promise<void>;                                         
}

export const ROOM_REPOSITORY = 'ROOM_REPOSITORY';