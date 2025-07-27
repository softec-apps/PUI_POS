import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProductAttributeValueTable1753421359588
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("SET timezone = 'UTC'")

    // Verificar que las tablas requeridas existen antes de crear las referencias
    const productTableExists = await queryRunner.hasTable('product')
    const attributeTableExists = await queryRunner.hasTable('atribute') // Nota: el nombre es 'atribute' según tu código

    if (!productTableExists) {
      throw new Error(
        'La tabla "product" debe existir antes de crear "product_attribute_value". Ejecuta primero la migración de product.',
      )
    }

    if (!attributeTableExists) {
      throw new Error(
        'La tabla "atribute" debe existir antes de crear "product_attribute_value". Ejecuta primero la migración de atribute.',
      )
    }

    // Crear tabla product_attribute_value
    await queryRunner.query(`
      CREATE TABLE "product_attribute_value" (
        "productId" uuid NOT NULL,
        "attributeId" uuid NOT NULL,
        "value" text NOT NULL,
        CONSTRAINT "UQ_product_attribute_value_productId_attributeId" UNIQUE ("productId", "attributeId")
      )
    `)

    // Crear índices para optimizar consultas
    await queryRunner.query(`
      CREATE INDEX "IDX_product_attribute_value_productId" ON "product_attribute_value" ("productId")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_attribute_value_attributeId" ON "product_attribute_value" ("attributeId")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_attribute_value_value" ON "product_attribute_value" ("value")
    `)

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_product_attribute_value_productId_attributeId" ON "product_attribute_value" ("productId", "attributeId")
    `)

    // Agregar foreign keys después de verificar que las tablas existen
    await queryRunner.query(`
      ALTER TABLE "product_attribute_value" ADD CONSTRAINT "FK_product_attribute_value_productId"
      FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "product_attribute_value" ADD CONSTRAINT "FK_product_attribute_value_attributeId"
      FOREIGN KEY ("attributeId") REFERENCES "atribute"("id") ON DELETE CASCADE
    `)

    // Agregar constraint para validar que el valor no esté vacío
    await queryRunner.query(`
      ALTER TABLE "product_attribute_value" ADD CONSTRAINT "CHK_product_attribute_value_not_empty"
      CHECK (LENGTH(TRIM("value")) > 0)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar constraint de validación
    await queryRunner.query(
      `ALTER TABLE "product_attribute_value" DROP CONSTRAINT "CHK_product_attribute_value_not_empty"`,
    )

    // Eliminar foreign keys
    await queryRunner.query(
      `ALTER TABLE "product_attribute_value" DROP CONSTRAINT "FK_product_attribute_value_attributeId"`,
    )

    await queryRunner.query(
      `ALTER TABLE "product_attribute_value" DROP CONSTRAINT "FK_product_attribute_value_productId"`,
    )

    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_attribute_value_productId_attributeId"`,
    )

    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_attribute_value_value"`,
    )

    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_attribute_value_attributeId"`,
    )

    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_attribute_value_productId"`,
    )

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE "product_attribute_value"`)
  }
}
