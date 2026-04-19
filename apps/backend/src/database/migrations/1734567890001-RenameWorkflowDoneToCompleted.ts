import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Upgrades DBs created with an older migration that used `done` instead of `completed`.
 * No-op when `completed` already exists and `done` does not.
 */
export class RenameWorkflowDoneToCompleted1734567890001 implements MigrationInterface {
  name = 'RenameWorkflowDoneToCompleted1734567890001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'workflow_status_enum' AND e.enumlabel = 'done'
        ) THEN
          ALTER TYPE "workflow_status_enum" RENAME VALUE 'done' TO 'completed';
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'workflow_status_enum' AND e.enumlabel = 'completed'
        )
        AND NOT EXISTS (
          SELECT 1 FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'workflow_status_enum' AND e.enumlabel = 'done'
        ) THEN
          ALTER TYPE "workflow_status_enum" RENAME VALUE 'completed' TO 'done';
        END IF;
      END$$;
    `);
  }
}
