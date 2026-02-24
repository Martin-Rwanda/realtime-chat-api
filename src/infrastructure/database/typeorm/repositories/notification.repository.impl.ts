import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationOrmEntity } from '../entities/notification.orm-entity';
import {
  INotificationRepository,
  ICreateNotificationInput,
} from '../../../../core/repositories/notification.repository';
import { Notification } from '../../../../core/entities/notification.entity';

@Injectable()
export class NotificationRepositoryImpl implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly repo: Repository<NotificationOrmEntity>,
  ) {}

  async create(input: ICreateNotificationInput): Promise<Notification> {
    const entity = this.repo.create({
      ...input,
      metadata: input.metadata ?? {},
    });
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findByUser(userId: string): Promise<Notification[]> {
    const entities = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(id: string): Promise<Notification | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async markAsRead(id: string): Promise<Notification> {
    await this.repo.update(id, { isRead: true });
    const updated = await this.repo.findOne({ where: { id } });
    return this.toDomain(updated!);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
  }

  private toDomain = (entity: NotificationOrmEntity): Notification => {
    const notification = new Notification();
    notification.id = entity.id;
    notification.userId = entity.userId;
    notification.type = entity.type;
    notification.title = entity.title;
    notification.body = entity.body;
    notification.isRead = entity.isRead;
    notification.metadata = entity.metadata;
    notification.createdAt = entity.createdAt;
    return notification;
  };
}