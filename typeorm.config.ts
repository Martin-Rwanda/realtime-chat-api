import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserOrmEntity } from './src/infrastructure/database/typeorm/entities/user.orm-entity';
import { RefreshTokenOrmEntity } from './src/infrastructure/database/typeorm/entities/refresh-token.orm-entity';
import { RoomOrmEntity } from './src/infrastructure/database/typeorm/entities/room.orm-entity';
import { RoomMemberOrmEntity } from './src/infrastructure/database/typeorm/entities/room-member.orm-entity';
import { MessageOrmEntity } from './src/infrastructure/database/typeorm/entities/message.orm-entity';
import { MessageReadOrmEntity } from './src/infrastructure/database/typeorm/entities/message-read.orm-entity';
import { NotificationOrmEntity } from './src/infrastructure/database/typeorm/entities/notification.orm-entity';


config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'postgres',
  entities: [UserOrmEntity, RefreshTokenOrmEntity, RoomOrmEntity, RoomMemberOrmEntity, MessageOrmEntity, MessageReadOrmEntity, NotificationOrmEntity],
  migrations: [
  process.env.NODE_ENV === 'production'
    ? 'dist/src/infrastructure/database/typeorm/migrations/**/*.js'
    : 'src/infrastructure/database/typeorm/migrations/**/*.ts'
],
  synchronize: false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});