import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './processors/email.processor';
import { CloudinaryCleanupProcessor } from './processors/cloudinary-cleanup.processor';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { QUEUES } from '../../shared/constants/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUES.EMAIL },
      { name: QUEUES.CLOUDINARY_CLEANUP },
    ),
    CloudinaryModule,
  ],
  providers: [EmailProcessor, CloudinaryCleanupProcessor],
  exports: [BullModule],
})
export class BullQueuesModule {}