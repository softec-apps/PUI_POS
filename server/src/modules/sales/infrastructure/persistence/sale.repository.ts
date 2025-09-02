import { EntityManager } from 'typeorm'
import { Sale } from '@/modules/sales/domain/sale'
import { NullableType } from '@/utils/types/nullable.type'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { SortSaleDto, FilterSaleDto } from '@/modules/sales/dto/query-sale.dto'
import { DeepPartial } from '@/utils/types/deep-partial.type'

export abstract class SaleRepository {
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterSaleDto | null
    sortOptions?: SortSaleDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{ data: Sale[]; totalCount: number; totalRecords: number }>

  abstract findById(id: Sale['id']): Promise<NullableType<Sale>>

  abstract findByIds(ids: Sale['id'][]): Promise<Sale[]>

  abstract findByField<K extends keyof Sale>(
    field: K,
    value: Sale[K] | string,
  ): Promise<NullableType<Sale>>

  abstract create(
    data: Omit<Sale, 'id' | 'createdAt'>,
    entityManager: EntityManager,
  ): Promise<Sale>

  abstract update(
    id: Sale['id'],
    payload: DeepPartial<Sale>,
    entityManager: EntityManager,
  ): Promise<Sale>
}
