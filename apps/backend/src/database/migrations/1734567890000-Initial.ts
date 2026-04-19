import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1734567890000 implements MigrationInterface {
  name = 'Initial1734567890000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "workflow_status_enum" AS ENUM ('queued', 'processing', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "risk_level_enum" AS ENUM ('clean', 'medium', 'high', 'critical')`,
    );
    await queryRunner.query(
      `CREATE TYPE "finding_type_enum" AS ENUM ('email', 'phone', 'ssn', 'credit_card')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`,
    );

    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "keyHash" character varying NOT NULL,
        "keyPrefix" character varying(32),
        "userId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_api_keys_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_api_keys_keyHash" ON "api_keys" ("keyHash")`,
    );

    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "content" text NOT NULL,
        "status" workflow_status_enum NOT NULL,
        "riskLevel" risk_level_enum NOT NULL DEFAULT 'clean',
        "userId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documents_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "findings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "type" finding_type_enum NOT NULL,
        "value" text NOT NULL,
        "position" integer NOT NULL,
        "documentId" uuid,
        CONSTRAINT "PK_findings_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "api_keys"
      ADD CONSTRAINT "FK_api_keys_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "documents"
      ADD CONSTRAINT "FK_documents_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "findings"
      ADD CONSTRAINT "FK_findings_documentId"
      FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "findings" DROP CONSTRAINT "FK_findings_documentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_documents_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_keys" DROP CONSTRAINT "FK_api_keys_userId"`,
    );

    await queryRunner.query(`DROP TABLE "findings"`);
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(`DROP TYPE "finding_type_enum"`);
    await queryRunner.query(`DROP TYPE "risk_level_enum"`);
    await queryRunner.query(`DROP TYPE "workflow_status_enum"`);
  }
}
