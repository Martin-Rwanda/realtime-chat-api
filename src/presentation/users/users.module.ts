import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { GetProfileUseCase } from '../../application/users/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/users/use-cases/update-profile.use-case';
import { UploadAvatarUseCase } from '../../application/users/use-cases/upload-avatar.use-case';
import { DeleteAvatarUseCase } from '../../application/users/use-cases/delete-avatar.use-case';
import { UserRepositoryImpl } from '../../infrastructure/database/typeorm/repositories/user.repository.impl';
import { UserOrmEntity } from '../../infrastructure/database/typeorm/entities/user.orm-entity';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';
import { USER_REPOSITORY } from '../../core/repositories/user.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    CloudinaryModule,
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [
    GetProfileUseCase,
    UpdateProfileUseCase,
    UploadAvatarUseCase,
    DeleteAvatarUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
  ],
})
export class UsersModule {}