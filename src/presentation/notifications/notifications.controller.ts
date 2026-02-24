import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { NotificationService } from 'src/application/notifications/notification.service';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications' })
  async getNotifications(@CurrentUser() user: { sub: string }) {
    const notifications = await this.notificationService.getForUser(user.sub);
    return { success: true, data: notifications };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
  ) {
    const notification = await this.notificationService.markAsRead(id);
    return { success: true, data: notification };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: { sub: string }) {
    await this.notificationService.markAllAsRead(user.sub);
    return { success: true, message: 'All notifications marked as read' };
  }
}