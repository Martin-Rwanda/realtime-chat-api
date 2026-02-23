import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsController } from './rooms.controller';
import { MessagesController } from './messages.controller';
import { RoomOrmEntity } from '../../infrastructure/database/typeorm/entities/room.orm-entity';
import { RoomMemberOrmEntity } from '../../infrastructure/database/typeorm/entities/room-member.orm-entity';
import { UserOrmEntity } from '../../infrastructure/database/typeorm/entities/user.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/database/typeorm/entities/message.orm-entity';
import { MessageReadOrmEntity } from '../../infrastructure/database/typeorm/entities/message-read.orm-entity';
import { RoomRepositoryImpl } from '../../infrastructure/database/typeorm/repositories/room.repository.impl';
import { UserRepositoryImpl } from '../../infrastructure/database/typeorm/repositories/user.repository.impl';
import { MessageRepositoryImpl } from '../../infrastructure/database/typeorm/repositories/message.repository.impl';
import { CreateRoomUseCase } from '../../application/chat/use-cases/create-room.use-case';
import { JoinRoomUseCase } from '../../application/chat/use-cases/join-room.use-case';
import { LeaveRoomUseCase } from '../../application/chat/use-cases/leave-room.use-case';
import { DeleteRoomUseCase } from '../../application/chat/use-cases/delete-room.use-case';
import { CreateDmUseCase } from '../../application/chat/use-cases/create-dm.use-case';
import { SendMessageUseCase } from '../../application/chat/use-cases/send-message.use-case';
import { GetMessagesUseCase } from '../../application/chat/use-cases/get-messages.use-case';
import { EditMessageUseCase } from '../../application/chat/use-cases/edit-message.use-case';
import { DeleteMessageUseCase } from '../../application/chat/use-cases/delete-message.use-case';
import { MarkReadUseCase } from '../../application/chat/use-cases/mark-read.use-case';
import { ROOM_REPOSITORY } from '../../core/repositories/room.repository';
import { USER_REPOSITORY } from '../../core/repositories/user.repository';
import { MESSAGE_REPOSITORY } from '../../core/repositories/message.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
        RoomOrmEntity,
        RoomMemberOrmEntity,
        UserOrmEntity,
        MessageOrmEntity,
        MessageReadOrmEntity,
        ]),
        AuthModule,
    ],
    controllers: [RoomsController, MessagesController],
    providers: [
        CreateRoomUseCase,
        JoinRoomUseCase,
        LeaveRoomUseCase,
        DeleteRoomUseCase,
        CreateDmUseCase,
        SendMessageUseCase,
        GetMessagesUseCase,
        EditMessageUseCase,
        DeleteMessageUseCase,
        MarkReadUseCase,
        { provide: ROOM_REPOSITORY, useClass: RoomRepositoryImpl },
        { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
        { provide: MESSAGE_REPOSITORY, useClass: MessageRepositoryImpl },
    ],
    exports: [ROOM_REPOSITORY, MESSAGE_REPOSITORY],
})
export class ChatModule {}