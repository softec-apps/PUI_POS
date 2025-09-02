import { forwardRef, Module } from '@nestjs/common'
import { FilesModule } from '@/modules/files/files.module'
import { BillingModule } from '@/modules/factuZen/billing.module'
import { EstablishmentService } from '@/modules/establishment/establishment.service'
import { EstablishmentController } from '@/modules/establishment/establishment.controller'
import { RelationalEstablishmentPersistenceModule } from '@/modules/establishment/infrastructure/persistence/relational/relational-persistence.module'

const infrastructurePersistenceModule = RelationalEstablishmentPersistenceModule

@Module({
  imports: [
    infrastructurePersistenceModule,
    FilesModule,
    forwardRef(() => BillingModule),
  ],
  controllers: [EstablishmentController],
  providers: [EstablishmentService],
  exports: [EstablishmentService, infrastructurePersistenceModule],
})
export class EstablishmentModule {}
