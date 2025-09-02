import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFieldPricePublicToProduct1756512655932
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Añadir la columna pricePublic
    await queryRunner.query(`
      ALTER TABLE "product"
      ADD COLUMN "pricePublic" decimal(13,6) NOT NULL DEFAULT 0
    `)

    // Crear un CHECK para validar que no sea negativo
    await queryRunner.query(`
      ALTER TABLE "product"
      ADD CONSTRAINT "CHK_product_pricePublic" CHECK ("pricePublic" >= 0)
    `)

    // Opcional: índice si planeas consultar mucho por este campo
    await queryRunner.query(`
      CREATE INDEX "IDX_product_pricePublic" ON "product" ("pricePublic")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índice si existe
    try {
      await queryRunner.query(`DROP INDEX "public"."IDX_product_pricePublic"`)
    } catch (error) {
      console.log(`Index IDX_product_pricePublic no existe o ya fue eliminado`)
    }

    // Eliminar constraint
    try {
      await queryRunner.query(
        `ALTER TABLE "product" DROP CONSTRAINT "CHK_product_pricePublic"`,
      )
    } catch (error) {
      console.log(
        `Constraint CHK_product_pricePublic no existe o ya fue eliminado`,
      )
    }

    // Eliminar columna
    await queryRunner.query(`
      ALTER TABLE "product" DROP COLUMN "pricePublic"
    `)
  }
}
