import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EstablishmentRepository } from '@/modules/establishment/infrastructure/persistence/establishment.repository'
import { FileEntity } from '@/modules/files/infrastructure/persistence/relational/entities/file.entity'
import { EstablishmentEntity } from '@/modules/establishment/infrastructure/persistence/relational/entities/establishment.entity'
import { EstablishmentRelationalRepository } from '@/modules/establishment/infrastructure/persistence/relational/repositories/establishment.repository'

@Module({
  imports: [TypeOrmModule.forFeature([EstablishmentEntity, FileEntity])],
  providers: [
    {
      provide: EstablishmentRepository,
      useClass: EstablishmentRelationalRepository,
    },
  ],
  exports: [EstablishmentRepository],
})
export class RelationalEstablishmentPersistenceModule {}
