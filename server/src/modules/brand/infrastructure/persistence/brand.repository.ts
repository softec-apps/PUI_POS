import { EntityManager } from 'typeorm'
import {
  SortBrandDto,
  FilterBrandDto,
} from '@/modules/brand/dto/query-brand.dto'
import { Brand } from '@/modules/brand/domain/brand'
import { NullableType } from '@/utils/types/nullable.type'
import { DeepPartial } from '@/utils/types/deep-partial.type'
import { IPaginationOptions } from '@/utils/types/pagination-options'

export abstract class BrandRepository {
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterBrandDto | null
    sortOptions?: SortBrandDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{ data: Brand[]; totalCount: number; totalRecords: number }>

  abstract findById(id: Brand['id']): Promise<NullableType<Brand>>

  abstract findByIds(ids: Brand['id'][]): Promise<Brand[]>

  abstract findByField<K extends keyof Brand>(
    field: K,
    value: Brand[K],
  ): Promise<NullableType<Brand>>

  abstract create(
    data: Omit<Brand, 'id' | 'createdAt' | 'updatedAt' | ' deletedAt'>,
    entityManager: EntityManager,
  ): Promise<Brand>

  abstract update(
    id: Brand['id'],
    payload: DeepPartial<Brand>,
    entityManager: EntityManager,
  ): Promise<Brand>

  abstract softDelete(
    id: Brand['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract restore(id: Brand['id'], entityManager: EntityManager): Promise<void>

  abstract hardDelete(
    id: Brand['id'],
    entityManager: EntityManager,
  ): Promise<void>
}
