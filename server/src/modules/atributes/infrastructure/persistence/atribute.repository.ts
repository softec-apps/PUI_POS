import { EntityManager } from 'typeorm'
import {
  SortAtributeDto,
  FilterAtributeDto,
} from '@/modules/atributes/dto/query-atribute.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { DeepPartial } from '@/utils/types/deep-partial.type'
import { Atribute } from '@/modules/atributes/domain/atribute'
import { IPaginationOptions } from '@/utils/types/pagination-options'

export abstract class AtributeRepository {
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterAtributeDto | null
    sortOptions?: SortAtributeDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{ data: Atribute[]; totalCount: number; totalRecords: number }>

  abstract findById(id: Atribute['id']): Promise<NullableType<Atribute>>

  abstract findByIds(ids: Atribute['id'][]): Promise<NullableType<Atribute[]>>

  abstract findByField<K extends keyof Atribute>(
    field: K,
    value: Atribute[K],
    options?: { withDeleted?: boolean },
  ): Promise<NullableType<Atribute>>

  abstract create(
    data: Omit<Atribute, 'id' | 'createdAt' | 'updatedAt'>,
    entityManager: EntityManager,
  ): Promise<Atribute>

  abstract update(
    id: Atribute['id'],
    payload: DeepPartial<Atribute>,
    entityManager: EntityManager,
  ): Promise<Atribute>

  abstract hardDelete(
    id: Atribute['id'],
    entityManager: EntityManager,
  ): Promise<void>
}
