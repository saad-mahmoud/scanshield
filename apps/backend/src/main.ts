import 'reflect-metadata';
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { mountBullBoard } from './bull-board';
import { AppModule } from './app.module';

const DEBUG_LOG_PATH = join(__dirname, '..', '..', '..', '.cursor', 'debug-e97b86.log');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  mountBullBoard(app);
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  // #region agent log
  try {
    appendFileSync(
      DEBUG_LOG_PATH,
      `${JSON.stringify({
        sessionId: 'e97b86',
        hypothesisId: 'H1',
        location: 'main.ts:bootstrap',
        message: 'Nest listen OK (TypeORM initialized)',
        data: { port },
        timestamp: Date.now(),
        runId: 'post-fix',
      })}\n`,
    );
  } catch {
    /* ignore missing .cursor in odd cwd */
  }
  // #endregion
}

void bootstrap();
