import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateKardexTable1754059850889 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET timezone = 'UTC'`)

    // Crear enum para tipo de movimiento
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
        "quantity" integer NOT NULL CHECK ("quantity" > 0),
        "unitCost" decimal(13,6) NOT NULL DEFAULT 0 CHECK ("unitCost" >= 0),
        "subtotal" decimal(13,6) NOT NULL DEFAULT 0 CHECK ("subtotal" >= 0),
        "taxRate" decimal(5,2) NOT NULL DEFAULT 0 CHECK ("taxRate" >= 0 AND "taxRate" <= 100),
        "taxAmount" decimal(13,6) NOT NULL DEFAULT 0 CHECK ("taxAmount" >= 0),
        "total" decimal(13,6) NOT NULL DEFAULT 0 CHECK ("total" >= 0),
        "stockBefore" integer NOT NULL DEFAULT 0 CHECK ("stockBefore" >= 0),
        "stockAfter" integer NOT NULL DEFAULT 0 CHECK ("stockAfter" >= 0),
        "reason" character varying(255),
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_kardex_id" PRIMARY KEY ("id")
      )
    `)

    // Función para calcular totales
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_kardex_totals()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Calcular subtotal (cantidad * costo unitario)
        NEW.subtotal := NEW.quantity * NEW."unitCost";

        -- Calcular monto del impuesto (subtotal * (tasa de impuesto / 100))
        NEW."taxAmount" := NEW.subtotal * (NEW."taxRate" / 100.0);

        -- Calcular total (subtotal + impuesto)
        NEW.total := NEW.subtotal + NEW."taxAmount";

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Trigger para cálculo automático
    await queryRunner.query(`
      CREATE TRIGGER "trigger_calculate_kardex_totals"
      BEFORE INSERT OR UPDATE ON "kardex"
      FOR EACH ROW
      EXECUTE FUNCTION calculate_kardex_totals();
    `)

    // Índices
    await queryRunner.query(`
      CREATE INDEX "IDX_kardex_productId_createdAt" ON "kardex" ("productId", "createdAt")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_kardex_movementType" ON "kardex" ("movementType")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_kardex_productId_movementType" ON "kardex" ("productId", "movementType")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_kardex_userId_movementType" ON "kardex" ("userId", "movementType")
    `)

    // FK si existen las tablas
    if (await queryRunner.hasTable('product')) {
      await queryRunner.query(`
        ALTER TABLE "kardex"
        ADD CONSTRAINT "FK_kardex_productId"
        FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT
      `)
    } else {
      console.warn(
        '⚠️ La tabla "product" no existe. FK_kardex_productId no fue creada.',
      )
    }

    if (await queryRunner.hasTable('user')) {
      await queryRunner.query(`
        ALTER TABLE "kardex"
        ADD CONSTRAINT "FK_kardex_userId"
        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT
      `)
    } else {
      console.warn(
        '⚠️ La tabla "user" no existe. FK_kardex_userId no fue creada.',
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar trigger y función
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "trigger_calculate_kardex_totals" ON "kardex"`,
    )
    await queryRunner.query(`DROP FUNCTION IF EXISTS calculate_kardex_totals()`)

    // Foreign keys
    const constraints = ['FK_kardex_userId', 'FK_kardex_productId']
    for (const constraint of constraints) {
      try {
        await queryRunner.query(
          `ALTER TABLE "kardex" DROP CONSTRAINT "${constraint}"`,
        )
      } catch (error) {
        console.warn(`⚠️ Constraint ${constraint} no encontrada o ya eliminada`)
      }
    }

    // Índices
    const indexes = [
      'IDX_kardex_productId_createdAt',
      'IDX_kardex_movementType',
      'IDX_kardex_productId_movementType',
      'IDX_kardex_userId_movementType',
    ]
    for (const index of indexes) {
      try {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."${index}"`)
      } catch (error) {
        console.warn(`⚠️ Index ${index} no encontrado o ya eliminado`)
      }
    }

    // Eliminar tabla y enum
    await queryRunner.query(`DROP TABLE IF EXISTS "kardex"`)
    await queryRunner.query(`DROP TYPE IF EXISTS "kardex_movement_type_enum"`)
  }
}
