import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MemberRole } from 'src/shared/enum/member-role.enum';
import { RoomOrmEntity } from './room.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity('room_members')
export class RoomMemberOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'room_id' })
  roomId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => RoomOrmEntity, (room) => room.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: RoomOrmEntity;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER,
  })
  role: MemberRole;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}