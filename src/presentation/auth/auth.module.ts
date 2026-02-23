import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { RegisterUseCase } from '../../application/auth/use-cases/register.use-case';
import { LoginUseCase } from '../../application/auth/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/auth/use-cases/refresh-token.use-case';
import { UserRepositoryImpl } from '../../infrastructure/database/typeorm/repositories/user.repository.impl';
import { UserOrmEntity } from '../../infrastructure/database/typeorm/entities/user.orm-entity';
import { RefreshTokenOrmEntity } from '../../infrastructure/database/typeorm/entities/refresh-token.orm-entity';
import { USER_REPOSITORY } from '../../core/repositories/user.repository';
import { LogoutUseCase } from '../../application/auth/use-cases/logout.use-case';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserOrmEntity, RefreshTokenOrmEntity]),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [USER_REPOSITORY, JwtModule],
})
export class AuthModule {}