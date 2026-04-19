import { join } from 'node:path';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getDatabaseUrl } from './database-url';

export function createTypeOrmOptions(): TypeOrmModuleOptions {
  const migrations = [join(__dirname, 'migrations', '*.{js,ts}')];
  return {
    type: 'postgres',
    url: getDatabaseUrl(),
    autoLoadEntities: true,
    synchronize: false,
    migrations,
    migrationsRun: true,
  };
}
