import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from '../../application/notifications/notification.service';
import { NotificationRepositoryImpl } from '../../infrastructure/database/typeorm/repositories/notification.repository.impl';
import { NotificationOrmEntity } from '../../infrastructure/database/typeorm/entities/notification.orm-entity';
import { NOTIFICATION_REPOSITORY } from '../../core/repositories/notification.repository';
import { WebsocketsModule } from '../../infrastructure/websockets/websockets.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationOrmEntity]),
    WebsocketsModule,
    AuthModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationRepositoryImpl,
    },
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}