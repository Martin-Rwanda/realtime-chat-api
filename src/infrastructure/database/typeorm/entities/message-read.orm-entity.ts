import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MessageOrmEntity } from './message.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity('message_reads')
export class MessageReadOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'message_id' })
  messageId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => MessageOrmEntity, (message) => message.reads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: MessageOrmEntity;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @CreateDateColumn({ name: 'read_at' })
  readAt: Date;
}