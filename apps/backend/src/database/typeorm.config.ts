import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function createTypeOrmOptions(): TypeOrmModuleOptions {
  const synchronize = process.env.NODE_ENV === 'development';

  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    database: process.env.DATABASE_NAME ?? 'scanshield',
    autoLoadEntities: true,
    synchronize,
  };
}
