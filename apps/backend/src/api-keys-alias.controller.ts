import { Controller, Get, Res } from '@nestjs/common';
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express';

const DEBUG_LOG_PATH = join(__dirname, '..', '..', '..', '.cursor', 'debug-e97b86.log');

/**
 * GET /api-keys was returning 404; real routes live under /auth/api-keys.
 * Redirect so bookmarks and mistaken curl/browser URLs resolve.
 */
@Controller()
export class ApiKeysAliasController {
  @Get('api-keys')
  redirectLegacyApiKeys(@Res() res: Response) {
    // #region agent log
    try {
      appendFileSync(
        DEBUG_LOG_PATH,
        `${JSON.stringify({
          sessionId: 'e97b86',
          hypothesisId: 'alias-hit',
          location: 'api-keys-alias.controller.ts:redirectLegacyApiKeys',
          message: 'GET /api-keys -> 308 /auth/api-keys',
          data: {},
          timestamp: Date.now(),
          runId: 'alias-fix',
        })}\n`,
      );
    } catch {
      /* ignore missing .cursor */
    }
    // #endregion
    return res.redirect(308, '/auth/api-keys');
  }
}
