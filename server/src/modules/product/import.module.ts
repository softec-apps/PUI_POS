import { Module } from '@nestjs/common'
import { BulkProductImportService } from '@/modules/product/import.service'
import { BulkProductImportController } from '@/modules/product/import.controller'

import { UsersModule } from '@/modules/users/users.module'
import { BrandModule } from '@/modules/brand/brand.module'
import { ProductModule } from '@/modules/product/product.module'
import { SupplierModule } from '@/modules/suppliers/supplier.module'
import { CategoriesModule } from '@/modules/categories/categories.module'
import { TemplateProductModule } from '@/modules/template/templates.module'
import { KardexModule } from '@/modules/kardex/kardex.module'

@Module({
  imports: [
    ProductModule,
    CategoriesModule,
    BrandModule,
    SupplierModule,
    TemplateProductModule,
    UsersModule,
    KardexModule,
  ],
  controllers: [BulkProductImportController],
  providers: [BulkProductImportService],
  exports: [BulkProductImportService],
})
export class ImportProductModule {}
