import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProductSupplierTable1753199011178
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "product_supplier" (
        "productId" uuid NOT NULL,
        "supplierId" uuid NOT NULL,
        CONSTRAINT "PK_product_supplier" PRIMARY KEY ("productId", "supplierId"),
        CONSTRAINT "FK_product_supplier_productId" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_supplier_supplierId" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE CASCADE
      );
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "product_supplier";
    `)
  }
}
