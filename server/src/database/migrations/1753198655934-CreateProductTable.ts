import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProductTable1753198655934 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("SET timezone = 'UTC'")

    // Verificar si la secuencia existe antes de crearla
    const sequenceExists = await queryRunner.query(
      `SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'product_sequence'`,
    )

    if (!sequenceExists || sequenceExists.length === 0) {
      await queryRunner.query(`
      CREATE SEQUENCE "product_sequence" 
      START WITH 1 
      INCREMENT BY 1 
      MINVALUE 1 
      MAXVALUE 99999 
      CACHE 1
    `)
    }

    // Crear enum para el status del producto
    await queryRunner.query(`
      CREATE TYPE "product_status_enum" AS ENUM ('draft', 'active', 'inactive', 'discontinued', 'out_of_stock')
    `)

    // Crear tabla product
    await queryRunner.query(`
      CREATE TABLE "product" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sequence" integer NOT NULL DEFAULT nextval('product_sequence'),
        "isVariant" boolean NOT NULL DEFAULT false,
        "code" character varying(20) NOT NULL UNIQUE,
        "name" character varying(255) NOT NULL,
        "description" text,
        "photoId" uuid,
        "price" decimal(13,6) NOT NULL,
        "status" "product_status_enum" NOT NULL DEFAULT 'draft',
        "sku" character varying(20),
        "barCode" character varying(50),
        "stock" integer NOT NULL DEFAULT 0,
        "categoryId" uuid,
        "brandId" uuid,
        "supplierId" uuid,
        "templateId" uuid,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_product_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_sequence" UNIQUE ("sequence"),
        CONSTRAINT "CHK_product_price" CHECK ("price" >= 0),
        CONSTRAINT "CHK_product_stock" CHECK ("stock" >= 0)
      )
    `)

    // Función corregida para generar código automáticamente
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION generate_product_code()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Usar el valor de sequence que ya fue asignado por el default
          -- Extraer los primeros 8 caracteres del UUID (sin guiones y en mayúsculas)
          -- y concatenar con el sequence actual (rellenado con ceros a 5 dígitos)
          NEW.code := 'PROD' || '-' || LPAD(NEW.sequence::text, 5, '0');
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Trigger para generar el código automáticamente antes del INSERT
    await queryRunner.query(`
      CREATE TRIGGER "trigger_generate_product_code"
      BEFORE INSERT ON "product"
      FOR EACH ROW
      EXECUTE FUNCTION generate_product_code();
    `)

    // Crear índices para optimizar consultas
    await queryRunner.query(`
      CREATE INDEX "IDX_product_sequence" ON "product" ("sequence")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_isVariant" ON "product" ("isVariant")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_status_deletedAt" ON "product" ("status", "deletedAt")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_categoryId_status" ON "product" ("categoryId", "status")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_brandId_status" ON "product" ("brandId", "status")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_templateId_status" ON "product" ("templateId", "status")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_code" ON "product" ("code")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_name" ON "product" ("name")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_sku" ON "product" ("sku")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_barCode" ON "product" ("barCode")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_categoryId" ON "product" ("categoryId")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_brandId" ON "product" ("brandId")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_supplierId" ON "product" ("supplierId")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_product_templateId" ON "product" ("templateId")
    `)

    // Verificar que las tablas referenciadas existen antes de crear foreign keys
    const fileTableExists = await queryRunner.hasTable('file')
    const categoryTableExists = await queryRunner.hasTable('category')
    const brandTableExists = await queryRunner.hasTable('brand')
    const supplierTableExists = await queryRunner.hasTable('supplier')
    const templateTableExists = await queryRunner.hasTable('template')

    // Agregar foreign keys solo si las tablas existen
    if (fileTableExists) {
      await queryRunner.query(`
        ALTER TABLE "product" ADD CONSTRAINT "FK_product_photoId"
        FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE CASCADE
      `)
    }

    if (categoryTableExists) {
      await queryRunner.query(`
        ALTER TABLE "product" ADD CONSTRAINT "FK_product_categoryId"
        FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL
      `)
    }

    if (brandTableExists) {
      await queryRunner.query(`
        ALTER TABLE "product" ADD CONSTRAINT "FK_product_brandId"
        FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE SET NULL
      `)
    }

    if (supplierTableExists) {
      await queryRunner.query(`
        ALTER TABLE "product" ADD CONSTRAINT "FK_product_supplierId"
        FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE SET NULL
      `)
    }

    if (templateTableExists) {
      await queryRunner.query(`
        ALTER TABLE "product" ADD CONSTRAINT "FK_product_templateId"
        FOREIGN KEY ("templateId") REFERENCES "template"("id") ON DELETE RESTRICT
      `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar trigger y función
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trigger_generate_product_code" ON "product"`,
    )
    await queryRunner.query(`DROP FUNCTION IF EXISTS generate_product_code()`)

    // Eliminar foreign keys (verificar si existen antes de eliminarlos)
    const constraints = [
      'FK_product_templateId',
      'FK_product_supplierId',
      'FK_product_brandId',
      'FK_product_categoryId',
      'FK_product_photoId',
    ]

    for (const constraint of constraints) {
      try {
        await queryRunner.query(
          `ALTER TABLE "product" DROP CONSTRAINT "${constraint}"`,
        )
      } catch (error) {
        console.log(error)
        console.log(`Constraint ${constraint} no existe o ya fue eliminado`)
      }
    }

    // Eliminar índices
    const indexes = [
      'IDX_product_sequence',
      'IDX_product_templateId',
      'IDX_product_supplierId',
      'IDX_product_brandId',
      'IDX_product_categoryId',
      'IDX_product_barCode',
      'IDX_product_sku',
      'IDX_product_name',
      'IDX_product_code',
      'IDX_product_templateId_status',
      'IDX_product_brandId_status',
      'IDX_product_categoryId_status',
      'IDX_product_status_deletedAt',
      'IDX_product_isVariant',
    ]

    for (const index of indexes) {
      try {
        await queryRunner.query(`DROP INDEX "public"."${index}"`)
      } catch (error) {
        console.log(error)
        console.log(`Index ${index} no existe o ya fue eliminado`)
      }
    }

    // Eliminar tabla, enum y sequence
    await queryRunner.query(`DROP TABLE "product"`)
    await queryRunner.query(`DROP TYPE "product_status_enum"`)
    await queryRunner.query(`DROP SEQUENCE "product_sequence"`)
  }
}
