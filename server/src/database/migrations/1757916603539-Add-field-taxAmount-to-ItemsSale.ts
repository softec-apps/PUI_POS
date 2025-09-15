import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFieldTaxAmountToItemsSale1757916603539
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear la columna
    await queryRunner.query(`
      ALTER TABLE "sale_item"
      ADD COLUMN "taxAmount" numeric(13,6) NOT NULL DEFAULT 0
    `)

    await queryRunner.query(`
      ALTER TABLE "sale_item"
      ADD CONSTRAINT "CHK_sale_item_taxAmount" CHECK ("taxAmount" >= 0)
    `)

    // 2. Calcular taxAmount para registros existentes
    // Opción A: si totalPrice YA incluye impuestos
    await queryRunner.query(`
      UPDATE "sale_item"
      SET "taxAmount" = ROUND(("totalPrice" * "taxRate") / (100 + "taxRate"), 6)
      WHERE "taxRate" > 0
    `)

    // Opción B (comenta la anterior y descomenta esta)
    // si totalPrice es precio NETO (sin impuestos):
    /*
    await queryRunner.query(`
      UPDATE "sale_item"
      SET "taxAmount" = ROUND(("totalPrice" * "taxRate") / 100, 6)
      WHERE "taxRate" > 0
    `)
    */
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sale_item"
      DROP CONSTRAINT "CHK_sale_item_taxAmount"
    `)

    await queryRunner.query(`
      ALTER TABLE "sale_item"
      DROP COLUMN "taxAmount"
    `)
  }
}
