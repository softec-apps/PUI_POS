import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateEstablishmentTable1756682965891
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET timezone = 'UTC'`)

    // Enum para accounting
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'establishment_accounting_enum') THEN
          CREATE TYPE "establishment_accounting_enum" AS ENUM ('SI', 'NO');
        END IF;
      END $$;
    `)

    // Enum para environmentType
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'establishment_environmentType_enum') THEN
          CREATE TYPE "establishment_environmentType_enum" AS ENUM ('1', '2');
        END IF;
      END $$;
    `)

    // Tabla
    await queryRunner.query(` 
      CREATE TABLE "establishment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ruc" varchar(13) NOT NULL UNIQUE,
        "companyName" varchar(300) NOT NULL,
        "tradeName" varchar(300),
        "parentEstablishmentAddress" varchar(300) NOT NULL,
        "accounting" "establishment_accounting_enum" NOT NULL,
        "photoId" uuid,
        "environmentType" "establishment_environmentType_enum",
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

    // FK
    await queryRunner.query(`
      ALTER TABLE "establishment"
      ADD CONSTRAINT "FK_establishment_photoId"
      FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "establishment" DROP CONSTRAINT "FK_establishment_photoId"
    `)
    await queryRunner.query(`DROP INDEX "IDX_establishment_tradeName"`)
    await queryRunner.query(`DROP INDEX "IDX_establishment_ruc"`)
    await queryRunner.query(`DROP TABLE "establishment"`)
    await queryRunner.query(`DROP TYPE "establishment_environmentType_enum"`)
    await queryRunner.query(`DROP TYPE "establishment_accounting_enum"`)
  }
}
