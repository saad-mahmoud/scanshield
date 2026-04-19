import 'reflect-metadata';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { getDatabaseUrl } from './database-url';
import { ApiKey } from '../entities/api-key.entity';
import { Document } from '../entities/document.entity';
import { Finding } from '../entities/finding.entity';
import { User } from '../entities/user.entity';

export default new DataSource({
  type: 'postgres',
  url: getDatabaseUrl(),
  entities: [User, ApiKey, Document, Finding],
  migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
  synchronize: false,
});
