import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveFieldTaxRateSales1757797024313
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove the taxRate column from the sale table
    await queryRunner.query(`
            ALTER TABLE "sale" 
            DROP COLUMN "taxRate"
        `)

    // Also remove the CHECK constraint for taxRate if it exists
    await queryRunner.query(`
            ALTER TABLE "sale" 
            DROP CONSTRAINT IF EXISTS "CHK_sale_taxRate"
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add the taxRate column back with the same properties
    await queryRunner.query(`
            ALTER TABLE "sale" 
            ADD COLUMN "taxRate" integer NOT NULL DEFAULT 0
        `)

    // Re-add the CHECK constraint
    await queryRunner.query(`
            ALTER TABLE "sale" 
            ADD CONSTRAINT "CHK_sale_taxRate" 
            CHECK ("taxRate" >= 0 AND "taxRate" <= 100)
        `)
  }
}
