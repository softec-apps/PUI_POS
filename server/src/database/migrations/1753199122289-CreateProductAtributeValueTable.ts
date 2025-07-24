import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProductAtributeValueTable1753199122289
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("SET timezone = 'UTC'")

    await queryRunner.query(`
      CREATE TABLE "product_atribute_value" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "value" text NOT NULL,
        "productId" uuid NOT NULL,
        "atributeId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_product_atribute_value_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_attribute" UNIQUE ("productId", "atributeId"),
        CONSTRAINT "FK_product_atribute_value_productId" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_atribute_value_atributeId" FOREIGN KEY ("atributeId") REFERENCES "atribute"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "IDX_product_atribute_value_product" ON "product_atribute_value" ("productId");
      CREATE INDEX "IDX_product_atribute_value_attribute" ON "product_atribute_value" ("atributeId");
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "IDX_product_atribute_value_attribute";
      DROP INDEX "IDX_product_atribute_value_product";
      DROP TABLE "product_atribute_value";
    `)
  }
}
