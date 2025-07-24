import { EntityManager } from 'typeorm'
import {
  SortProductDto,
  FilterProductDto,
} from '@/modules/product/dto/query-product.dto'
import { Product } from '@/modules/product/domain/product'
import { NullableType } from '@/utils/types/nullable.type'
import { DeepPartial } from '@/utils/types/deep-partial.type'
import { IPaginationOptions } from '@/utils/types/pagination-options'

export abstract class ProductRepository {
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterProductDto | null
    sortOptions?: SortProductDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{ data: Product[]; totalCount: number; totalRecords: number }>

  abstract findById(id: Product['id']): Promise<NullableType<Product>>

  abstract findByIds(ids: Product['id'][]): Promise<Product[]>

  abstract findByField<K extends keyof Product>(
    field: K,
    value: Product[K],
  ): Promise<NullableType<Product>>

  abstract create(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | ' deletedAt'>,
    entityManager: EntityManager,
  ): Promise<Product>

  abstract update(
    id: Product['id'],
    payload: DeepPartial<Product>,
    entityManager: EntityManager,
  ): Promise<Product>

  abstract softDelete(
    id: Product['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract restore(
    id: Product['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract hardDelete(
    id: Product['id'],
    entityManager: EntityManager,
  ): Promise<void>
}
