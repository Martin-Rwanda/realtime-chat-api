import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { QUEUES, CLOUDINARY_JOBS } from '../../../shared/constants/queue.constants';

export interface CloudinaryDeleteJob {
  publicId: string;
}

@Processor(QUEUES.CLOUDINARY_CLEANUP)
export class CloudinaryCleanupProcessor {
  private readonly logger = new Logger(CloudinaryCleanupProcessor.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Process(CLOUDINARY_JOBS.DELETE_FILE)
  async handleDeleteFile(job: Job<CloudinaryDeleteJob>): Promise<void> {
    const { publicId } = job.data;
    this.logger.log(`🗑️ Deleting Cloudinary file: ${publicId}`);
    await this.cloudinaryService.deleteFile(publicId);
    this.logger.log(`✅ Cloudinary file deleted: ${publicId}`);
  }
}