import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAtributes1750172318354 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "atribute_type_enum" AS ENUM (
      'text',
      'integer',
      'bigint',
      'decimal',
      'money',
      'date',
      'timestamp',
      'time',
      'boolean',
      'enum',
      'json',
      'array')
    `)
    await queryRunner.query(`
      CREATE TABLE "atribute" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying UNIQUE,
        "type" "atribute_type_enum" NOT NULL DEFAULT 'text',
        "options" json,
        "required" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_atribute_id" PRIMARY KEY ("id")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "atribute"`)
    await queryRunner.query(`DROP TYPE "atribute_type_enum"`)
  }
}
