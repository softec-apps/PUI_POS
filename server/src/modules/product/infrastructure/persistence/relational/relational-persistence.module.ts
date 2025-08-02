import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductRepository } from '@/modules/product/infrastructure/persistence/product.repository'
import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product.entity'
import { SupplierEntity } from '@/modules/suppliers/infrastructure/persistence/relational/entities/supplier.entity'
import { CategoryEntity } from '@/modules/categories/infrastructure/persistence/relational/entities/category.entity'
import { BrandEntity } from '@/modules/brand/infrastructure/persistence/relational/entities/brand.entity'
import { FileEntity } from '@/modules/files/infrastructure/persistence/relational/entities/file.entity'
import { TemplateEntity } from '@/modules/template/infrastructure/persistence/relational/entities/template.entity'
import { ProductRelationalRepository } from '@/modules/product/infrastructure/persistence/relational/repositories/product.repository'
import { KardexEntity } from '@/modules/kardex/infrastructure/persistence/relational/entities/kardex.entity'
import { UserEntity } from '@/modules/users/infrastructure/persistence/relational/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      SupplierEntity,
      CategoryEntity,
      BrandEntity,
      KardexEntity,
      UserEntity,
      FileEntity,
      TemplateEntity,
    ]),
  ],
  providers: [
    {
      provide: ProductRepository,
      useClass: ProductRelationalRepository,
    },
  ],
  exports: [ProductRepository],
})
export class RelationalProductPersistenceModule {}
