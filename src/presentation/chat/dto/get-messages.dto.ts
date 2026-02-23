import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMessagesDto {
    @ApiProperty({ example: 'room-uuid-here' })
    @IsUUID()
    roomId: string;

    @ApiPropertyOptional({ example: 20, default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({ description: 'Message ID to paginate from' })
    @IsOptional()
    @IsUUID()
    cursor?: string;
}