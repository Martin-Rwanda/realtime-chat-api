import { Injectable, Inject, ConflictException } from '@nestjs/common';
import type { IUserRepository } from '../../../core/repositories/user.repository';
import { USER_REPOSITORY } from '../../../core/repositories/user.repository';
import { UpdateProfileDto } from '../../../presentation/users/dto/update-profile.dto';
import { User } from '../../../core/entities/user.entity';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<User> {
    if (dto.username) {
      const existing = await this.userRepository.findByUsername(dto.username);
      if (existing && existing.id !== userId) {
        throw new ConflictException('Username already taken');
      }
    }
    return this.userRepository.update(userId, dto);
  }
}