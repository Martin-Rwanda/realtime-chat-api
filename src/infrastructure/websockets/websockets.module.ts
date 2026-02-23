import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { UserOrmEntity } from '../database/typeorm/entities/user.orm-entity';
import { RoomMemberOrmEntity } from '../database/typeorm/entities/room-member.orm-entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserOrmEntity, RoomMemberOrmEntity]),
  ],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class WebsocketsModule {}