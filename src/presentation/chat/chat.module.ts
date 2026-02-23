import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsController } from './rooms.controller';
import { RoomOrmEntity } from '../../infrastructure/database/typeorm/entities/room.orm-entity';
import { RoomMemberOrmEntity } from '../../infrastructure/database/typeorm/entities/room-member.orm-entity';
import { UserOrmEntity } from '../../infrastructure/database/typeorm/entities/user.orm-entity';
import { RoomRepositoryImpl } from '../../infrastructure/database/typeorm/repositories/room.repository.impl';
import { UserRepositoryImpl } from '../../infrastructure/database/typeorm/repositories/user.repository.impl';
import { CreateRoomUseCase } from '../../application/chat/use-cases/create-room.use-case';
import { JoinRoomUseCase } from '../../application/chat/use-cases/join-room.use-case';
import { LeaveRoomUseCase } from '../../application/chat/use-cases/leave-room.use-case';
import { CreateDmUseCase } from '../../application/chat/use-cases/create-dm.use-case';
import { DeleteRoomUseCase } from '../../application/chat/use-cases/delete-room.use-case';
import { ROOM_REPOSITORY } from '../../core/repositories/room.repository';
import { USER_REPOSITORY } from '../../core/repositories/user.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomOrmEntity, RoomMemberOrmEntity, UserOrmEntity]),
    AuthModule,
  ],
  controllers: [RoomsController],
  providers: [
    CreateRoomUseCase,
    JoinRoomUseCase,
    LeaveRoomUseCase,
    CreateDmUseCase,
    DeleteRoomUseCase,
    { provide: ROOM_REPOSITORY, useClass: RoomRepositoryImpl },
    { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
  ],
  exports: [ROOM_REPOSITORY],
})
export class ChatModule {}