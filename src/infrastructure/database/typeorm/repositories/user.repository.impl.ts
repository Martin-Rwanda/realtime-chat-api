import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { IUserRepository } from '../../../../core/repositories/user.repository';
import { User } from '../../../../core/entities/user.entity';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { username } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(user: Partial<User>): Promise<User> {
    const entity = this.repo.create(user);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    await this.repo.update(id, user);
    const updated = await this.repo.findOne({ where: { id } });
    return this.toDomain(updated!);
  }

  private toDomain(entity: UserOrmEntity): User {
    const user = new User();
    user.id = entity.id;
    user.email = entity.email;
    user.username = entity.username;
    user.passwordHash = entity.passwordHash;
    user.avatarUrl = entity.avatarUrl;
    user.avatarPublicId = entity.avatarPublicId;
    user.status = entity.status;
    user.createdAt = entity.createdAt;
    user.updatedAt = entity.updatedAt;
    return user;
  }
}