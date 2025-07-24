import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProductVariantTable1753199055432
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("SET timezone = 'UTC'")

    await queryRunner.query(`
      CREATE TABLE "product_variant" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(100) NOT NULL,
        "name" character varying(300) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "price" decimal(10,2),
        "sku" character varying(20),
        "barcode" character varying(50),
        "stock" integer NOT NULL DEFAULT 0,
        "productId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_product_variant_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_variant_code" UNIQUE ("code"),
        CONSTRAINT "FK_product_variant_productId" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_product_variant_status" CHECK ("status" IN ('active', 'inactive', 'out_of_stock'))
      );
      
      CREATE INDEX "IDX_product_variant_code" ON "product_variant" ("code");
      CREATE INDEX "IDX_product_variant_product" ON "product_variant" ("productId");
      CREATE INDEX "IDX_product_variant_sku" ON "product_variant" ("sku");
      CREATE INDEX "IDX_product_variant_barcode" ON "product_variant" ("barcode");
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "IDX_product_variant_barcode";
      DROP INDEX "IDX_product_variant_sku";
      DROP INDEX "IDX_product_variant_product";
      DROP INDEX "IDX_product_variant_code";
      DROP TABLE "product_variant";
    `)
  }
}
