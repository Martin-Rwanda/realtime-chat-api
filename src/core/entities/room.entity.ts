import { RoomType } from "src/shared/enum/room-type.enum";
import { MemberRole } from "src/shared/enum/member-role.enum";

export class Room {
  id: string;
  name: string | null;
  description: string | null;
  type: RoomType;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class RoomMember {
  id: string;
  roomId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
}