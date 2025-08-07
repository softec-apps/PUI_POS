import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateEstablishmentTable1754498605055
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET timezone = 'UTC'`)

    // Enum solo para accounting (porque es de tipo texto)
    await queryRunner.query(`
      CREATE TYPE "establishment_accounting_enum" AS ENUM ('SI', 'NO')
    `)

    // Tabla
    await queryRunner.query(`
      CREATE TABLE "establishment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ruc" varchar(13) NOT NULL UNIQUE,
        "companyName" varchar(300) NOT NULL,
        "tradeName" varchar(300),
        "parentEstablishmentAddress" varchar(300) NOT NULL,
        "addressIssuingEstablishment" varchar(300),
        "issuingEstablishmentCode" integer NOT NULL,
        "issuingPointCode" integer NOT NULL,
        "resolutionNumber" integer,
        "accounting" "establishment_accounting_enum",
        "photoId" uuid,
        "environmentType" integer NOT NULL,
        "typeIssue" integer NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_establishment_id" PRIMARY KEY ("id")
      )
    `)

    // Índices
    await queryRunner.query(`
      CREATE INDEX "IDX_establishment_ruc" ON "establishment" ("ruc")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_establishment_tradeName" ON "establishment" ("tradeName")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_establishment_resolutionNumber" ON "establishment" ("resolutionNumber")
    `)

    // FK
    await queryRunner.query(`
      ALTER TABLE "establishment"
      ADD CONSTRAINT "FK_establishment_photoId"
      FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE SET NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "establishment" DROP CONSTRAINT "FK_establishment_photoId"
    `)
    await queryRunner.query(`DROP INDEX "IDX_establishment_resolutionNumber"`)
    await queryRunner.query(`DROP INDEX "IDX_establishment_tradeName"`)
    await queryRunner.query(`DROP INDEX "IDX_establishment_ruc"`)
    await queryRunner.query(`DROP TABLE "establishment"`)
    await queryRunner.query(`DROP TYPE "establishment_accounting_enum"`)
  }
}
