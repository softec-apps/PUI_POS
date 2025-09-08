import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFieldRevenueToSaleItem1757276564932
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sale_item"
      ADD COLUMN "revenue" numeric(13,6) NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sale_item"
      DROP COLUMN "revenue"
    `)
  }
}
