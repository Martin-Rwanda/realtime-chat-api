import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { RoomType } from 'src/shared/enum/room-type.enum';

export class CreateRoomDto {
  @ApiProperty({ example: 'General' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ example: 'General discussion room' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ enum: RoomType, example: RoomType.PUBLIC })
  @IsEnum(RoomType)
  type: RoomType;
}