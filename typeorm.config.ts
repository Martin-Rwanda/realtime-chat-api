import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserOrmEntity } from './src/infrastructure/database/typeorm/entities/user.orm-entity';
import { RefreshTokenOrmEntity } from './src/infrastructure/database/typeorm/entities/refresh-token.orm-entity';
import { RoomOrmEntity } from './src/infrastructure/database/typeorm/entities/room.orm-entity';
import { RoomMemberOrmEntity } from './src/infrastructure/database/typeorm/entities/room-member.orm-entity';


config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'postgres',
  entities: [UserOrmEntity, RefreshTokenOrmEntity, RoomOrmEntity, RoomMemberOrmEntity],
  migrations: ['src/infrastructure/database/typeorm/migrations/**/*.ts'],
  synchronize: false,
});