import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateSupplierTable1752965333180 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Establecer timezone a UTC para esta migración
    await queryRunner.query("SET timezone = 'UTC'")

    await queryRunner.query(`
      CREATE TABLE "supplier" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ruc" character varying(13) NOT NULL,
        "legalName" character varying(300) NOT NULL,
        "commercialName" character varying(300),
        "status" character varying NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_supplier_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_supplier_ruc" UNIQUE ("ruc")
      );
      CREATE INDEX "IDX_supplier_status" ON "supplier" ("status");
      CREATE INDEX "IDX_supplier_legalName" ON "supplier" ("legalName");
      CREATE INDEX "IDX_supplier_commercialName" ON "supplier" ("commercialName");
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "IDX_supplier_commercialName";
      DROP INDEX "IDX_supplier_legalName";
      DROP INDEX "IDX_supplier_status";
      DROP TABLE "supplier";
    `)
  }
}
