import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCategories1750172301057 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("SET timezone = 'UTC'")

    await queryRunner.query(`
      CREATE TYPE "category_status_enum" AS ENUM ('active', 'inactive')
    `)
    await queryRunner.query(`
      CREATE TABLE "category" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying UNIQUE,
        "description" character varying,
        "photoId" uuid,
        "status" "category_status_enum" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_category_id" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_category_name" ON "category" ("name")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_category_status" ON "category" ("status")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_category_deletedAt" ON "category" ("deletedAt")
    `)
    await queryRunner.query(`
      ALTER TABLE "category" ADD CONSTRAINT "FK_category_photoId"
      FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT "FK_category_photoId"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_category_deletedAt"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_category_status"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_category_name"`)
    await queryRunner.query(`DROP TABLE "category"`)
    await queryRunner.query(`DROP TYPE "category_status_enum"`)
  }
}
