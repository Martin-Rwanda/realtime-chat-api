import { Injectable, Inject } from '@nestjs/common';
import type { INotificationRepository } from 'src/core/repositories/notification.repository';
import {
  ICreateNotificationInput,
  NOTIFICATION_REPOSITORY,
} from 'src/core/repositories/notification.repository';
import { ChatGateway } from '../../infrastructure/websockets/chat.gateway';
import { Notification } from '../../core/entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    private readonly chatGateway: ChatGateway,
  ) {}

  async create(input: ICreateNotificationInput): Promise<Notification> {
    const notification = await this.notificationRepository.create(input);

    // Deliver in real-time via WebSocket
    this.chatGateway.emitNotification(notification.userId, notification);

    return notification;
  }

  async getForUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUser(userId);
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return this.notificationRepository.markAllAsRead(userId);
  }
}