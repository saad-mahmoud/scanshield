import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DOCUMENT_QUEUE } from './queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: DOCUMENT_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
