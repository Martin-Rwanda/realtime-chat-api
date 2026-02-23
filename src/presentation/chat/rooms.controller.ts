import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { CreateRoomUseCase } from '../../application/chat/use-cases/create-room.use-case';
import { JoinRoomUseCase } from '../../application/chat/use-cases/join-room.use-case';
import { LeaveRoomUseCase } from '../../application/chat/use-cases/leave-room.use-case';
import { CreateDmUseCase } from '../../application/chat/use-cases/create-dm.use-case';
import { DeleteRoomUseCase } from '../../application/chat/use-cases/delete-room.use-case';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateDmDto } from './dto/create-dm.dto';
import type { IRoomRepository } from '../../core/repositories/room.repository';
import { ROOM_REPOSITORY } from '../../core/repositories/room.repository';
import { Inject } from '@nestjs/common';
import { ChatGateway } from '../../infrastructure/websockets/chat.gateway';

@ApiTags('Rooms')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
    constructor(
        private readonly createRoomUseCase: CreateRoomUseCase,
        private readonly joinRoomUseCase: JoinRoomUseCase,
        private readonly leaveRoomUseCase: LeaveRoomUseCase,
        private readonly createDmUseCase: CreateDmUseCase,
        private readonly deleteRoomUseCase: DeleteRoomUseCase,
        private readonly chatGateway: ChatGateway,
        @Inject(ROOM_REPOSITORY)
        private readonly roomRepository: IRoomRepository,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new room' })
    async createRoom(
        @CurrentUser() user: { sub: string },
        @Body() dto: CreateRoomDto,
    ) {
        const room = await this.createRoomUseCase.execute(user.sub, dto);
        return { success: true, data: room };
    }

    @Get()
    @ApiOperation({ summary: 'List all public rooms' })
    async listRooms() {
        const rooms = await this.roomRepository.findPublicRooms();
        return { success: true, data: rooms };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get room by ID' })
    async getRoom(@Param('id') id: string) {
        const room = await this.roomRepository.findById(id);
        return { success: true, data: room };
    }

    @Get(':id/members')
    @ApiOperation({ summary: 'Get room members' })
    async getMembers(@Param('id') id: string) {
        const members = await this.roomRepository.findMembers(id);
        return { success: true, data: members };
    }

    @Post(':id/join')
    @HttpCode(HttpStatus.OK)
    async joinRoom(
        @CurrentUser() user: { sub: string },
        @Param('id') roomId: string,
    ) {
        const member = await this.joinRoomUseCase.execute(user.sub, roomId);
        await this.chatGateway.addUserToRoom(user.sub, roomId);
        this.chatGateway.emitUserJoinedRoom(roomId, user.sub, '');
        return { success: true, data: member };
    }

    @Post(':id/leave')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Leave a room' })
    async leaveRoom(
        @CurrentUser() user: { sub: string },
        @Param('id') roomId: string,
    ) {
        await this.leaveRoomUseCase.execute(user.sub, roomId);
        await this.chatGateway.removeUserFromRoom(user.sub, roomId);
        this.chatGateway.emitUserLeftRoom(roomId, user.sub, '');
        return { success: true, message: 'Left room successfully' };
    }

    @Post('dm')
    @ApiOperation({ summary: 'Create or get a DM room' })
    async createDm(
        @CurrentUser() user: { sub: string },
        @Body() dto: CreateDmDto,
    ) {
        const room = await this.createDmUseCase.execute(user.sub, dto.targetUserId);
        return { success: true, data: room };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a room (owner only)' })
    async deleteRoom(
    @CurrentUser() user: { sub: string },
    @Param('id') roomId: string,
    ) {
        await this.deleteRoomUseCase.execute(user.sub, roomId);
        return { success: true, message: 'Room deleted successfully' };
    }
}