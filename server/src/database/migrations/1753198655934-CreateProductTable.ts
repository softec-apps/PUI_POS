import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProductTable1753198655934 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("SET timezone = 'UTC'")

    await queryRunner.query(`
      CREATE TABLE "product" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(20) NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "status" character varying NOT NULL DEFAULT 'active',
        "basePrice" decimal(13,6) NOT NULL,
        "sku" character varying(20),
        "barcode" character varying(50),
        "stock" integer NOT NULL,
        "brandId" uuid,
        "templateId" uuid,
        "categoryId" uuid,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_product_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_code" UNIQUE ("code"),
        CONSTRAINT "FK_product_brandId" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_product_templateId" FOREIGN KEY ("templateId") REFERENCES "template"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_product_categoryId" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL,
        CONSTRAINT "CHK_product_status" CHECK ("status" IN ('active', 'inactive', 'discontinued', 'out_of_stock'))
      );
      
      CREATE INDEX "IDX_product_code" ON "product" ("code");
      CREATE INDEX "IDX_product_name" ON "product" ("name");
      CREATE INDEX "IDX_product_sku" ON "product" ("sku");
      CREATE INDEX "IDX_product_barcode" ON "product" ("barcode");
      CREATE INDEX "IDX_product_status" ON "product" ("status");
      CREATE INDEX "IDX_product_brand" ON "product" ("brandId");
      CREATE INDEX "IDX_product_category" ON "product" ("categoryId");
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "IDX_product_category";
      DROP INDEX "IDX_product_brand";
      DROP INDEX "IDX_product_status";
      DROP INDEX "IDX_product_barcode";
      DROP INDEX "IDX_product_sku";
      DROP INDEX "IDX_product_name";
      DROP INDEX "IDX_product_code";
      DROP TABLE "product";
    `)
  }
}
