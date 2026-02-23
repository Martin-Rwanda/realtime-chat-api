import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatus } from 'src/shared/enum/user-status.enum';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;
  
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'avatar_public_id', type: 'varchar', nullable: true })
  avatarPublicId: string | null;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.OFFLINE,
  })
  status: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}