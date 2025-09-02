import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateSaleTable1755635057390 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET timezone = 'UTC'`)

    // Tabla Sale
    await queryRunner.query(`
      CREATE TABLE "sale" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customerId" uuid NOT NULL,
        "subtotal" numeric(13,6) NOT NULL DEFAULT 0,
        "taxRate" integer NOT NULL DEFAULT 0,
        "taxAmount" numeric(13,6) NOT NULL DEFAULT 0,
        "total" numeric(13,6) NOT NULL DEFAULT 0,
        "totalItems" integer NOT NULL DEFAULT 0,
        "paymentMethod" varchar(50) NOT NULL,
        "receivedAmount" numeric(13,6) NOT NULL DEFAULT 0,
        "change" numeric(13,6) NOT NULL DEFAULT 0,
        "code" varchar(50),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_sale_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_sale_subtotal" CHECK ("subtotal" >= 0),
        CONSTRAINT "CHK_sale_taxRate" CHECK ("taxRate" >= 0 AND "taxRate" <= 100),
        CONSTRAINT "CHK_sale_taxAmount" CHECK ("taxAmount" >= 0),
        CONSTRAINT "CHK_sale_total" CHECK ("total" >= 0)
      )
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_sale_customerId" ON "sale" ("customerId")
    `)

    await queryRunner.query(`
      ALTER TABLE "sale" ADD CONSTRAINT "FK_sale_customerId"
      FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL
    `)

    // --- Trigger function para llenar code ---
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_sale_code()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Extraer la última parte del UUID (después del último "-")
        NEW.code := right(NEW.id::text, 12);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    await queryRunner.query(`
      CREATE TRIGGER trg_set_sale_code
      BEFORE INSERT ON "sale"
      FOR EACH ROW
      EXECUTE FUNCTION set_sale_code();
    `)

    // Tabla SaleItem
    await queryRunner.query(`
      CREATE TABLE "sale_item" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "saleId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "productName" varchar(255) NOT NULL,
        "productCode" varchar(50),
        "quantity" integer NOT NULL,
        "unitPrice" numeric(13,6) NOT NULL DEFAULT 0,
        "taxRate" integer NOT NULL DEFAULT 0,
        "totalPrice" numeric(13,6) NOT NULL DEFAULT 0,
        CONSTRAINT "PK_sale_item_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_sale_item_quantity" CHECK ("quantity" > 0),
        CONSTRAINT "CHK_sale_item_unitPrice" CHECK ("unitPrice" >= 0),
        CONSTRAINT "CHK_sale_item_totalPrice" CHECK ("totalPrice" >= 0)
      )
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_sale_item_saleId" ON "sale_item" ("saleId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_sale_item_productId" ON "sale_item" ("productId")
    `)

    await queryRunner.query(`
      ALTER TABLE "sale_item" ADD CONSTRAINT "FK_sale_item_saleId"
      FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "sale_item" ADD CONSTRAINT "FK_sale_item_productId"
      FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Borrar trigger y función
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_set_sale_code ON "sale"`,
    )
    await queryRunner.query(`DROP FUNCTION IF EXISTS set_sale_code`)

    await queryRunner.query(
      `ALTER TABLE "sale_item" DROP CONSTRAINT "FK_sale_item_productId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "sale_item" DROP CONSTRAINT "FK_sale_item_saleId"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_sale_item_productId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_sale_item_saleId"`)
    await queryRunner.query(`DROP TABLE "sale_item"`)

    await queryRunner.query(
      `ALTER TABLE "sale" DROP CONSTRAINT "FK_sale_customerId"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_sale_customerId"`)
    await queryRunner.query(`DROP TABLE "sale"`)
  }
}
