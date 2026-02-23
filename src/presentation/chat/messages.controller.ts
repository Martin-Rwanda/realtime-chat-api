import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { SendMessageUseCase } from '../../application/chat/use-cases/send-message.use-case';
import { GetMessagesUseCase } from '../../application/chat/use-cases/get-messages.use-case';
import { EditMessageUseCase } from '../../application/chat/use-cases/edit-message.use-case';
import { DeleteMessageUseCase } from '../../application/chat/use-cases/delete-message.use-case';
import { MarkReadUseCase } from '../../application/chat/use-cases/mark-read.use-case';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { EditMessageDto } from './dto/edit-message.dto';

@ApiTags('Messages')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
    constructor(
        private readonly sendMessageUseCase: SendMessageUseCase,
        private readonly getMessagesUseCase: GetMessagesUseCase,
        private readonly editMessageUseCase: EditMessageUseCase,
        private readonly deleteMessageUseCase: DeleteMessageUseCase,
        private readonly markReadUseCase: MarkReadUseCase,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Send a message to a room' })
    async sendMessage(
        @CurrentUser() user: { sub: string },
        @Body() dto: SendMessageDto,
    ) {
        const message = await this.sendMessageUseCase.execute(user.sub, dto);
        return { success: true, data: message };
    }

    @Get()
    @ApiOperation({ summary: 'Get messages in a room (cursor pagination)' })
    async getMessages(
        @CurrentUser() user: { sub: string },
        @Query() dto: GetMessagesDto,
    ) {
        const messages = await this.getMessagesUseCase.execute(user.sub, dto);
        return {
        success: true,
        data: messages,
        meta: {
            limit: dto.limit ?? 20,
            nextCursor: messages.length > 0 ? messages[messages.length - 1].id : null,
        },
        };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Edit a message' })
    async editMessage(
        @CurrentUser() user: { sub: string },
        @Param('id') messageId: string,
        @Body() dto: EditMessageDto,
    ) {
        const message = await this.editMessageUseCase.execute(user.sub, messageId, dto);
        return { success: true, data: message };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a message (soft delete)' })
    async deleteMessage(
        @CurrentUser() user: { sub: string },
        @Param('id') messageId: string,
    ) {
        await this.deleteMessageUseCase.execute(user.sub, messageId);
        return { success: true, message: 'Message deleted' };
    }

    @Post(':id/read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark a message as read' })
    async markRead(
        @CurrentUser() user: { sub: string },
        @Param('id') messageId: string,
    ) {
        const read = await this.markReadUseCase.execute(user.sub, messageId);
        return { success: true, data: read };
    }
}