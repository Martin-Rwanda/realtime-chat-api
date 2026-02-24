import { Notification } from '../entities/notification.entity';
import { NotificationType } from 'src/shared/enum/notification-type.enum';

export interface ICreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface INotificationRepository {
  create(input: ICreateNotificationInput): Promise<Notification>;
  findByUser(userId: string): Promise<Notification[]>;
  findById(id: string): Promise<Notification | null>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;
}

export const NOTIFICATION_REPOSITORY = 'NOTIFICATION_REPOSITORY';