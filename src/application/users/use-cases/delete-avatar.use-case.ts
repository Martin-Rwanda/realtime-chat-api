import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../../core/repositories/user.repository';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository';
import { CloudinaryService } from '../../../infrastructure/cloudinary/cloudinary.service';
import { User } from '../../../core/entities/user.entity';

@Injectable()
export class DeleteAvatarUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Delete from Cloudinary if exists
    if (user.avatarPublicId) {
      await this.cloudinaryService.deleteFile(user.avatarPublicId);
    }

    // Clear avatar fields in DB
    return this.userRepository.update(userId, {
      avatarUrl: null,
      avatarPublicId: null,
    });
  }
}