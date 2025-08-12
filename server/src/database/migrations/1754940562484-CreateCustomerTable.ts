import {
  CustomerType,
  IdentificationType,
} from '@/modules/customer/customer.enum'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCustomerTable1754940562484 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET timezone = 'UTC'`)

    await queryRunner.query(`
      CREATE TYPE "customer_type_enum" AS ENUM ('${Object.values(CustomerType).join("','")}');
      CREATE TYPE "identification_type_enum" AS ENUM ('${Object.values(IdentificationType).join("','")}');
                  
      CREATE TABLE "customer" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customerType" "customer_type_enum" NOT NULL DEFAULT '${CustomerType.REGULAR}',
        "identificationType" "identification_type_enum" NOT NULL,
        "identificationNumber" character varying(13) NOT NULL,
        "firstName" character varying,
        "lastName" character varying,
        "email" character varying,
        "phone" character varying,
        "address" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_customer_id" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX "UQ_customer_identification" ON "customer" ("identificationNumber");
      CREATE INDEX "IDX_customer_customerType" ON "customer" ("customerType");
      CREATE INDEX "IDX_customer_identificationType" ON "customer" ("identificationType");
      CREATE INDEX "IDX_customer_firstName" ON "customer" ("firstName");
      CREATE INDEX "IDX_customer_lastName" ON "customer" ("lastName");
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "IDX_customer_lastName";
      DROP INDEX "IDX_customer_firstName";
      DROP INDEX "IDX_customer_identificationType";
      DROP INDEX "IDX_customer_customerType";
      DROP INDEX "UQ_customer_identification";
      DROP TABLE "customer";
      DROP TYPE "identification_type_enum";
      DROP TYPE "customer_type_enum";
    `)
  }
}
