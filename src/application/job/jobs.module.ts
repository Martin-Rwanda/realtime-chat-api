import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobProducerService } from './job-producer.service';
import { BullQueuesModule } from '../../infrastructure/bull/bull.module';
import { QUEUES } from '../../shared/constants/queue.constants';

@Module({
  imports: [
    BullQueuesModule,
    BullModule.registerQueue(
      { name: QUEUES.EMAIL },
      { name: QUEUES.CLOUDINARY_CLEANUP },
    ),
  ],
  providers: [JobProducerService],
  exports: [JobProducerService],
})
export class JobsModule {}