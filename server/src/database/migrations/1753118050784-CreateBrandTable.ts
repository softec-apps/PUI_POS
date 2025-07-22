import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateBrandTable1753118050784 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "brand_status_enum" AS ENUM ('active', 'inactive')
    `)

    // 1. Crear tabla brand
    await queryRunner.query(`
      CREATE TABLE "brand" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "status" "category_status_enum" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_brand_id" PRIMARY KEY ("id")
      )
    `)

    // 2. Crear tabla de unión brand_supplier
    await queryRunner.query(`
      CREATE TABLE "brand_supplier" (
        "brandId" uuid NOT NULL,
        "supplierId" uuid NOT NULL,
        CONSTRAINT "PK_brand_supplier" PRIMARY KEY ("brandId", "supplierId"),
        CONSTRAINT "FK_brand_supplier_brand" FOREIGN KEY ("brandId") 
          REFERENCES "brand"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_brand_supplier_supplier" FOREIGN KEY ("supplierId") 
          REFERENCES "supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)

    // 3. Crear índices para optimización
    await queryRunner.query(`
      CREATE INDEX "IDX_brand_supplier_brand" ON "brand_supplier" ("brandId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_brand_supplier_supplier" ON "brand_supplier" ("supplierId")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Eliminar índices
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_brand_supplier_supplier"`,
    )
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_brand_supplier_brand"`)

    // 2. Eliminar tabla de unión
    await queryRunner.query(`DROP TABLE IF EXISTS "brand_supplier"`)

    // 3. Eliminar tabla brand
    await queryRunner.query(`DROP TABLE IF EXISTS "brand"`)
  }
}
