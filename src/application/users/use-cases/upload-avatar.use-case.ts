import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../../core/repositories/user.repository';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository';
import { CloudinaryService } from '../../../infrastructure/cloudinary/cloudinary.service';
import { User } from '../../../core/entities/user.entity';

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(userId: string, file: Express.Multer.File): Promise<User> {
    const user = await this.userRepository.findById(userId);

    // Delete old avatar from Cloudinary if exists
    if (user?.avatarPublicId) {
      await this.cloudinaryService.deleteFile(user.avatarPublicId);
    }

    // Upload new avatar
    const result = await this.cloudinaryService.uploadFile(
      file,
      `chat-app/avatars/${userId}`,
    );

    // Update user record
    return this.userRepository.update(userId, {
      avatarUrl: result.secure_url,
      avatarPublicId: result.public_id,
    });
  }
}