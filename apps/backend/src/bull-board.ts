import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import type { INestApplication } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type { RequestHandler } from 'express';
import { DOCUMENT_QUEUE } from './queue/queue.constants';

const BASE_PATH = '/admin/queues';

export function mountBullBoard(app: INestApplication): void {
  const queue = app.get<Queue>(getQueueToken(DOCUMENT_QUEUE));
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(BASE_PATH);

  createBullBoard({
    queues: [new BullMQAdapter(queue)],
    serverAdapter,
  });

  app.use(BASE_PATH, serverAdapter.getRouter() as RequestHandler);
}
