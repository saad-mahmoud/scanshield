import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIbanFindingType1734567890002 implements MigrationInterface {
  name = 'AddIbanFindingType1734567890002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "finding_type_enum" ADD VALUE IF NOT EXISTS 'iban'`,
    );
  }

  public async down(): Promise<void> {
    // PostgreSQL enums do not support removing values safely in a reversible way.
  }
}
