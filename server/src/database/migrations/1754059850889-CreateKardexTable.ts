import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateKardexTable1754059850889 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("SET timezone = 'UTC'")

    // Crear enum para el tipo de movimiento
    await queryRunner.query(`
      CREATE TYPE "kardex_movement_type_enum" AS ENUM (
        'purchase',
        'sale',
        'adjustment_in',
        'adjustment_out',
        'transfer_in',
        'transfer_out',
        'return_in',
        'return_out',
        'damaged',
        'expired'
      )
    `)

    // Crear tabla kardex
    await queryRunner.query(`
      CREATE TABLE "kardex" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "movementType" "kardex_movement_type_enum" NOT NULL,
        "quantity" integer NOT NULL,
        "unitCost" decimal(13,6) NOT NULL DEFAULT 0,
        "subtotal" decimal(13,6) NOT NULL DEFAULT 0,
        "taxRate" decimal(5,2) NOT NULL DEFAULT 0,
        "taxAmount" decimal(13,6) NOT NULL DEFAULT 0,
        "total" decimal(13,6) NOT NULL DEFAULT 0,
        "stockBefore" integer NOT NULL DEFAULT 0,
        "stockAfter" integer NOT NULL DEFAULT 0,
        "reason" character varying(255),
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_kardex_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_kardex_quantity" CHECK ("quantity" > 0),
        CONSTRAINT "CHK_kardex_unit_cost" CHECK ("unitCost" >= 0),
        CONSTRAINT "CHK_kardex_subtotal" CHECK ("subtotal" >= 0),
        CONSTRAINT "CHK_kardex_tax_rate" CHECK ("taxRate" >= 0 AND "taxRate" <= 100),
        CONSTRAINT "CHK_kardex_tax_amount" CHECK ("taxAmount" >= 0),
        CONSTRAINT "CHK_kardex_total" CHECK ("total" >= 0),
        CONSTRAINT "CHK_kardex_stock_before" CHECK ("stockBefore" >= 0),
        CONSTRAINT "CHK_kardex_stock_after" CHECK ("stockAfter" >= 0)
      )
    `)

    // Función para calcular totales con impuestos
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION calculate_kardex_totals()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Calcular subtotal (cantidad * costo unitario)
        NEW.subtotal := NEW.quantity * NEW."unitCost";
        
        -- Calcular monto del impuesto (subtotal * (tasa de impuecsto / 100))
        NEW."taxAmount" := NEW.subtotal * (NEW."taxRate" / 100.0);
        
        -- Calcular total (subtotal + impuesto)
        NEW.total := NEW.subtotal + NEW."taxAmount";
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    `)

    // Trigger para calcular totales automáticamente
    await queryRunner.query(`
      CREATE TRIGGER "trigger_calculate_kardex_totals"
      BEFORE INSERT OR UPDATE ON "kardex"
      FOR EACH ROW
      EXECUTE FUNCTION calculate_kardex_totals();
    `)

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX "IDX_kardex_productId_createdAt" ON "kardex" ("productId", "createdAt")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_kardex_movementType" ON "kardex" ("movementType")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_kardex_productId" ON "kardex" ("productId")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_kardex_userId" ON "kardex" ("userId")
    `)

    // Verificar que las tablas referenciadas existen antes de crear foreign keys
    const productTableExists = await queryRunner.hasTable('product')
    const userTableExists = await queryRunner.hasTable('user')

    // Agregar foreign keys solo si las tablas existen
    if (productTableExists) {
      await queryRunner.query(`
        ALTER TABLE "kardex" ADD CONSTRAINT "FK_kardex_productId"
        FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT
      `)
    } else {
      console.warn(
        '⚠️  La tabla "product" no existe. El foreign key FK_kardex_productId no fue creado.',
      )
    }

    if (userTableExists) {
      await queryRunner.query(`
        ALTER TABLE "kardex" ADD CONSTRAINT "FK_kardex_userId"
        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT
      `)
    } else {
      console.warn(
        '⚠️  La tabla "user" no existe. El foreign key FK_kardex_userId no fue creado.',
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar trigger y función
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trigger_calculate_kardex_totals" ON "kardex"`,
    )
    await queryRunner.query(`DROP FUNCTION IF EXISTS calculate_kardex_totals()`)

    // Eliminar foreign keys
    const constraints = ['FK_kardex_userId', 'FK_kardex_productId']

    for (const constraint of constraints) {
      try {
        await queryRunner.query(
          `ALTER TABLE "kardex" DROP CONSTRAINT "${constraint}"`,
        )
      } catch (error) {
        console.log(error)
        console.log(`Constraint ${constraint} no existe o ya fue eliminado`)
      }
    }

    // Eliminar índices
    const indexes = [
      'IDX_kardex_productId_createdAt',
      'IDX_kardex_movementType',
      'IDX_kardex_productId',
      'IDX_kardex_userId',
    ]

    for (const index of indexes) {
      try {
        await queryRunner.query(`DROP INDEX "public"."${index}"`)
      } catch (error) {
        console.log(error)
        console.log(`Index ${index} no existe o ya fue eliminado`)
      }
    }

    // Eliminar tabla y enum
    await queryRunner.query(`DROP TABLE "kardex"`)
    await queryRunner.query(`DROP TYPE "kardex_movement_type_enum"`)
  }
}
