import { EntityManager } from 'typeorm'
import {
  SortSupplierDto,
  FilterSupplierDto,
} from '@/modules/suppliers/dto/query-supplier.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { DeepPartial } from '@/utils/types/deep-partial.type'
import { Supplier } from '@/modules/suppliers/domain/supplier'
import { IPaginationOptions } from '@/utils/types/pagination-options'

export abstract class SupplierRepository {
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterSupplierDto | null
    sortOptions?: SortSupplierDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{ data: Supplier[]; totalCount: number; totalRecords: number }>

  abstract findById(id: Supplier['id']): Promise<NullableType<Supplier>>

  abstract findByIds(ids: Supplier['id'][]): Promise<Supplier[]>

  abstract findByField<K extends keyof Supplier>(
    field: K,
    value: Supplier[K],
  ): Promise<NullableType<Supplier>>

  abstract create(
    data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | ' deletedAt'>,
    entityManager: EntityManager,
  ): Promise<Supplier>

  abstract update(
    id: Supplier['id'],
    payload: DeepPartial<Supplier>,
    entityManager: EntityManager,
  ): Promise<Supplier>

  abstract softDelete(
    id: Supplier['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract restore(
    id: Supplier['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract hardDelete(
    id: Supplier['id'],
    entityManager: EntityManager,
  ): Promise<void>
}
