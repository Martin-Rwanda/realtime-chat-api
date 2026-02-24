import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './presentation/auth/auth.module';
import { UsersModule } from './presentation/users/users.module';
import { ChatModule } from './presentation/chat/chat.module';
import configuration from './shared/config/configuration';
import { WebsocketsModule } from './infrastructure/websockets/websockets.module';
import { NotificationsModule } from './presentation/notifications/notifications.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { BullQueuesModule } from './infrastructure/bull/bull.module';
import { JobsModule } from './application/job/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule,
    BullQueuesModule,
    AuthModule,
    UsersModule,
    ChatModule,
    WebsocketsModule,
    NotificationsModule,
    JobsModule
  ],
})
export class AppModule {}