import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateBillingTable1756310570921 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET timezone = 'UTC'`)

    // Crear tabla billing sin relación
    await queryRunner.query(`
      CREATE TABLE "billing" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL,
        "password" varchar(255) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_billing_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_billing_email" UNIQUE ("email")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "billing"`)
  }
}
