import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTemplates1750172311501 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("SET timezone = 'UTC'")

    await queryRunner.query(`
      CREATE TABLE "template" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying,
        "description" text,
        "categoryId" uuid,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_template_id" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "template" ADD CONSTRAINT "FK_template_category"
      FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "template" DROP CONSTRAINT "FK_template_category"`,
    )
    await queryRunner.query(`DROP TABLE "template"`)
  }
}
