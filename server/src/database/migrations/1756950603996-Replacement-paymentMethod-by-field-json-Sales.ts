import { MigrationInterface, QueryRunner } from 'typeorm'

export class ReplacementPaymentMethodByFieldJsonSales1756950603996
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hacer paymentMethod temporalmente nullable
    await queryRunner.query(`
      ALTER TABLE "sale"
      ALTER COLUMN "paymentMethod" DROP NOT NULL
    `)

    // Agregar nueva columna paymentMethods
    await queryRunner.query(`
      ALTER TABLE "sale"
      ADD COLUMN "paymentMethods" JSONB NOT NULL DEFAULT '[]'::jsonb
    `)

    // Migrar datos de paymentMethod a paymentMethods
    await queryRunner.query(`
      UPDATE "sale"
      SET "paymentMethods" = jsonb_build_array(
        jsonb_build_object(
          'method', "paymentMethod",
          'amount', "total",
          'transferNumber', ''
        )
      )
      WHERE "paymentMethod" IS NOT NULL
    `)

    // Eliminar columna antigua
    await queryRunner.query(`
      ALTER TABLE "sale"
      DROP COLUMN "paymentMethod"
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reagregar paymentMethod nullable
    await queryRunner.query(`
      ALTER TABLE "sale"
      ADD COLUMN "paymentMethod" VARCHAR(50)
    `)

    // Migrar datos de paymentMethods a paymentMethod
    await queryRunner.query(`
      UPDATE "sale"
      SET "paymentMethod" = ("paymentMethods"->0->>'method')::varchar
      WHERE jsonb_array_length("paymentMethods") > 0
    `)

    // Volver a hacer paymentMethod NOT NULL
    await queryRunner.query(`
      ALTER TABLE "sale"
      ALTER COLUMN "paymentMethod" SET NOT NULL
    `)

    // Eliminar columna paymentMethods
    await queryRunner.query(`
      ALTER TABLE "sale"
      DROP COLUMN "paymentMethods"
    `)
  }
}
