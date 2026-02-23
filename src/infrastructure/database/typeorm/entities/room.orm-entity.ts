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
import { RoomType } from 'src/shared/enum/room-type.enum';
import { UserOrmEntity } from './user.orm-entity';
import { RoomMemberOrmEntity } from './room-member.orm-entity';

@Entity('rooms')
export class RoomOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.PUBLIC,
  })
  type: RoomType;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'created_by' })
  creator: UserOrmEntity;

  @OneToMany(() => RoomMemberOrmEntity, (member) => member.room)
  members: RoomMemberOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}