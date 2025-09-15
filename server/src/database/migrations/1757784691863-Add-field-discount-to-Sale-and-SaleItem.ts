import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFieldDiscountToSaleAndSaleItem1757784691863
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add discountAmount field to sale table (money discount)
    await queryRunner.query(`
            ALTER TABLE "sale" 
            ADD COLUMN "discountAmount" numeric(13,6) NOT NULL DEFAULT 0,
            ADD CONSTRAINT "CHK_sale_discountAmount" CHECK ("discountAmount" >= 0)
        `)

    // Add discount fields to sale_item table (both money and percentage)
    await queryRunner.query(`
            ALTER TABLE "sale_item" 
            ADD COLUMN "discountAmount" numeric(13,6) NOT NULL DEFAULT 0,
            ADD COLUMN "discountPercentage" numeric(5,2) NOT NULL DEFAULT 0,
            ADD CONSTRAINT "CHK_sale_item_discountAmount" CHECK ("discountAmount" >= 0),
            ADD CONSTRAINT "CHK_sale_item_discountPercentage" CHECK ("discountPercentage" >= 0 AND "discountPercentage" <= 100)
        `)

    // Update the total calculation to include discount
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_sale_totals()
            RETURNS TRIGGER AS $$
            BEGIN
                -- Calculate subtotal from items (totalPrice - discountAmount)
                NEW."subtotal" := COALESCE((
                    SELECT SUM("totalPrice" - "discountAmount")
                    FROM "sale_item" 
                    WHERE "saleId" = NEW.id
                ), 0);
                
                -- Apply sale-level discount
                NEW."subtotal" := GREATEST(NEW."subtotal" - NEW."discount", 0);
                
                -- Calculate tax amount
                NEW."taxAmount" := NEW."subtotal" * (NEW."taxRate" / 100.0);
                
                -- Calculate final total
                NEW."total" := NEW."subtotal" + NEW."taxAmount";
                
                -- Update total items count
                NEW."totalItems" := COALESCE((
                    SELECT SUM("quantity")
                    FROM "sale_item" 
                    WHERE "saleId" = NEW.id
                ), 0);
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove discount fields from sale table
    await queryRunner.query(`
            ALTER TABLE "sale" 
            DROP CONSTRAINT IF EXISTS "CHK_sale_discountAmount",
            DROP COLUMN IF EXISTS "discount"
        `)

    // Remove discount fields from sale_item table
    await queryRunner.query(`
            ALTER TABLE "sale_item" 
            DROP CONSTRAINT IF EXISTS "CHK_sale_item_discountAmount",
            DROP CONSTRAINT IF EXISTS "CHK_sale_item_discountPercentage",
            DROP COLUMN IF EXISTS "discountAmount",
            DROP COLUMN IF EXISTS "discountPercentage"
        `)

    // Restore original total calculation function
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_sale_totals()
            RETURNS TRIGGER AS $$
            BEGIN
                -- Calculate subtotal from items
                NEW."subtotal" := COALESCE((
                    SELECT SUM("totalPrice")
                    FROM "sale_item" 
                    WHERE "saleId" = NEW.id
                ), 0);
                
                -- Calculate tax amount
                NEW."taxAmount" := NEW."subtotal" * (NEW."taxRate" / 100.0);
                
                -- Calculate final total
                NEW."total" := NEW."subtotal" + NEW."taxAmount";
                
                -- Update total items count
                NEW."totalItems" := COALESCE((
                    SELECT SUM("quantity")
                    FROM "sale_item" 
                    WHERE "saleId" = NEW.id
                ), 0);
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `)
  }
}
