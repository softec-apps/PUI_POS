import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFieldTaxToProduct1756174221619 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE product
            ADD COLUMN tax INT DEFAULT 0;
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE product
            DROP COLUMN tax;
        `)
  }
}
