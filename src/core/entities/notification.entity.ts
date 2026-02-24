import { NotificationType } from "src/shared/enum/notification-type.enum";

export class Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
}