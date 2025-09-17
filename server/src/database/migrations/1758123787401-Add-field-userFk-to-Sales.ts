import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFieldUserFkToSales1758123787401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna userId en sale
    await queryRunner.query(`
      ALTER TABLE "sale"
      ADD COLUMN "userId" uuid
    `)

    // Crear índice para optimizar búsquedas
    await queryRunner.query(`
      CREATE INDEX "IDX_sale_userId" ON "sale" ("userId")
    `)

    // Agregar la llave foránea
    await queryRunner.query(`
      ALTER TABLE "sale"
      ADD CONSTRAINT "FK_sale_userId"
      FOREIGN KEY ("userId") REFERENCES "user"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir la llave foránea
    await queryRunner.query(`
      ALTER TABLE "sale" DROP CONSTRAINT "FK_sale_userId"
    `)

    // Eliminar índice
    await queryRunner.query(`
      DROP INDEX "public"."IDX_sale_userId"
    `)

    // Eliminar columna
    await queryRunner.query(`
      ALTER TABLE "sale" DROP COLUMN "userId"
    `)
  }
}
