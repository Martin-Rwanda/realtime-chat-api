import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import type { SignOptions } from 'jsonwebtoken';
import { RefreshTokenOrmEntity } from '../../../infrastructure/database/typeorm/entities/refresh-token.orm-entity';
import type { IUserRepository } from '../../../core/repositories/user.repository';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository';
import { Inject } from '@nestjs/common';
import { AuthResponseDto } from '../../../presentation/auth/dto/auth-response.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenOrmEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(rawToken: string): Promise<AuthResponseDto> {
    // Hash the incoming token to compare with DB
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const storedToken = await this.refreshTokenRepo.findOne({
      where: { tokenHash, revoked: false },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token (rotation)
    await this.refreshTokenRepo.update(storedToken.id, { revoked: true });

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Issue new access token
    const expiresIn = this.configService.get<string>('jwt.accessExpiresIn') as SignOptions['expiresIn'];
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, username: user.username },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn,
      },
    );
    // Issue new refresh token (rotation)
    const newRawToken = crypto.randomBytes(64).toString('hex');
    const newTokenHash = crypto
      .createHash('sha256')
      .update(newRawToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepo.save({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
      revoked: false,
    });

    return {
      accessToken,
      refreshToken: newRawToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}