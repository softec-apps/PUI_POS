import { EntityManager } from 'typeorm'
import {
  SortCustomerDto,
  FilterCustomerDto,
} from '@/modules/customer/dto/query-customer.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { Customer } from '@/modules/customer/domain/customer'
import { DeepPartial } from '@/utils/types/deep-partial.type'
import { IPaginationOptions } from '@/utils/types/pagination-options'

export abstract class CustomerRepository {
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterCustomerDto | null
    sortOptions?: SortCustomerDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{ data: Customer[]; totalCount: number; totalRecords: number }>

  abstract findById(id: Customer['id']): Promise<NullableType<Customer>>

  abstract findByIds(ids: Customer['id'][]): Promise<Customer[]>

  abstract findByField<K extends keyof Customer>(
    field: K,
    value: Customer[K],
  ): Promise<NullableType<Customer>>

  abstract create(
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | ' deletedAt'>,
    entityManager: EntityManager,
  ): Promise<Customer>

  abstract update(
    id: Customer['id'],
    payload: DeepPartial<Customer>,
    entityManager: EntityManager,
  ): Promise<Customer>

  abstract softDelete(
    id: Customer['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract restore(
    id: Customer['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract hardDelete(
    id: Customer['id'],
    entityManager: EntityManager,
  ): Promise<void>
}
