import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProductVariationTable1753421327459
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("SET timezone = 'UTC'")

    // Verificar que la tabla product existe antes de crear las referencias
    const productTableExists = await queryRunner.hasTable('product')
    if (!productTableExists) {
      throw new Error(
        'La tabla "product" debe existir antes de crear "product_variation". Ejecuta primero la migración de product.',
      )
    }

    // Crear tabla product_variation
    await queryRunner.query(`
      CREATE TABLE "product_variation" (
        "productId" uuid NOT NULL,
        "productVariantId" uuid NOT NULL,
        CONSTRAINT "UQ_product_variation_productId_productVariantId" UNIQUE ("productId", "productVariantId")
      )
    `)

    // Crear índices para optimizar consultas
    await queryRunner.query(`
      CREATE INDEX "IDX_product_variation_productId" ON "product_variation" ("productId")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_variation_productVariantId" ON "product_variation" ("productVariantId")
    `)

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_product_variation_productId_productVariantId" ON "product_variation" ("productId", "productVariantId")
    `)

    // Agregar foreign keys después de verificar que la tabla product existe
    await queryRunner.query(`
      ALTER TABLE "product_variation" ADD CONSTRAINT "FK_product_variation_productId"
      FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "product_variation" ADD CONSTRAINT "FK_product_variation_productVariantId"
      FOREIGN KEY ("productVariantId") REFERENCES "product"("id") ON DELETE CASCADE
    `)

    // Agregar constraint para evitar auto-referencias (un producto no puede ser variante de sí mismo)
    await queryRunner.query(`
      ALTER TABLE "product_variation" ADD CONSTRAINT "CHK_product_variation_no_self_reference"
      CHECK ("productId" != "productVariantId")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar constraint de auto-referencia
    await queryRunner.query(
      `ALTER TABLE "product_variation" DROP CONSTRAINT "CHK_product_variation_no_self_reference"`,
    )

    // Eliminar foreign keys
    await queryRunner.query(
      `ALTER TABLE "product_variation" DROP CONSTRAINT "FK_product_variation_productVariantId"`,
    )

    await queryRunner.query(
      `ALTER TABLE "product_variation" DROP CONSTRAINT "FK_product_variation_productId"`,
    )

    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_variation_productId_productVariantId"`,
    )

    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_variation_productVariantId"`,
    )

    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_variation_productId"`,
    )

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE "product_variation"`)
  }
}
