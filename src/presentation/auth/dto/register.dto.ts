import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'john_doe', minLength: 3, maxLength: 20 })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  username: string;

  @ApiProperty({ example: 'StrongPass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and a number',
  })
  password: string;
}