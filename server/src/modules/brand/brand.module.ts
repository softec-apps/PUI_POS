import { forwardRef, Module } from '@nestjs/common'
import { BrandService } from '@/modules/brand/brand.service'
import { BrandController } from '@/modules/brand/brand.controller'
import { SupplierModule } from '@/modules/suppliers/supplier.module'
import { RelationalBrandPersistenceModule } from '@/modules/brand/infrastructure/persistence/relational/relational-persistence.module'

const infrastructurePersistenceModule = RelationalBrandPersistenceModule

@Module({
  imports: [infrastructurePersistenceModule, forwardRef(() => SupplierModule)],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService, infrastructurePersistenceModule],
})
export class BrandModule {}
