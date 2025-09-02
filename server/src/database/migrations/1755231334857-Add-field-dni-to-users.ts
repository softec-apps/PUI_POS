import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFieldDniToUsers1755231334857 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN "dni" VARCHAR(10) UNIQUE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      DROP COLUMN "dni"
    `)
  }
}
