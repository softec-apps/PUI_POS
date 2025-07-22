import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTemplateAtributesRelation1750172326289
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "template_atribute" (
        "templateId" uuid NOT NULL,
        "atributeId" uuid NOT NULL,
        PRIMARY KEY ("templateId", "atributeId"),
        CONSTRAINT "FK_template_attr_template"
          FOREIGN KEY ("templateId") REFERENCES "template"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_template_attr_atribute"
          FOREIGN KEY ("atributeId") REFERENCES "atribute"("id") ON DELETE CASCADE
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "template_atribute"`)
  }
}
