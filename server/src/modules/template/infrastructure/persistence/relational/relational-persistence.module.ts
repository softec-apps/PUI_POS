import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TemplateRepository } from '@/modules/template/infrastructure/persistence/template.repository'
import { TemplateEntity } from '@/modules/template/infrastructure/persistence/relational/entities/template.entity'
import { AtributeEntity } from '@/modules/atributes/infrastructure/persistence/relational/entities/atribute.entity'
import { CategoryEntity } from '@/modules/categories/infrastructure/persistence/relational/entities/category.entity'
import { TemplateRelationalRepository } from '@/modules/template/infrastructure/persistence/relational/repositories/template.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([TemplateEntity, AtributeEntity, CategoryEntity]),
  ],
  providers: [
    {
      provide: TemplateRepository,
      useClass: TemplateRelationalRepository,
    },
  ],
  exports: [TemplateRepository],
})
export class RelationalTemplatePersistenceModule {}
