import { forwardRef, Module } from '@nestjs/common'
import { BrandModule } from '@/modules/brand/brand.module'
import { SupplierService } from '@/modules/suppliers/supplier.service'
import { SupplierController } from '@/modules/suppliers/supplier.controller'
import { RelationalSupplierPersistenceModule } from '@/modules/suppliers/infrastructure/persistence/relational/relational-persistence.module'

const infrastructurePersistenceModule = RelationalSupplierPersistenceModule

@Module({
  imports: [infrastructurePersistenceModule, forwardRef(() => BrandModule)],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService, infrastructurePersistenceModule],
})
export class SupplierModule {}
