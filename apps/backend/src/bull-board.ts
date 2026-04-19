import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import type { INestApplication } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type { RequestHandler } from 'express';
import { DOCUMENT_QUEUE } from './queue/queue.constants';

const BASE_PATH = '/admin/queues';

function basicAuthMiddleware(user: string, password: string): RequestHandler {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board"');
      res.status(401).send('Unauthorized');
      return;
    }
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
    const sep = decoded.indexOf(':');
    const u = sep === -1 ? decoded : decoded.slice(0, sep);
    const p = sep === -1 ? '' : decoded.slice(sep + 1);
    if (u !== user || p !== password) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board"');
      res.status(401).send('Unauthorized');
      return;
    }
    next();
  };
}

export function mountBullBoard(app: INestApplication): void {
  const queue = app.get<Queue>(getQueueToken(DOCUMENT_QUEUE));
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(BASE_PATH);

  createBullBoard({
    queues: [new BullMQAdapter(queue)],
    serverAdapter,
  });

  const bullUser = process.env.BULL_BOARD_USER;
  const bullPass = process.env.BULL_BOARD_PASSWORD;
  const router = serverAdapter.getRouter() as RequestHandler;
  if (bullUser && bullPass) {
    app.use(BASE_PATH, basicAuthMiddleware(bullUser, bullPass), router);
  } else {
    app.use(BASE_PATH, router);
  }
}
