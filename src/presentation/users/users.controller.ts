import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { GetProfileUseCase } from '../../application/users/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/users/use-cases/update-profile.use-case';
import { UploadAvatarUseCase } from '../../application/users/use-cases/upload-avatar.use-case';
import { DeleteAvatarUseCase } from '../../application/users/use-cases/delete-avatar.use-case';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from 'src/core/entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(
        private readonly getProfileUseCase: GetProfileUseCase,
        private readonly updateProfileUseCase: UpdateProfileUseCase,
        private readonly uploadAvatarUseCase: UploadAvatarUseCase,
        private readonly deleteAvatarUseCase: DeleteAvatarUseCase,
    ) {}

    private toResponse(user: User) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@CurrentUser() user: { sub: string }) {
        const profile = await this.getProfileUseCase.execute(user.sub);
        return { success: true, data: this.toResponse(profile) };
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update current user profile' })
    async updateProfile(
        @CurrentUser() user: { sub: string },
        @Body() dto: UpdateProfileDto,
    ) {
        const updated = await this.updateProfileUseCase.execute(user.sub, dto);
        return { success: true, data: this.toResponse(updated) };
    }

    @Post('me/avatar')
    @ApiOperation({ summary: 'Upload user avatar' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
        type: 'object',
        properties: {
            file: { type: 'string', format: 'binary' },
        },
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        }),
    )
    async uploadAvatar(
        @CurrentUser() user: { sub: string },
        @UploadedFile() file: Express.Multer.File,
    ) {
        const updated = await this.uploadAvatarUseCase.execute(user.sub, file);
        return { success: true, data: this.toResponse(updated) };
    }

    @Delete('me/avatar')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete user avatar' })
    async deleteAvatar(@CurrentUser() user: { sub: string }) {
    const updated = await this.deleteAvatarUseCase.execute(user.sub);
    return { success: true, data: this.toResponse(updated) };
    }
}