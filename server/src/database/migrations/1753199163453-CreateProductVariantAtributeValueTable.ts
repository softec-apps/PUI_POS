import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProductVariantAtributeValueTable1753199163453
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("SET timezone = 'UTC'")

    await queryRunner.query(`
      CREATE TABLE "product_variant_atribute_value" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "value" text NOT NULL,
        "productVariantId" uuid NOT NULL,
        "atributeId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_product_variant_atribute_value_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_variant_attribute" UNIQUE ("productVariantId", "atributeId"),
        CONSTRAINT "FK_product_variant_atribute_value_variantId" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_variant_atribute_value_atributeId" FOREIGN KEY ("atributeId") REFERENCES "atribute"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "IDX_product_variant_atribute_value_variant" ON "product_variant_atribute_value" ("productVariantId");
      CREATE INDEX "IDX_product_variant_atribute_value_attribute" ON "product_variant_atribute_value" ("atributeId");
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "IDX_product_variant_atribute_value_attribute";
      DROP INDEX "IDX_product_variant_atribute_value_variant";
      DROP TABLE "product_variant_atribute_value";
    `)
  }
}
