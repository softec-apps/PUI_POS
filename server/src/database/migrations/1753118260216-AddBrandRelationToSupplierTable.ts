import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBrandRelationToSupplierTable1753118260216
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "supplier" 
      ADD COLUMN IF NOT EXISTS "brands" uuid[] DEFAULT '{}'::uuid[]
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "supplier" 
      DROP COLUMN "brands"
    `)
  }
}
