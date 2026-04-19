import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

/**
 * GET /api-keys on the API host only (e.g. http://localhost:3000/api-keys).
 * Real JSON routes live under /auth/api-keys. Vite no longer proxies /api-keys here.
 */
@Controller()
export class ApiKeysAliasController {
  @Get('api-keys')
  redirectLegacyApiKeys(@Res() res: Response) {
    return res.redirect(308, '/auth/api-keys');
  }
}
