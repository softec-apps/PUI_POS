import { EntityManager } from 'typeorm'

import {
  SortTemplateDto,
  FilterTemplateDto,
} from '@/modules/template/dto/query-template.dto'
import { Template } from '@/modules/template/domain/template'

import { NullableType } from '@/utils/types/nullable.type'
import { DeepPartial } from '@/utils/types/deep-partial.type'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { Category } from '@/modules/categories/domain/category'

export abstract class TemplateRepository {
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterTemplateDto | null
    sortOptions?: SortTemplateDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{ data: Template[]; totalCount: number; totalRecords: number }>

  abstract findById(id: Template['id']): Promise<Template | null>

  abstract findByIds(ids: Template['id'][]): Promise<Template[]>

  abstract findByField<K extends keyof Template>(
    field: K,
    value: K extends 'category' ? Category['id'] : Template[K],
  ): Promise<NullableType<Template>>

  abstract createTemplateWithoutRelaction(
    data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>,
    entityManager: EntityManager,
  ): Promise<Template>

  abstract createRelationTemplateToAtributes(
    templateId: string,
    atributeIds: string[],
    entityManager: EntityManager,
  ): Promise<void>

  abstract deleteRelationTemplateToAttributes(
    templateId: string,
    entityManager: EntityManager,
  ): Promise<void>

  abstract update(
    id: Template['id'],
    payload: DeepPartial<Template>,
    entityManager: EntityManager,
  ): Promise<Template>

  abstract softDelete(
    id: Template['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract hardDelete(
    id: Template['id'],
    entityManager: EntityManager,
  ): Promise<void>
}
