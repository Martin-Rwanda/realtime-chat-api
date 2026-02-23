import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { RefreshTokenOrmEntity } from '../../../infrastructure/database/typeorm/entities/refresh-token.orm-entity';

@Injectable()
export class LogoutUseCase {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenOrmEntity>,
  ) {}

  async execute(rawToken: string): Promise<void> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    await this.refreshTokenRepo.update(
      { tokenHash, revoked: false },
      { revoked: true },
    );
  }
}