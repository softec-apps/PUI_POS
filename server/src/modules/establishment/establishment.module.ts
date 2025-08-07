import { Module } from '@nestjs/common'
import { FilesModule } from '@/modules/files/files.module'
import { EstablishmentService } from '@/modules/establishment/establishment.service'
import { EstablishmentController } from '@/modules/establishment/establishment.controller'
import { RelationalEstablishmentPersistenceModule } from '@/modules/establishment/infrastructure/persistence/relational/relational-persistence.module'

const infrastructurePersistenceModule = RelationalEstablishmentPersistenceModule

@Module({
  imports: [infrastructurePersistenceModule, FilesModule],
  controllers: [EstablishmentController],
  providers: [EstablishmentService],
  exports: [EstablishmentService, infrastructurePersistenceModule],
})
export class EstablishmentModule {}
