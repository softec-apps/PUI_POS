import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFieldFactuZenToSales1756710447332
  implements MigrationInterface
{
  name = 'AddFieldFactuZenToSales1756710447332'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "sale"
            ADD COLUMN "estado_sri" varchar NULL,
            ADD COLUMN "clave_acceso" varchar NULL,
            ADD COLUMN "comprobante_id" varchar NULL
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "sale"
            DROP COLUMN "estado_sri",
            DROP COLUMN "clave_acceso"
            DROP COLUMN "comprobante_id"
        `)
  }
}
