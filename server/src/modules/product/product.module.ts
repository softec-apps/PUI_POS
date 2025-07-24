import { forwardRef, Module } from '@nestjs/common'
import { ProductService } from '@/modules/product/product.service'
import { ProductController } from '@/modules/product/product.controller'
import { SupplierModule } from '@/modules/suppliers/supplier.module'
import { BrandModule } from '@/modules/brand/brand.module'
import { CategoriesModule } from '@/modules/categories/categories.module'
import { TemplateProductModule } from '@/modules/template/templates.module'
import { RelationalProductPersistenceModule } from '@/modules/product/infrastructure/persistence/relational/relational-persistence.module'

const infrastructurePersistenceModule = RelationalProductPersistenceModule

@Module({
  imports: [
    infrastructurePersistenceModule,
    forwardRef(() => SupplierModule),
    forwardRef(() => BrandModule),
    forwardRef(() => CategoriesModule),
    forwardRef(() => TemplateProductModule),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService, infrastructurePersistenceModule],
})
export class ProductModule {}
