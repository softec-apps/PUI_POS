import { EntityManager } from 'typeorm'
import {
  SortEstablishmentDto,
  FilterEstablishmentDto,
} from '@/modules/establishment/dto/query-establishment.dto'
import { Establishment } from '@/modules/establishment/domain/establishment'
import { NullableType } from '@/utils/types/nullable.type'
import { DeepPartial } from '@/utils/types/deep-partial.type'
import { IPaginationOptions } from '@/utils/types/pagination-options'

export abstract class EstablishmentRepository {
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterEstablishmentDto | null
    sortOptions?: SortEstablishmentDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: Establishment[]
    totalCount: number
    totalRecords: number
  }>

  abstract findById(
    id: Establishment['id'],
  ): Promise<NullableType<Establishment>>

  abstract findByIds(ids: Establishment['id'][]): Promise<Establishment[]>

  abstract findByField<K extends keyof Establishment>(
    field: K,
    value: Establishment[K],
  ): Promise<NullableType<Establishment>>

  abstract create(
    data: Omit<Establishment, 'id' | 'createdAt' | 'updatedAt' | ' deletedAt'>,
    entityManager: EntityManager,
  ): Promise<Establishment>

  abstract update(
    id: Establishment['id'],
    payload: DeepPartial<Establishment>,
    entityManager: EntityManager,
  ): Promise<Establishment>

  abstract softDelete(
    id: Establishment['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract restore(
    id: Establishment['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract hardDelete(
    id: Establishment['id'],
    entityManager: EntityManager,
  ): Promise<void>
}
