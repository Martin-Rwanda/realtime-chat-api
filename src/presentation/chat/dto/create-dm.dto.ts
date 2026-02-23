import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateDmDto {
  @ApiProperty({ example: 'user-uuid-here' })
  @IsUUID()
  targetUserId: string;
}