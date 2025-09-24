import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFieldpdfVoucherToSale1758723743711
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sale" 
      ADD COLUMN "pdfVoucher" TEXT
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sale" 
      DROP COLUMN "pdfVoucher"
    `)
  }
}
