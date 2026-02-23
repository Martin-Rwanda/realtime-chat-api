import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUseCase } from 'src/application/auth/use-cases/register.use-case';
import { LoginUseCase } from 'src/application/auth/use-cases/login.use-case';
import { RefreshTokenUseCase } from 'src/application/auth/use-cases/refresh-token.use-case';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutUseCase } from '../../application/auth/use-cases/logout.use-case';
import { LogoutDto } from './dto/logout.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUseCase.execute(dto);
    return {
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute(dto);
    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.refreshTokenUseCase.execute(dto.refreshToken);
    return {
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout - revoke refresh token' })
  async logout(@Body() dto: LogoutDto) {
    await this.logoutUseCase.execute(dto.refreshToken);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}