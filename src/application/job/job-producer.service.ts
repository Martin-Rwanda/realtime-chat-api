import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { QUEUES, EMAIL_JOBS, CLOUDINARY_JOBS } from '../../shared/constants/queue.constants';
import {
  OfflineNotificationJob,
} from '../../infrastructure/bull/processors/email.processor';
import {
  CloudinaryDeleteJob,
} from '../../infrastructure/bull/processors/cloudinary-cleanup.processor';

@Injectable()
export class JobProducerService {
  constructor(
    @InjectQueue(QUEUES.EMAIL)
    private readonly emailQueue: Queue<OfflineNotificationJob>,
    @InjectQueue(QUEUES.CLOUDINARY_CLEANUP)
    private readonly cloudinaryQueue: Queue<CloudinaryDeleteJob>,
  ) {}

  async sendOfflineNotificationEmail(data: OfflineNotificationJob): Promise<void> {
    await this.emailQueue.add(EMAIL_JOBS.SEND_OFFLINE_NOTIFICATION, data, {
      attempts: 3,           // retry 3 times if it fails
      backoff: {
        type: 'exponential',
        delay: 2000,         // wait 2s, 4s, 8s between retries
      },
      removeOnComplete: true, // clean up completed jobs
      removeOnFail: false,    // keep failed jobs for inspection
    });
  }

  async scheduleCloudinaryDelete(publicId: string): Promise<void> {
    await this.cloudinaryQueue.add(
      CLOUDINARY_JOBS.DELETE_FILE,
      { publicId },
      {
        delay: 5000,           // wait 5 seconds before deleting
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      },
    );
  }
}