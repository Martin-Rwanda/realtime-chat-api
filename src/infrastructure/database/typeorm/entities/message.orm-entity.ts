import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { MessageType } from 'src/shared/enum/message-type.enum';
import { UserOrmEntity } from './user.orm-entity';
import { RoomOrmEntity } from './room.orm-entity';
import { MessageReadOrmEntity } from './message-read.orm-entity';

@Entity('messages')
export class MessageOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'room_id' })
  roomId: string;

  @Column({ name: 'sender_id' })
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @ManyToOne(() => RoomOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: RoomOrmEntity;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: UserOrmEntity;

  @OneToMany(() => MessageReadOrmEntity, (read) => read.message)
  reads: MessageReadOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}