import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional, MinLength } from 'class-validator';
import { MessageType } from 'src/shared/enum/message-type.enum';

export class SendMessageDto {
    @ApiProperty({ example: 'room-uuid-here' })
    @IsUUID()
    roomId: string;

    @ApiProperty({ example: 'Hello everyone!' })
    @IsString()
    @MinLength(1)
    content: string;

    @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT })
    @IsOptional()
    @IsEnum(MessageType)
    type?: MessageType;
}