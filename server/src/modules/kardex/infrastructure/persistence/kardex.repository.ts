import { EntityManager } from 'typeorm'
import {
  SortKardexDto,
  FilterKardexDto,
} from '@/modules/kardex/dto/query-kardex.dto'
import { Kardex } from '@/modules/kardex/domain/kardex'
import { NullableType } from '@/utils/types/nullable.type'
import { IPaginationOptions } from '@/utils/types/pagination-options'

export abstract class KardexRepository {
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterKardexDto | null
    sortOptions?: SortKardexDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{ data: Kardex[]; totalCount: number; totalRecords: number }>

  abstract findLatestByProductWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterKardexDto | null
    sortOptions?: SortKardexDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{ data: Kardex[]; totalCount: number; totalRecords: number }>

  abstract findById(id: Kardex['id']): Promise<NullableType<Kardex>>

  abstract findByIds(ids: Kardex['id'][]): Promise<Kardex[]>

  abstract findByField<K extends keyof Kardex>(
    field: K,
    value: Kardex[K],
  ): Promise<NullableType<Kardex>>

  abstract create(
    data: Omit<Kardex, 'id' | 'createdAt' | 'updatedAt'>,
    entityManager: EntityManager,
  ): Promise<Kardex>
}
